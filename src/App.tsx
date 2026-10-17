import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIdleTimer } from "./hooks/useIdleTimer";
import { useAudioEngine } from "./hooks/useAudioEngine";
import { usePlayerStore } from "./stores/usePlayerStore";
import { cn } from "./lib/utils";
import { FolderOpen, Film, Play, Pause } from "lucide-react";
import { TopHeader } from "./components/hud/TopHeader";
import { ControlBar } from "./components/hud/ControlBar";
import { InspectorDeck } from "./components/drawer/InspectorDeck";
import { ChaptersDeck } from "./components/drawer/ChaptersDeck";
import { CompactLibrary } from "./components/library/CompactLibrary";
import { QueueDrawer } from "./components/library/QueueDrawer";
import { StreamModal } from "./components/library/StreamModal";
import { importSubtitleFile } from "./lib/subtitleScanner";
import { INITIAL_VIDEOS } from "./components/library/defaultMedia";
import { generateMediaThumbnail, generateMediaStoryboard } from "./lib/thumbnailGenerator";
import { SettingsModal } from "./components/settings/SettingsModal";
import { useSettingsStore } from "./stores/useSettingsStore";

export default function App() {
  const { isIdle, resetTimer } = useIdleTimer({ timeoutMs: 2500 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoViewportRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [centerFeedback, setCenterFeedback] = useState<"play" | "pause" | null>(null);

  const {
    isPlaying,
    isLooping,
    isScrubbing,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    currentMedia,
    seekRequest,
    isFullscreen,
    subtitles,
    subtitleSettings,
    videoSettings,
    playbackDeckSettings,
    osdMessage,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setBufferedTime,
    setCurrentMedia,
    updateCurrentMedia,
    togglePlay,
    clearSeek,
    skipTime,
    setVolume,
    toggleMute,
    toggleFullscreen,
    setIsFullscreen,
    toggleLibrary,
    toggleQueue,
    toggleChapters,
    decrementSleepTimer,
    clearOsd,
    showOsd,
    addSubtitleTrack,
    autoDiscoverSubtitles,
    toggleSubtitleSync,
    queue,
    playNextTrack,
    playPreviousTrack,
    recordMediaProgress,
  } = usePlayerStore();

  // Attach Web Audio API engine for delay and 10-band equalizer
  useAudioEngine(videoRef.current);

  // Auto-dismiss OSD notifications after 1.8 seconds
  useEffect(() => {
    if (osdMessage) {
      const timeout = setTimeout(() => {
        clearOsd();
      }, 1800);
      return () => clearTimeout(timeout);
    }
  }, [osdMessage, clearOsd]);

  // Initialize saved theme and accent CSS variables on startup
  useEffect(() => {
    useSettingsStore.getState().applyThemeToDom();
  }, []);

  // Sleep timer interval countdown
  useEffect(() => {
    if (playbackDeckSettings.sleepTimerRemainingSecs !== null) {
      const interval = setInterval(() => {
        decrementSleepTimer();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [playbackDeckSettings.sleepTimerRemainingSecs, decrementSleepTimer]);

  // Load a file into player
  const handleFile = useCallback(
    (file: File) => {
      if (!file) return;
      const subtitleExts = [".srt", ".vtt", ".ass", ".ssa", ".sub"];
      if (subtitleExts.some((ext) => file.name.toLowerCase().endsWith(ext))) {
        importSubtitleFile(file).then(({ track, cues }) => {
          addSubtitleTrack(track, cues, true);
          showOsd(`Loaded Subtitle: ${file.name} (${cues.length} cues)`);
        });
        return;
      }

      const url = URL.createObjectURL(file);
      const isAudio =
        file.type.startsWith("audio/") ||
        file.name.match(/\.(mp3|flac|wav|aac|ogg|m4a|wma|opus)$/i);

      setCurrentMedia({
        id: file.name,
        title: file.name,
        src: url,
        type: isAudio ? "music" : "video",
      });
      setIsPlaying(true);
      autoDiscoverSubtitles(url, file.name);

      if (!isAudio) {
        generateMediaThumbnail(file).then((thumb) => {
          if (thumb) {
            updateCurrentMedia({ thumbnail: thumb });
          }
        });
        generateMediaStoryboard(file);
      }
    },
    [setCurrentMedia, updateCurrentMedia, setIsPlaying, addSubtitleTrack, autoDiscoverSubtitles, showOsd]
  );

  const syncVideoDuration = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    if (video.duration === Infinity) {
      // Known Chromium Blob URL duration bug fix
      video.currentTime = 1e101;
      const onFix = () => {
        video.removeEventListener("timeupdate", onFix);
        video.currentTime = 0;
        if (isFinite(video.duration) && video.duration > 0) {
          setDuration(video.duration);
        }
      };
      video.addEventListener("timeupdate", onFix, { once: true });
    } else if (isFinite(video.duration) && video.duration > 0) {
      setDuration(video.duration);
    }
  }, [setDuration]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    const subtitleExts = [".srt", ".vtt", ".ass", ".ssa", ".sub"];
    const isSubtitle = (f: File) =>
      subtitleExts.some((ext) => f.name.toLowerCase().endsWith(ext));

    const mediaFiles = files.filter((f) => !isSubtitle(f));
    const subtitleFiles = files.filter(isSubtitle);

    // If media file dropped:
    if (mediaFiles.length > 0) {
      handleFile(mediaFiles[0]);
    }

    // If subtitle file(s) dropped:
    for (const subFile of subtitleFiles) {
      try {
        const { track, cues } = await importSubtitleFile(subFile);
        addSubtitleTrack(track, cues, true);
        showOsd(`Loaded Subtitles: ${subFile.name} (${cues.length} cues)`);
      } catch (err) {
        console.warn("Failed parsing dropped subtitle:", err);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Robust seek coordination for hardware-accelerated video playback
  const isSeekingRef = useRef(false);
  const seekTimeoutRef = useRef<number | null>(null);

  const performMainSeek = useCallback((targetTime: number, isFast = false) => {
    const video = videoRef.current;
    if (!video || !isFinite(targetTime) || targetTime < 0) return;

    isSeekingRef.current = true;
    if (seekTimeoutRef.current !== null) {
      clearTimeout(seekTimeoutRef.current);
    }
    // Safety release in case browser drops onSeeked or takes longer
    seekTimeoutRef.current = window.setTimeout(() => {
      isSeekingRef.current = false;
    }, 600);

    try {
      if (isFast && "fastSeek" in video && typeof (video as any).fastSeek === "function") {
        (video as any).fastSeek(targetTime);
      } else {
        video.currentTime = targetTime;
      }
    } catch {
      video.currentTime = targetTime;
    }
  }, []);

  const handleMainSeeked = useCallback(() => {
    if (seekTimeoutRef.current !== null) {
      clearTimeout(seekTimeoutRef.current);
      seekTimeoutRef.current = null;
    }
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (video && isFinite(video.currentTime)) {
      setCurrentTime(video.currentTime);
    }
  }, [setCurrentTime]);

  // Sync seekRequest from store (e.g. from ThickSeekBar, forward/rewind buttons, or hotkeys)
  useEffect(() => {
    if (seekRequest !== null && videoRef.current) {
      performMainSeek(seekRequest, isScrubbing);
      clearSeek();
    }
  }, [seekRequest, isScrubbing, performMainSeek, clearSeek]);

  // Ensure exact frame accuracy when scrubbing finishes
  const prevScrubbingRef = useRef(isScrubbing);
  useEffect(() => {
    if (prevScrubbingRef.current && !isScrubbing && videoRef.current) {
      if (isFinite(currentTime) && currentTime >= 0) {
        try {
          videoRef.current.currentTime = currentTime;
        } catch {
          // Ignored
        }
      }
    }
    prevScrubbingRef.current = isScrubbing;
  }, [isScrubbing, currentTime]);

  // Sync video play/pause with player store
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Autoplay or play prevented:", err);
          });
        }
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isPlaying, currentMedia?.src]);

  // Sync volume and mute state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.min(1, Math.max(0, volume));
    video.muted = isMuted;
  }, [volume, isMuted]);

  // Sync playback rate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  // Synchronize fullscreen state with DOM
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [setIsFullscreen]);

  // Handle toggle fullscreen action
  useEffect(() => {
    if (isFullscreen && !document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else if (!isFullscreen && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [isFullscreen]);

  // Listen for Pause on Minimize setting
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && useSettingsStore.getState().general.pauseOnMinimize) {
        if (usePlayerStore.getState().isPlaying) {
          setIsPlaying(false);
          triggerCenterFeedback("pause");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [setIsPlaying]);

  // Dynamic Global Hotkey Dispatcher (Fully responsive to remapped settings & custom intervals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when focusing text inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      resetTimer();

      // Check Preferences shortcut (Ctrl+, or Cmd+,)
      if ((e.ctrlKey || e.metaKey) && (e.key === "," || e.code === "Comma")) {
        e.preventDefault();
        useSettingsStore.getState().toggleSettings();
        return;
      }

      // Build key combo representation (e.g., "Space", "Shift+KeyL", "ArrowLeft")
      const parts: string[] = [];
      if (e.ctrlKey) parts.push("Control");
      if (e.altKey) parts.push("Alt");
      if (e.shiftKey) parts.push("Shift");
      if (e.metaKey) parts.push("Meta");
      parts.push(e.code);
      const combo = parts.join("+");

      const settings = useSettingsStore.getState();
      const hotkey = settings.hotkeys.find((h) => h.combo === combo);

      const showFeedback = (badge: string) => {
        if (settings.controls.showOsdHotkeyBadge) {
          showOsd(badge);
        }
      };

      const seekStepMed = settings.controls.seekStepMedium || 10;
      const seekStepShort = settings.controls.seekStepShort || 5;
      const maxVol = (settings.audio.maxVolumeBoost || 125) / 100;

      if (hotkey) {
        e.preventDefault();
        switch (hotkey.id) {
          case "toggle_play":
            triggerCenterFeedback(!isPlaying ? "play" : "pause");
            togglePlay();
            showFeedback(`[${hotkey.displayCombo}] ${!isPlaying ? "Playing" : "Paused"}`);
            return;
          case "rewind_10s":
            skipTime(-seekStepMed);
            showFeedback(`[${hotkey.displayCombo}] Rewind ${seekStepMed}s`);
            return;
          case "forward_10s":
            skipTime(seekStepMed);
            showFeedback(`[${hotkey.displayCombo}] Forward ${seekStepMed}s`);
            return;
          case "rewind_5s":
            skipTime(-seekStepShort);
            showFeedback(`[${hotkey.displayCombo}] Rewind ${seekStepShort}s`);
            return;
          case "forward_5s":
            skipTime(seekStepShort);
            showFeedback(`[${hotkey.displayCombo}] Forward ${seekStepShort}s`);
            return;
          case "volume_up": {
            const nextVol = Math.min(maxVol, volume + 0.05);
            setVolume(nextVol);
            showFeedback(`[${hotkey.displayCombo}] Volume: ${Math.round(nextVol * 100)}%`);
            return;
          }
          case "volume_down": {
            const nextVol = Math.max(0, volume - 0.05);
            setVolume(nextVol);
            showFeedback(`[${hotkey.displayCombo}] Volume: ${Math.round(nextVol * 100)}%`);
            return;
          }
          case "toggle_mute":
            toggleMute();
            showFeedback(`[${hotkey.displayCombo}] ${!isMuted ? "Muted" : "Unmuted"}`);
            return;
          case "toggle_fullscreen":
            toggleFullscreen();
            showFeedback(`[${hotkey.displayCombo}] ${!isFullscreen ? "Fullscreen" : "Windowed"}`);
            return;
          case "next_track":
            playNextTrack();
            showFeedback(`[${hotkey.displayCombo}] Next Video`);
            return;
          case "prev_track":
            playPreviousTrack();
            showFeedback(`[${hotkey.displayCombo}] Previous Video`);
            return;
          case "toggle_inspector":
            usePlayerStore.getState().toggleDeckTab("audio");
            showFeedback(`[${hotkey.displayCombo}] Inspector`);
            return;
          case "toggle_chapters":
            toggleChapters();
            showFeedback(`[${hotkey.displayCombo}] Chapters`);
            return;
          case "toggle_library":
            toggleLibrary();
            showFeedback(`[${hotkey.displayCombo}] Media Library`);
            return;
          case "toggle_queue":
            toggleQueue();
            showFeedback(`[${hotkey.displayCombo}] Playlist Queue`);
            return;
          case "toggle_settings":
            useSettingsStore.getState().toggleSettings();
            showFeedback(`[${hotkey.displayCombo}] Preferences`);
            return;
          case "toggle_subtitle_sync":
            toggleSubtitleSync();
            showFeedback(`[${hotkey.displayCombo}] Subtitle Matcher`);
            return;
        }
      }

      // Safe ergonomic fallbacks if hotkeys were unbound
      if (e.code === "Space") {
        e.preventDefault();
        triggerCenterFeedback(!isPlaying ? "play" : "pause");
        togglePlay();
      } else if (e.code === "Escape") {
        if (isFullscreen) toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPlaying,
    volume,
    isMuted,
    isFullscreen,
    togglePlay,
    skipTime,
    setVolume,
    toggleMute,
    toggleFullscreen,
    toggleLibrary,
    toggleQueue,
    toggleChapters,
    toggleSubtitleSync,
    playNextTrack,
    playPreviousTrack,
    resetTimer,
    showOsd,
  ]);

  const triggerCenterFeedback = (action: "play" | "pause") => {
    setCenterFeedback(action);
    setTimeout(() => setCenterFeedback(null), 500);
  };

  const handleVideoClick = () => {
    triggerCenterFeedback(!isPlaying ? "play" : "pause");
    togglePlay();
  };

  const handleVideoDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const action = useSettingsStore.getState().controls.doubleClickAction;
    if (action === "fullscreen") {
      toggleFullscreen();
    } else if (action === "playPause") {
      triggerCenterFeedback(!isPlaying ? "play" : "pause");
      togglePlay();
    }
  };

  // Non-passive wheel event listener on the video viewport to prevent "Unable to preventDefault inside passive event listener invocation"
  useEffect(() => {
    const el = videoViewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const action = useSettingsStore.getState().controls.mouseWheelAction;
      if (action === "volume") {
        const maxVol = (useSettingsStore.getState().audio.maxVolumeBoost || 125) / 100;
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        const currentVol = usePlayerStore.getState().volume;
        const nextVol = Math.max(0, Math.min(maxVol, currentVol + delta));
        setVolume(nextVol);
        if (useSettingsStore.getState().controls.showOsdHotkeyBadge) {
          showOsd(`Volume: ${Math.round(nextVol * 100)}%`);
        }
      } else if (action === "seek") {
        const step = useSettingsStore.getState().controls.seekStepShort || 5;
        const delta = e.deltaY < 0 ? step : -step;
        skipTime(delta);
        if (useSettingsStore.getState().controls.showOsdHotkeyBadge) {
          showOsd(`${delta > 0 ? "Forward" : "Rewind"} ${Math.abs(delta)}s`);
        }
      } else if (action === "zoom") {
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        const currentZoom = videoSettings.zoom;
        const nextZoom = Math.max(0.5, Math.min(3.0, currentZoom + delta));
        usePlayerStore.getState().setVideoSettings?.({ zoom: nextZoom });
        if (useSettingsStore.getState().controls.showOsdHotkeyBadge) {
          showOsd(`Zoom: ${Math.round(nextZoom * 100)}%`);
        }
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setVolume, skipTime, showOsd, videoSettings.zoom]);

  const loadDemoSample = () => {
    setCurrentMedia(INITIAL_VIDEOS[0]);

    // Auto-discover subtitle tracks (English .srt, Spanish .srt, Japanese .vtt)
    autoDiscoverSubtitles("/demo-sample.mp4", "demo-sample.mp4");
    setIsPlaying(true);
  };

  // Find currently active subtitle cue based on playback timestamp and subtitle delay offset
  const effectiveSubtitleTime = currentTime - subtitleSettings.delay / 1000;
  const activeCue =
    subtitleSettings.selectedTrackId !== ""
      ? subtitles.find(
          (cue) =>
            effectiveSubtitleTime >= cue.startTime &&
            effectiveSubtitleTime <= cue.endTime
        )
      : null;

  // Build aspect-ratio container style
  const getAspectRatioStyle = (): React.CSSProperties => {
    switch (videoSettings.aspectRatio) {
      case "16:9":
        return { aspectRatio: "16 / 9", width: "100%", height: "auto", maxHeight: "100%" };
      case "4:3":
        return { aspectRatio: "4 / 3", width: "auto", height: "100%", maxWidth: "100%" };
      case "21:9":
        return { aspectRatio: "21 / 9", width: "100%", height: "auto", maxHeight: "100%" };
      case "1:1":
        return { aspectRatio: "1 / 1", width: "auto", height: "100%", maxWidth: "100%" };
      case "fill":
        return { width: "100%", height: "100%" };
      case "original":
      default:
        return { width: "100%", height: "100%" };
    }
  };

  // Build video CSS transform & filter styles
  const videoTransform = `scale(${videoSettings.zoom}) scaleX(${
    videoSettings.flipHorizontal ? -1 : 1
  }) scaleY(${videoSettings.flipVertical ? -1 : 1}) rotate(${videoSettings.rotation}deg) translateZ(0)`;

  const videoFilter = `brightness(${videoSettings.brightness}%) contrast(${
    videoSettings.contrast
  }%) saturate(${videoSettings.saturation}%) hue-rotate(${videoSettings.hue}deg)`;

  return (
    <div
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative w-screen h-screen bg-[#0D0D11] text-[#F4F4F7] overflow-hidden select-none",
        isIdle ? "cursor-none" : "cursor-default"
      )}
    >
      {/* Top Ambient Header */}
      <TopHeader isIdle={isIdle} videoElement={videoRef.current} />

      {/* Floating Heads-Up OSD Notification Badge */}
      <AnimatePresence>
        {osdMessage && playbackDeckSettings.osdNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 py-2 rounded-2xl bg-[#16161E]/95 border border-[#262635] shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex items-center gap-2.5"
          >
            <div className="w-2 h-2 rounded-full bg-[#FF5C00] shadow-[0_0_8px_rgba(255,92,0,0.9)] animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-[#F4F4F7]">
              {osdMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edge-to-Edge Hardware-Accelerated Video Viewport */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-black overflow-hidden">
        {currentMedia?.src ? (
          <div
            ref={videoViewportRef}
            className="relative flex items-center justify-center overflow-hidden"
            style={getAspectRatioStyle()}
            onDoubleClick={handleVideoDoubleClick}
          >
            <video
              ref={videoRef}
              src={currentMedia.src}
              loop={isLooping}
              autoPlay={isPlaying}
              className={cn(
                "pointer-events-auto transition-transform duration-100 ease-out",
                videoSettings.aspectRatio === "fill" ? "w-full h-full object-cover" : "w-full h-full object-contain"
              )}
              style={{
                transform: videoTransform,
                filter: videoFilter,
                willChange: "transform, filter",
              }}
              onCanPlay={() => {
                const video = videoRef.current;
                if (video && isPlaying && video.paused) {
                  const playPromise = video.play();
                  if (playPromise !== undefined) {
                    playPromise.catch((err) => {
                      console.warn("Playback attempt on canplay prevented:", err);
                    });
                  }
                }
              }}
              onLoadedData={() => {
                syncVideoDuration(videoRef.current);
                const video = videoRef.current;
                if (video && isPlaying && video.paused) {
                  const playPromise = video.play();
                  if (playPromise !== undefined) {
                    playPromise.catch((err) => {
                      console.warn("Playback attempt on loadeddata prevented:", err);
                    });
                  }
                }
              }}
              onSeeking={() => {
                isSeekingRef.current = true;
              }}
              onSeeked={handleMainSeeked}
              onPlay={() => {
                setIsPlaying(true);
                syncVideoDuration(videoRef.current);
              }}
              onTimeUpdate={() => {
                const video = videoRef.current;
                if (video && !isScrubbing && !video.seeking && !isSeekingRef.current) {
                  const ct = video.currentTime;
                  setCurrentTime(ct);
                  if (duration <= 0) {
                    syncVideoDuration(video);
                  }
                  if (currentMedia && video.duration) {
                    recordMediaProgress(
                      currentMedia.id || currentMedia.title || currentMedia.src,
                      ct,
                      video.duration
                    );
                  }
                }
              }}
              onLoadedMetadata={() => {
                syncVideoDuration(videoRef.current);
              }}
              onDurationChange={() => {
                syncVideoDuration(videoRef.current);
              }}
              onProgress={() => {
                const video = videoRef.current;
                if (video && video.buffered.length > 0) {
                  setBufferedTime(video.buffered.end(video.buffered.length - 1));
                }
              }}
              onEnded={() => {
                if (isLooping && videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play().catch(() => {});
                } else if (
                  useSettingsStore.getState().playback.autoPlayNextInQueue &&
                  queue.length > 0
                ) {
                  playNextTrack();
                } else {
                  setIsPlaying(false);
                }
              }}
              onClick={handleVideoClick}
            />

            {/* In-Canvas Live Subtitle Cue Renderer */}
            <AnimatePresence>
              {activeCue && (
                <motion.div
                  key={activeCue.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none select-none max-w-[85%] z-20 px-4 py-1.5 rounded-lg"
                  style={{
                    bottom: `${subtitleSettings.verticalPosition}%`,
                    fontFamily: subtitleSettings.fontFamily || useSettingsStore.getState().subtitles.defaultFontFamily,
                    fontSize:
                      subtitleSettings.sizeMode === "relative"
                        ? `${(subtitleSettings.relativeSize / 100) * 1.6}rem`
                        : `${subtitleSettings.preciseSize * 1.3}pt`,
                    color: subtitleSettings.textColor || useSettingsStore.getState().subtitles.defaultTextColor,
                    backgroundColor: subtitleSettings.backgroundColor,
                    textShadow:
                      (subtitleSettings.outlineWidth ?? useSettingsStore.getState().subtitles.defaultOutlineWidth) > 0
                        ? `0 0 ${(subtitleSettings.outlineWidth ?? useSettingsStore.getState().subtitles.defaultOutlineWidth) * 2}px #000, 0 0 ${subtitleSettings.outlineWidth ?? useSettingsStore.getState().subtitles.defaultOutlineWidth}px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`
                        : "0 2px 10px rgba(0,0,0,0.9)",
                    lineHeight: 1.3,
                  }}
                >
                  {activeCue.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center Play/Pause Flash Animation Feedback */}
            {centerFeedback && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className="w-20 h-20 rounded-full bg-[#16161E]/80 border border-[#262635] backdrop-blur-md flex items-center justify-center animate-ping duration-300">
                  {centerFeedback === "play" ? (
                    <Play
                      className="w-10 h-10 fill-current ml-1"
                      style={{ color: "var(--dynamic-accent, #FF5C00)" }}
                    />
                  ) : (
                    <Pause
                      className="w-10 h-10 fill-current"
                      style={{ color: "var(--dynamic-accent, #FF5C00)" }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty Landing Viewport / Drag-and-Drop Dropzone */
          <div
            className={cn(
              "flex flex-col items-center justify-center p-10 text-center max-w-lg transition-all duration-300 rounded-3xl border border-dashed",
              isDragOver
                ? "border-[var(--dynamic-accent,#FF5C00)] bg-[var(--dynamic-accent-dim,rgba(255,92,0,0.1))] scale-102 glow-orange"
                : "border-[#262635] bg-[#16161E]/80 backdrop-blur-md shadow-2xl"
            )}
          >
            <div className="relative mb-6">
              <div
                className="absolute -inset-6 rounded-full blur-2xl animate-pulse"
                style={{ backgroundColor: "var(--dynamic-accent-glow, rgba(255,92,0,0.25))" }}
              />
              <img
                src="/src/assets/vlc-cone.svg"
                alt="VLC Reborn"
                className="relative w-28 h-28 drop-shadow-[0_12px_24px_var(--dynamic-accent-glow,rgba(255,92,0,0.35))] transition-transform hover:scale-105 duration-200"
              />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#F4F4F7] mb-2">
              VLC Reborn
            </h1>
            <p className="text-sm text-[#8A8A9E] mb-6 leading-relaxed max-w-sm">
              Drop media files anywhere to initiate hardware-accelerated playback, or load a sample video to preview the new UI.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-[0_4px_20px_var(--dynamic-accent-glow,rgba(255,92,0,0.35))] hover:shadow-[0_6px_24px_var(--dynamic-accent-glow,rgba(255,92,0,0.5))] active:scale-98 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, var(--dynamic-accent, #FF5C00), var(--dynamic-accent-hover, #FF7526))",
                }}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open Media File</span>
              </button>

              <button
                type="button"
                onClick={loadDemoSample}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F1F2B] hover:bg-[#2A2A3B] text-[#F4F4F7] text-sm font-medium border border-[#262635] hover:border-[#3A3A4E] transition-all cursor-pointer group"
              >
                <Film
                  className="w-4 h-4 transition-transform group-hover:scale-110"
                  style={{ color: "var(--dynamic-accent, #FF5C00)" }}
                />
                <span>Load Sample Video</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* In-Video Non-Disruptive Compact Media Library Drawer (Left side) */}
      <CompactLibrary />

      {/* Reorderable Floating Queue Drawer (Right side) */}
      <QueueDrawer />

      {/* Network Stream URL Dialog */}
      <StreamModal />

      {/* Unified 10-Domain Preferences & Settings Modal (Phase 5) */}
      <SettingsModal />

      {/* Slide-Out Inspector Deck (Framer Motion spring panel on the right) */}
      <InspectorDeck />

      {/* Floating Chapters Deck */}
      <ChaptersDeck />

      {/* Floating Bottom Control Bar (Grouped controls, thick seekbar, cone volume, deck triggers) */}
      <ControlBar isIdle={isIdle} />
    </div>
  );
}

