import React, { useState, useRef, useCallback, useEffect } from "react";
import { Film } from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import {
  getNearestStoryboardFrame,
  cacheStoryboardFrame,
  generateMediaStoryboard,
} from "../../lib/thumbnailGenerator";

export const ThickSeekBar: React.FC = () => {
  const {
    currentTime,
    duration,
    bufferedTime,
    subtitles,
    subtitleSettings,
    chapters,
    currentMedia,
    isPlaying,
    setIsPlaying,
    seekTo,
    setIsScrubbing: setGlobalScrubbing,
  } = usePlayerStore();

  const barRef = useRef<HTMLDivElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    percent: number;
    time: number;
  } | null>(null);
  const [hasCanvasFrame, setHasCanvasFrame] = useState(false);

  // Seek and playback coordination refs
  const wasPlayingRef = useRef(false);
  const pendingSeekTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Dedicated non-blocking preview decoder refs
  const isPreviewSeekingRef = useRef(false);
  const pendingPreviewSeekRef = useRef<number | null>(null);

  // Background storyboard pre-warming when media changes
  useEffect(() => {
    if (currentMedia?.src && currentMedia.type !== "music") {
      generateMediaStoryboard(currentMedia.src, duration, 24);
    }
  }, [currentMedia?.src, duration]);

  // High-performance RAF throttle for video decoder seeking
  const scheduleSeek = useCallback(
    (targetTime: number) => {
      pendingSeekTimeRef.current = targetTime;
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (pendingSeekTimeRef.current !== null) {
            seekTo(pendingSeekTimeRef.current);
            pendingSeekTimeRef.current = null;
          }
          rafIdRef.current = null;
        });
      }
    },
    [seekTo]
  );

  const calculateFractionFromEvent = useCallback((clientX: number) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const relativeX = clientX - rect.left;
    return Math.max(0, Math.min(1, relativeX / rect.width));
  }, []);

  // Helper to draw an image / dataUrl directly to preview canvas (0ms latency)
  const drawDataUrlToCanvas = useCallback((dataUrl: string) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasCanvasFrame(true);
      }
    };
    img.src = dataUrl;
  }, []);

  // Coordinated non-blocking seek dispatcher for the offscreen preview decoder
  const dispatchPreviewSeek = useCallback(
    (targetTime: number) => {
      const video = previewVideoRef.current;
      if (!video || !isFinite(targetTime) || targetTime < 0) return;

      if (isPreviewSeekingRef.current || video.seeking) {
        // Decoder is busy: store the most recent requested time to decode next
        pendingPreviewSeekRef.current = targetTime;
        return;
      }

      isPreviewSeekingRef.current = true;
      try {
        if ("fastSeek" in video && typeof (video as any).fastSeek === "function") {
          (video as any).fastSeek(targetTime);
        } else {
          video.currentTime = targetTime;
        }
      } catch {
        video.currentTime = targetTime;
      }
    },
    []
  );

  // When preview video finishes seeking, draw frame immediately to preview canvas & cache it
  const handlePreviewSeeked = useCallback(() => {
    const video = previewVideoRef.current;
    const canvas = previewCanvasRef.current;
    if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setHasCanvasFrame(true);

        if (currentMedia?.src) {
          try {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            cacheStoryboardFrame(currentMedia.src, video.currentTime, dataUrl);
          } catch {
            // Ignored
          }
        }
      }
    }

    isPreviewSeekingRef.current = false;

    // If another seek was requested while decoding, seek immediately to the latest one
    if (pendingPreviewSeekRef.current !== null) {
      const nextTime = pendingPreviewSeekRef.current;
      pendingPreviewSeekRef.current = null;
      dispatchPreviewSeek(nextTime);
    }
  }, [currentMedia?.src, dispatchPreviewSeek]);

  // Handle pointer down (click or drag start)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const effDuration = duration > 0 ? duration : currentMedia?.duration || 0;
    if (!effDuration || effDuration <= 0) return;
    e.preventDefault();
    barRef.current?.setPointerCapture(e.pointerId);

    // Pause temporarily during scrubbing to silence audio stutter & free decoder bandwidth
    wasPlayingRef.current = isPlaying;
    if (isPlaying) {
      setIsPlaying(false);
    }

    setIsScrubbing(true);
    setGlobalScrubbing(true);

    const fraction = calculateFractionFromEvent(e.clientX);
    const targetTime = fraction * effDuration;
    setScrubTime(targetTime);
    setHoverPosition({
      percent: fraction * 100,
      time: targetTime,
    });

    // Check storyboard cache for instant frame update
    if (currentMedia?.src) {
      const cached = getNearestStoryboardFrame(currentMedia.src, targetTime);
      if (cached) {
        drawDataUrlToCanvas(cached.dataUrl);
      }
    }

    dispatchPreviewSeek(targetTime);
    scheduleSeek(targetTime);
  };

  // Handle pointer move (hover or active drag)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const effDuration = duration > 0 ? duration : currentMedia?.duration || 0;
    if (!effDuration || effDuration <= 0) return;

    const fraction = calculateFractionFromEvent(e.clientX);
    const targetTime = fraction * effDuration;

    setHoverPosition({
      percent: fraction * 100,
      time: targetTime,
    });

    // 1. Instant display from storyboard cache (0ms latency!)
    if (currentMedia?.src) {
      const cached = getNearestStoryboardFrame(currentMedia.src, targetTime);
      if (cached) {
        drawDataUrlToCanvas(cached.dataUrl);
      }
    }

    // 2. Dispatch non-blocking live video seek to refine to exact frame
    dispatchPreviewSeek(targetTime);

    // 3. If scrubbing, update scrubTime and seek main video
    if (isScrubbing) {
      setScrubTime(targetTime);
      scheduleSeek(targetTime);
    }
  };

  // Handle pointer up (scrub release)
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      if (barRef.current?.hasPointerCapture(e.pointerId)) {
        barRef.current.releasePointerCapture(e.pointerId);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      const effDuration = duration > 0 ? duration : currentMedia?.duration || 0;
      const fraction = calculateFractionFromEvent(e.clientX);
      const finalTime = fraction * effDuration;

      // Final exact seek
      seekTo(finalTime);
      setIsScrubbing(false);
      setGlobalScrubbing(false);
      setScrubTime(null);

      // Resume playback seamlessly if it was playing before
      if (wasPlayingRef.current) {
        setIsPlaying(true);
      }
    }
  };

  const handlePointerLeave = () => {
    if (!isScrubbing) {
      setHoverPosition(null);
    }
  };

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const activeTime = isScrubbing && scrubTime !== null ? scrubTime : currentTime;
  const progressPercent = duration > 0 ? (activeTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (bufferedTime / duration) * 100 : 0;

  // Chapter active at hover time
  const hoveredChapter = hoverPosition
    ? chapters.find(
        (ch) =>
          hoverPosition.time >= ch.startTime && hoverPosition.time <= ch.endTime
      )
    : null;

  return (
    <div
      ref={barRef}
      id="vlc-seek-bar"
      onPointerDown={handlePointerDown}
      onPointerEnter={(e) => {
        const effDuration = duration > 0 ? duration : currentMedia?.duration || 0;
        if (!effDuration || effDuration <= 0) return;
        const fraction = calculateFractionFromEvent(e.clientX);
        const targetTime = fraction * effDuration;
        setHoverPosition({
          percent: fraction * 100,
          time: targetTime,
        });
        if (currentMedia?.src) {
          const cached = getNearestStoryboardFrame(currentMedia.src, targetTime);
          if (cached) {
            drawDataUrlToCanvas(cached.dataUrl);
          }
        }
        dispatchPreviewSeek(targetTime);
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onClick={(e) => e.stopPropagation()}
      className="relative flex-1 py-3 group cursor-pointer select-none touch-none"
    >
      {/* Hidden Offscreen Video Decoder for High-Speed Thumbnail Scrubbing */}
      {currentMedia?.src && currentMedia.type !== "music" && (
        <video
          ref={previewVideoRef}
          src={currentMedia.src}
          muted
          playsInline
          preload="auto"
          onSeeked={handlePreviewSeeked}
          className="hidden pointer-events-none"
        />
      )}

      {/* Floating Hover Thumbnail Preview Popover */}
      {hoverPosition && (
        <div
          id="seekbar-preview-thumbnail"
          className="absolute -top-36 z-40 pointer-events-none transform -translate-x-1/2 flex flex-col items-center"
          style={{
            left: `${Math.max(10, Math.min(90, hoverPosition.percent))}%`,
            transition: "none", // Zero lag: perfectly sticks to mouse cursor!
            willChange: "left",
          }}
        >
          <div className="relative w-44 rounded-2xl bg-[#161622]/95 border border-[#3A3A4E] shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden flex flex-col p-1.5">
            {/* Visual Thumbnail Screen */}
            <div className="relative w-full aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                width={176}
                height={99}
                className={hasCanvasFrame ? "w-full h-full object-cover" : "hidden"}
              />

              {/* Native Aesthetic Fallback when canvas hasn't decoded yet */}
              {!hasCanvasFrame && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1E1E2C] to-[#111118] text-[var(--dynamic-accent,#FF5C00)]/80">
                  {hoveredChapter?.thumbnail || currentMedia?.thumbnail ? (
                    <img
                      src={hoveredChapter?.thumbnail || currentMedia?.thumbnail}
                      alt="Scrub Preview"
                      className="w-full h-full object-cover opacity-85"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Film className="w-6 h-6 text-[var(--dynamic-accent,#FF5C00)]/60 animate-pulse" />
                      <span className="text-[8px] font-mono text-[#8A8A9E] mt-1 font-semibold uppercase tracking-wider">
                        PREVIEW
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp Pill Badge */}
              <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/85 border border-white/15 text-[11px] font-mono font-bold text-[#F4F4F7] shadow-lg">
                {formatDuration(hoverPosition.time)}
              </div>
            </div>

            {/* Chapter Title Badge if inside a chapter */}
            {hoveredChapter && (
              <div className="px-1.5 pt-1.5 pb-0.5 text-center">
                <p className="text-[10px] font-semibold text-[var(--dynamic-accent,#FF5C00)] truncate">
                  {hoveredChapter.title}
                </p>
              </div>
            )}
          </div>

          <div className="w-0 h-0 border-x-5 border-x-transparent border-t-5 border-t-[#3A3A4E]" />
        </div>
      )}

      {/* Track Container: Thick interactive bar with smooth expansion on hover */}
      <div className="relative w-full h-3.5 group-hover:h-5 bg-[#262635] rounded-full overflow-hidden transition-all duration-200">
        {/* Buffered Progress Bar */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-[#3F3F57]/60 rounded-full transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, bufferPercent))}%` }}
        />

        {/* Subtitle Cue Markers (shifted in real-time by subtitle delay offset) */}
        {subtitles.length > 0 && duration > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {subtitles.map((cue) => {
              const offsetSec = (subtitleSettings?.delay || 0) / 1000;
              const shiftedStart = cue.startTime + offsetSec;
              const shiftedEnd = cue.endTime + offsetSec;
              const left = (shiftedStart / duration) * 100;
              const width = Math.max(0.3, ((shiftedEnd - shiftedStart) / duration) * 100);
              return (
                <div
                  key={cue.id}
                  className="absolute top-0 bottom-0 bg-[var(--dynamic-accent,var(--accent-primary,#FF5C00))]/40 hover:bg-[var(--dynamic-accent,var(--accent-primary,#FF5C00))] transition-colors"
                  style={{
                    left: `${Math.max(0, Math.min(100, left))}%`,
                    width: `${Math.min(100 - left, width)}%`,
                  }}
                  title={`[${formatDuration(shiftedStart)}] ${cue.text}`}
                />
              );
            })}
          </div>
        )}

        {/* Chapter Notch Tick Markers on the Seekbar */}
        {chapters.length > 0 && duration > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {chapters.map((ch) => {
              const leftPercent = (ch.startTime / duration) * 100;
              if (leftPercent <= 0) return null;
              return (
                <div
                  key={ch.id}
                  className="absolute top-0 bottom-0 w-[2px] bg-white/70 shadow-[0_0_4px_rgba(255,255,255,0.7)] z-10"
                  style={{ left: `${leftPercent}%` }}
                  title={`${ch.title} (${formatDuration(ch.startTime)})`}
                />
              );
            })}
          </div>
        )}

        {/* Active Played Progress Bar: Zero-lag when scrubbing */}
        <div
          className="absolute top-0 bottom-0 left-0 rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, progressPercent))}%`,
            background: "linear-gradient(to right, var(--dynamic-accent-hover, #FF7A29), var(--dynamic-accent, #FF5C00))",
            boxShadow: "0 0 12px var(--dynamic-accent-glow, rgba(255,92,0,0.5))",
            transition: isScrubbing ? "none" : "width 120ms linear",
            willChange: isScrubbing ? "width" : "auto",
          }}
        />
      </div>

      {/* Scrubber Thumb Handle: Zero-lag tracking when scrubbing */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5.5 h-5.5 rounded-full bg-white border-2 pointer-events-none ${
          isScrubbing || hoverPosition
            ? "scale-125 opacity-100 ring-4"
            : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
        }`}
        style={{
          left: `${Math.min(100, Math.max(0, progressPercent))}%`,
          borderColor: "var(--dynamic-accent, #FF5C00)",
          boxShadow: "0 0 12px var(--dynamic-accent, rgba(255,92,0,0.7))",
          transition: isScrubbing
            ? "none"
            : "left 120ms linear, transform 150ms ease-out, opacity 150ms ease-out",
          willChange: isScrubbing ? "left" : "auto",
        }}
      />
    </div>
  );
};

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}
