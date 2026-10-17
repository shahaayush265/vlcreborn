/**
 * High-performance video thumbnail & storyboard extraction.
 * Supports native desktop acceleration in Tauri (via ffmpeg) as well as
 * WebKitGTK/Blink-compatible HTML5 offscreen canvas extraction for blob URLs.
 */

export interface StoryboardFrame {
  time: number;
  dataUrl: string;
}

// Global in-memory cache for media storyboards and decoded scrub frames
const storyboardCache = new Map<string, StoryboardFrame[]>();

export function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
}

/**
 * Retrieve the nearest cached frame for a given media source and timestamp.
 */
export function getNearestStoryboardFrame(
  sourceUrl: string,
  targetTime: number,
  maxDistanceSec: number = 3.0
): StoryboardFrame | undefined {
  if (!sourceUrl) return undefined;
  const frames = storyboardCache.get(sourceUrl);
  if (!frames || frames.length === 0) return undefined;

  let closest: StoryboardFrame | undefined = undefined;
  let minDiff = Infinity;

  for (let i = 0; i < frames.length; i++) {
    const diff = Math.abs(frames[i].time - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closest = frames[i];
    }
  }

  if (minDiff <= maxDistanceSec) {
    return closest;
  }
  return undefined;
}

/**
 * Store a dynamically decoded frame into the storyboard cache for instant future lookups.
 */
export function cacheStoryboardFrame(
  sourceUrl: string,
  time: number,
  dataUrl: string
): void {
  if (!sourceUrl || !dataUrl || !isFinite(time)) return;
  let frames = storyboardCache.get(sourceUrl);
  if (!frames) {
    frames = [];
    storyboardCache.set(sourceUrl, frames);
  }

  const existingIdx = frames.findIndex((f) => Math.abs(f.time - time) < 0.25);
  if (existingIdx >= 0) {
    frames[existingIdx] = { time, dataUrl };
  } else {
    frames.push({ time, dataUrl });
    if (frames.length > 80) {
      frames.shift();
    }
    frames.sort((a, b) => a.time - b.time);
  }
}

/**
 * Extract a single representative thumbnail frame from a video.
 */
export async function generateMediaThumbnail(
  source: File | string,
  seekTimeSecs: number = 1.5
): Promise<string | undefined> {
  // If it's a File and known to be audio, skip frame extraction
  if (source instanceof File) {
    const isAudio =
      source.type.startsWith("audio/") ||
      source.name.match(/\.(mp3|flac|wav|aac|ogg|m4a|wma|opus)$/i);
    if (isAudio) return undefined;
  }

  // 1. Fast Native Desktop Extraction (Tauri + ffmpeg) if file path exists
  const rawPath =
    typeof source === "string"
      ? (source.startsWith("file://")
          ? decodeURIComponent(source.replace(/^file:\/\//, ""))
          : (!source.startsWith("http") && !source.startsWith("blob:") ? source : undefined))
      : ((source as any).path || (source as any).webkitRelativePath || undefined);

  if (rawPath && isTauriEnvironment()) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const nativeThumb = await invoke<string>("extract_thumbnail_native", {
        filePath: rawPath,
        seekTimeSecs,
      });
      if (nativeThumb && nativeThumb.startsWith("data:image/")) {
        const cacheKey = typeof source === "string" ? source : source.name;
        cacheStoryboardFrame(cacheKey, seekTimeSecs, nativeThumb);
        return nativeThumb;
      }
    } catch {
      // Fall through to HTML5 canvas extraction
    }
  }

  // 2. High-Compatibility HTML5 Offscreen Video Extractor (WebKitGTK & Chromium)
  return new Promise((resolve) => {
    let createdLocalUrl = false;
    let url: string;

    if (typeof source === "string") {
      url = source;
    } else {
      url = URL.createObjectURL(source);
      createdLocalUrl = true;
    }

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    // CRITICAL: Only set crossOrigin on remote HTTP/HTTPS URLs.
    // In WebKitGTK / Safari, setting crossOrigin on a blob: or local URL fails with a security CORS error.
    if (typeof source === "string" && (source.startsWith("http://") || source.startsWith("https://"))) {
      video.crossOrigin = "anonymous";
    }

    // CRITICAL: WebKitGTK requires the video element to be attached to the document DOM
    // to allocate the GStreamer video rendering sink and decode frame buffers.
    video.style.position = "fixed";
    video.style.top = "-9999px";
    video.style.left = "-9999px";
    video.style.width = "16px";
    video.style.height = "16px";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    document.body.appendChild(video);

    let isDone = false;

    const cleanup = () => {
      if (isDone) return;
      isDone = true;
      clearTimeout(timeoutId);
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("loadeddata", onDataReady);
      video.removeEventListener("canplay", onDataReady);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      video.pause();
      video.src = "";
      video.load();
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
      if (createdLocalUrl) {
        URL.revokeObjectURL(url);
      }
    };

    const timeoutId = setTimeout(() => {
      // Last-chance attempt before timeout
      if (!tryCapture()) {
        cleanup();
        resolve(undefined);
      }
    }, 6000);

    const onError = () => {
      cleanup();
      resolve(undefined);
    };

    const tryCapture = (): boolean => {
      if (isDone) return false;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (vw > 0 && vh > 0) {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 320;
          canvas.height = Math.max(1, Math.round((320 * vh) / vw));
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            if (dataUrl && dataUrl.length > 200 && dataUrl !== "data:,") {
              const cacheKey = typeof source === "string" ? source : source.name;
              cacheStoryboardFrame(cacheKey, video.currentTime, dataUrl);
              cleanup();
              resolve(dataUrl);
              return true;
            }
          }
        } catch (err) {
          console.warn("Failed drawing thumbnail frame:", err);
        }
      }
      return false;
    };

    let hasSought = false;
    const seekToDesiredTime = () => {
      if (hasSought || isDone) return;
      hasSought = true;
      try {
        const dur = video.duration;
        const target =
          dur && isFinite(dur) && dur > 0
            ? Math.min(seekTimeSecs, Math.max(0.1, dur * 0.15))
            : seekTimeSecs;

        if (Math.abs(video.currentTime - target) < 0.05) {
          onSeeked();
        } else {
          video.currentTime = target;
        }
      } catch {
        tryCapture();
      }
    };

    const onSeeked = () => {
      requestAnimationFrame(() => {
        if (!tryCapture()) {
          setTimeout(() => {
            if (!tryCapture()) {
              // WebKitGTK preroll tick: brief play to force decoder frame flush
              const p = video.play();
              if (p !== undefined) {
                p.then(() => {
                  video.pause();
                  tryCapture();
                }).catch(() => {});
              }
            }
          }, 80);
        }
      });
    };

    const onMetadata = () => {
      if (isDone) return;
      seekToDesiredTime();
    };

    const onDataReady = () => {
      if (isDone) return;
      if (!hasSought) {
        seekToDesiredTime();
      } else {
        tryCapture();
      }
    };

    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("loadeddata", onDataReady);
    video.addEventListener("canplay", onDataReady);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    video.src = url;
    video.load();

    // Start muted play tick to initiate WebKitGTK pipeline decoding
    const initPlay = video.play();
    if (initPlay !== undefined) {
      initPlay.then(() => {
        if (video.currentTime >= 0.1) {
          video.pause();
        }
      }).catch(() => {});
    }
  });
}

