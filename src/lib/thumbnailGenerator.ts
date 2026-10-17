/**
 * High-performance browser-native video thumbnail & storyboard extraction.
 * Extracts representative frames and storyboards from local video files or URLs using an offscreen canvas.
 */

export interface StoryboardFrame {
  time: number;
  dataUrl: string;
}

// Global in-memory cache for media storyboards and decoded scrub frames
const storyboardCache = new Map<string, StoryboardFrame[]>();

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

  // Update or insert frame
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
    video.crossOrigin = "anonymous";

    let isDone = false;

    const cleanup = () => {
      if (isDone) return;
      isDone = true;
      clearTimeout(timeoutId);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      video.src = "";
      video.load();
      if (createdLocalUrl) {
        URL.revokeObjectURL(url);
      }
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      resolve(undefined);
    }, 4000);

    const onError = () => {
      cleanup();
      resolve(undefined);
    };

    const onSeeked = () => {
      try {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          const canvas = document.createElement("canvas");
          canvas.width = 320;
          canvas.height = Math.round((320 * video.videoHeight) / video.videoWidth);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
            cacheStoryboardFrame(url, video.currentTime, dataUrl);
            cleanup();
            resolve(dataUrl);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed drawing thumbnail frame:", err);
      }
      cleanup();
      resolve(undefined);
    };

    const onLoadedData = () => {
      try {
        const target =
          video.duration && isFinite(video.duration) && video.duration > 0
            ? Math.min(seekTimeSecs, Math.max(0.5, video.duration * 0.15))
            : seekTimeSecs;
        video.currentTime = target;
      } catch {
        cleanup();
        resolve(undefined);
      }
    };

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    video.src = url;
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
    video.crossOrigin = "anonymous";

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
      video.src = "";
      video.load();
      if (createdLocalUrl) {
        URL.revokeObjectURL(url);
      }
    };

    const safetyTimeout = setTimeout(() => {
      cleanup();
      storyboardCache.set(sourceKey, frames);
      resolve(frames);
    }, 8000);

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
  });
}