/**
 * Generate a background storyboard of keyframes across the video duration
 * for instant, buttery-smooth seekbar hover and scrubbing previews.
 */
export async function generateMediaStoryboard(
  source: File | string,
  durationHint?: number,
  frameCount: number = 20
): Promise<StoryboardFrame[]> {
  const isAudio =
    source instanceof File
      ? source.type.startsWith("audio/") ||
        source.name.match(/\.(mp3|flac|wav|aac|ogg|m4a|wma|opus)$/i)
      : false;
  if (isAudio) return [];

  const sourceKey = typeof source === "string" ? source : source.name;
  const existing = storyboardCache.get(sourceKey);
  if (existing && existing.length >= frameCount / 2) {
    return existing;
  }

  return new Promise((resolve) => {
    let createdLocalUrl = false;
    let url: string;

    if (typeof source === "string") {
      url = source;
    } else {
      url = URL.createObjectURL(source);
      createdLocalUrl = true;
    }

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    if (typeof source === "string" && (source.startsWith("http://") || source.startsWith("https://"))) {
      video.crossOrigin = "anonymous";
    }

    video.style.position = "fixed";
    video.style.top = "-9999px";
    video.style.left = "-9999px";
    video.style.width = "16px";
    video.style.height = "16px";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    document.body.appendChild(video);

    const frames: StoryboardFrame[] = [];
    let currentIndex = 0;
    let targetTimes: number[] = [];
    let isCleanedUp = false;

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      clearTimeout(safetyTimeout);
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      video.pause();
      video.src = "";
      video.load();
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
      if (createdLocalUrl) {
        URL.revokeObjectURL(url);
      }
    };

    const safetyTimeout = setTimeout(() => {
      cleanup();
      storyboardCache.set(sourceKey, frames);
      resolve(frames);
    }, 10000);

    const onError = () => {
      cleanup();
      resolve(frames);
    };

    const canvas = document.createElement("canvas");
    canvas.width = 176;
    canvas.height = 99;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });

    const captureFrame = () => {
      if (!ctx || video.videoWidth === 0) return;
      try {
        canvas.height = Math.round((176 * video.videoHeight) / video.videoWidth);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        frames.push({
          time: video.currentTime,
          dataUrl,
        });
        cacheStoryboardFrame(sourceKey, video.currentTime, dataUrl);
      } catch {
        // Ignored
      }
    };

    const seekNext = () => {
      if (currentIndex >= targetTimes.length) {
        cleanup();
        storyboardCache.set(sourceKey, frames);
        resolve(frames);
        return;
      }
      const nextTime = targetTimes[currentIndex];
      currentIndex++;
      try {
        if ("fastSeek" in video && typeof (video as any).fastSeek === "function") {
          (video as any).fastSeek(nextTime);
        } else {
          video.currentTime = nextTime;
        }
      } catch {
        video.currentTime = nextTime;
      }
    };

    const onSeeked = () => {
      captureFrame();
      seekNext();
    };

    const onMetadata = () => {
      const dur =
        video.duration && isFinite(video.duration) && video.duration > 0
          ? video.duration
          : durationHint || 0;
      if (dur <= 0) {
        cleanup();
        resolve(frames);
        return;
      }

      targetTimes = [];
      const step = dur / (frameCount + 1);
      for (let i = 1; i <= frameCount; i++) {
        targetTimes.push(i * step);
      }
      seekNext();
    };

    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.src = url;
    video.load();
  });
}
