import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Subtitles,
  AudioLines,
  SlidersHorizontal,
  ListMusic,
  FolderTree,
  Gauge,
  Bookmark,
  Settings as SettingsIcon,
  Sparkles,
  MoreHorizontal,
  X,
} from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { cn } from "../../lib/utils";
import { ThickSeekBar } from "./ThickSeekBar";
import { ConeVolume } from "./ConeVolume";
import { SubtitleTimeline } from "./SubtitleTimeline";
import { ContinueWatchingPrompt } from "./ContinueWatchingPrompt";

interface ControlBarProps {
  isIdle: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({ isIdle }) => {
  const prefRemainingTime = useSettingsStore((s) => s.interface.showRemainingTime);
  const seekStepMedium = useSettingsStore((s) => s.controls.seekStepMedium) || 10;
  const setInterface = useSettingsStore((s) => s.setInterface);

  const [showRemainingTime, setShowRemainingTime] = useState(prefRemainingTime);
  const [isHovered, setIsHovered] = useState(false);
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1120 : false
  );
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Sync if preference changes externally
  useEffect(() => {
    setShowRemainingTime(prefRemainingTime);
  }, [prefRemainingTime]);

  // Responsive screen listener to collapse extra buttons on smaller screens
  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth < 1120;
      setIsCompact(compact);
      if (!compact) {
        setIsMoreOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    currentMedia,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    skipTime,
    activeDeckTab,
    toggleDeckTab,
    isQueueOpen,
    toggleQueue,
    isLibraryOpen,
    toggleLibrary,
    chapters,
    isChaptersOpen,
    toggleChapters,
    subtitles,
    subtitleSettings,
    isSubtitleSyncOpen,
    toggleSubtitleSync,
    queue,
    currentQueueIndex,
    playNextTrack,
    playPreviousTrack,
    continueWatching,
  } = usePlayerStore();

  // Don't show the play controls when no file is opened
  if (!currentMedia) return null;

  const formattedCurrent = formatTime(currentTime);
  const formattedSecondary = showRemainingTime
    ? `-${formatTime(Math.max(0, duration - currentTime))}`
    : formatTime(duration);

  const hasActiveDrawer =
    Boolean(activeDeckTab) ||
    isQueueOpen ||
    isLibraryOpen ||
    isSubtitleSyncOpen ||
    isChaptersOpen;

  return (
    <div
      className={cn(
        "absolute bottom-6 left-0 right-0 z-50 px-6 flex flex-col items-center gap-2.5 transition-all duration-300 pointer-events-none select-none",
        isIdle && !isHovered && !isSubtitleSyncOpen && !continueWatching && !isMoreOpen
          ? "opacity-0 translate-y-6"
          : "opacity-100 translate-y-0"
      )}
    >
      {/* Floating Continue Watching Prompt (Anchored near center controls) */}
      <ContinueWatchingPrompt />

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-auto relative w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-6xl px-6 py-3.5 rounded-3xl bg-[#16161E]/95 border border-[#262635] backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col gap-2.5 transition-all duration-200"
      >
        {/* Expanded Visual Subtitle Matcher Deck */}
        {isSubtitleSyncOpen && (
          <SubtitleTimeline
            isExpanded={true}
            onClose={toggleSubtitleSync}
          />
        )}

        <div className="flex items-center gap-4 w-full">
          {/* Left: Grouped Playback Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Previous Video in Queue */}
            <button
              type="button"
              onClick={playPreviousTrack}
              className="p-2.5 rounded-xl text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] active:scale-95 transition-all cursor-pointer"
              title={`Previous Video in Queue (${((currentQueueIndex - 1 + queue.length) % (queue.length || 1)) + 1}/${queue.length || 1}) (P)`}
              aria-label="Previous Video in Queue"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Rewind (Anticlockwise symbol with dynamic configured step) */}
            <button
              type="button"
              onClick={() => skipTime(-seekStepMedium)}
              className="p-2.5 rounded-xl text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] active:scale-95 transition-all cursor-pointer group/rewind relative"
              title={`Rewind ${seekStepMedium}s (Left Arrow)`}
              aria-label={`Rewind ${seekStepMedium} seconds`}
            >
              <RotateCcw className="w-4 h-4 transition-transform group-hover/rewind:-rotate-45" />
            </button>

            {/* Primary Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex items-center justify-center w-11 h-11 rounded-full text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              style={{
                background: "linear-gradient(135deg, var(--dynamic-accent, #FF5C00), var(--dynamic-accent-hover, #FF7526))",
                boxShadow: "0 0 16px var(--dynamic-accent-glow, rgba(255,92,0,0.4))",
              }}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Forward (Clockwise symbol with dynamic configured step) */}
            <button
              type="button"
              onClick={() => skipTime(seekStepMedium)}
              className="p-2.5 rounded-xl text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] active:scale-95 transition-all cursor-pointer group/fwd relative"
              title={`Forward ${seekStepMedium}s (Right Arrow)`}
              aria-label={`Forward ${seekStepMedium} seconds`}
            >
              <RotateCw className="w-4 h-4 transition-transform group-hover/fwd:rotate-45" />
            </button>

            {/* Next Video in Queue */}
            <button
              type="button"
              onClick={playNextTrack}
              className="p-2.5 rounded-xl text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] active:scale-95 transition-all cursor-pointer"
              title={`Next Video in Queue (${((currentQueueIndex + 1) % (queue.length || 1)) + 1}/${queue.length || 1}) (N)`}
              aria-label="Next Video in Queue"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Monospace Timestamp / Total or Remaining Time */}
            <button
              type="button"
              onClick={() => {
                const next = !showRemainingTime;
                setShowRemainingTime(next);
                setInterface({ showRemainingTime: next });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#1F1F2B] text-xs font-mono font-medium text-[#8A8A9E] hover:text-[#F4F4F7] transition-colors cursor-pointer ml-1"
              title="Click to toggle Total vs Remaining time"
            >
              <span className="text-[#F4F4F7] font-semibold">{formattedCurrent}</span>
              <span className="text-[#8A8A9E]/60">/</span>
              <span>{formattedSecondary}</span>
            </button>
          </div>

          {/* Center: Seekbar Column with Subtitle Speech Rhythm Track */}
          <div className="flex-1 flex flex-col justify-center min-w-[120px]">
            {subtitles.length > 0 && !isSubtitleSyncOpen && (
              <div
                className="mb-0.5 cursor-pointer"
                onClick={toggleSubtitleSync}
                title="Click to open Visual Subtitle Matcher"
              >
                <SubtitleTimeline isExpanded={false} />
              </div>
            )}
            <ThickSeekBar />
          </div>

          {/* Right: Actions, Toggles, and Cone Volume */}
          <div className="flex items-center gap-2 shrink-0">
            {isCompact ? (
              /* Compact Screen Mode: Volume Slider + More Controls Dropdown Popover */
              <div className="flex items-center gap-2">
                <ConeVolume />

                <div className="w-px h-4 bg-[#262635] mx-0.5" />

                <button
                  type="button"
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={cn(
                    "relative flex items-center gap-1.5 p-2 px-2.5 rounded-xl border transition-all cursor-pointer",
                    isMoreOpen || hasActiveDrawer
                      ? "border-[var(--dynamic-accent,#FF5C00)] text-[var(--dynamic-accent,#FF5C00)] bg-[var(--dynamic-accent-dim)]"
                      : "border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                  title="Decks & Extra Controls"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  {hasActiveDrawer && (
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{
                        backgroundColor: "var(--dynamic-accent, #FF5C00)",
                        boxShadow: "0 0 6px var(--dynamic-accent, #FF5C00)",
                      }}
                    />
                  )}
                </button>
              </div>
            ) : (
              /* Standard Desktop Wide Mode: Full Control Deck Row */
              <div className="flex items-center gap-1.5">
                {/* Visual Subtitle Matcher Quick Trigger */}
                <button
                  type="button"
                  onClick={toggleSubtitleSync}
                  className={cn(
                    "relative p-2 rounded-xl border transition-all cursor-pointer",
                    isSubtitleSyncOpen
                      ? "bg-[var(--dynamic-accent-dim)] border-[var(--dynamic-accent)] text-[var(--dynamic-accent)]"
                      : subtitleSettings.delay !== 0
                      ? "bg-[var(--dynamic-accent-dim)]/50 border-[var(--dynamic-accent)]/40 text-[var(--dynamic-accent)]"
                      : "border-transparent text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                  style={
                    isSubtitleSyncOpen
                      ? { boxShadow: "0 0 14px var(--dynamic-accent-glow, rgba(255,92,0,0.35))" }
                      : undefined
                  }
                  title="Visual Subtitle Matcher & Alignment Tool"
                >
                  <Sparkles className="w-4 h-4" />
                  {subtitleSettings.delay !== 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: "var(--dynamic-accent, #FF5C00)",
                        boxShadow: "0 0 6px var(--dynamic-accent, #FF5C00)",
                      }}
                    />
                  )}
                </button>

                {/* Chapters Floating Window Toggle (If media has chapters) */}
                {chapters.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleChapters}
                    className={cn(
                      "relative p-2 rounded-xl border transition-all cursor-pointer",
                      isChaptersOpen
                        ? "bg-[var(--dynamic-accent-dim)] border-[var(--dynamic-accent)] text-[var(--dynamic-accent)]"
                        : "border-transparent text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                    )}
                    style={
                      isChaptersOpen
                        ? { boxShadow: "0 0 14px var(--dynamic-accent-glow, rgba(255,92,0,0.35))" }
                        : undefined
                    }
                    title={`Video Chapters (${chapters.length}) (C)`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                    <span
                      className="absolute -top-1 -right-1 px-1 min-w-3.5 h-3.5 text-[8px] font-mono font-bold rounded-full text-white flex items-center justify-center"
                      style={{ backgroundColor: "var(--dynamic-accent, #FF5C00)" }}
                    >
                      {chapters.length}
                    </span>
                  </button>
                )}

                {/* Subtitles Deck Tab Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDeckTab("subtitles")}
                  className={cn(
                    "p-2 rounded-xl border transition-all cursor-pointer",
                    activeDeckTab === "subtitles"
                      ? "bg-[var(--dynamic-accent-dim)] border-[var(--dynamic-accent)]/50 text-[var(--dynamic-accent)]"
                      : "border-transparent text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                  style={
                    activeDeckTab === "subtitles"
                      ? { boxShadow: "0 0 12px var(--dynamic-accent-glow, rgba(255,92,0,0.25))" }
                      : undefined
                  }
                  title="Subtitle Settings & Delay"
                >
                  <Subtitles className="w-4 h-4" />
                </button>

                {/* Audio Deck Tab Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDeckTab("audio")}
                  className={cn(
                    "p-2 rounded-xl border transition-all cursor-pointer",
                    activeDeckTab === "audio"
                      ? "bg-[var(--dynamic-accent-dim)] border-[var(--dynamic-accent)]/50 text-[var(--dynamic-accent)]"
                      : "border-transparent text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                  style={
                    activeDeckTab === "audio"
                      ? { boxShadow: "0 0 12px var(--dynamic-accent-glow, rgba(255,92,0,0.25))" }
                      : undefined
                  }
                  title="Audio Tracks & Equalizer"
                >
                  <AudioLines className="w-4 h-4" />
                </button>

                {/* Video Deck Tab Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDeckTab("video")}
                  className={cn(
                    "p-2 rounded-xl border transition-all cursor-pointer",
                    activeDeckTab === "video"
                      ? "bg-[var(--dynamic-accent-dim)] border-[var(--dynamic-accent)]/50 text-[var(--dynamic-accent)]"
                      : "border-transparent text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                  style={
                    activeDeckTab === "video"
                      ? { boxShadow: "0 0 12px var(--dynamic-accent-glow, rgba(255,92,0,0.25))" }
                      : undefined
                  }
                  title="Video Filters & Geometry"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                {/* Playback Deck Tab Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDeckTab("playback")}
                  className={cn(
                    "p-2 rounded-xl border transition-all cursor-pointer",
                    activeDeckTab === "playback"
                      ? "bg-[var(--dynamic-accent-dim)] border-[var(--dynamic-accent)]/50 text-[var(--dynamic-accent)]"
                      : "border-transparent text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                  style={
                    activeDeckTab === "playback"
                      ? { boxShadow: "0 0 12px var(--dynamic-accent-glow, rgba(255,92,0,0.25))" }
                      : undefined
                  }
                  title="Playback Speed & Extras"
                >
                  <Gauge className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-[#262635] mx-0.5" />

                {/* Custom Conical Volume Slider */}
                <ConeVolume />

                <div className="w-px h-4 bg-[#262635] mx-0.5" />

                {/* Queue Drawer Toggle */}
                <button
                  type="button"
                  onClick={toggleQueue}
                  className={cn(
                    "relative p-2 rounded-xl border transition-all cursor-pointer",
                    isQueueOpen
                      ? "bg-[var(--dynamic-accent-dim)] border-[var(--dynamic-accent)]/50 text-[var(--dynamic-accent)]"
                      : "border-transparent text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                  title="Playlist / Queue (Q)"
                >
                  <ListMusic className="w-4 h-4" />
                  {queue.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 px-1 min-w-3.5 h-3.5 text-[9px] font-mono font-bold rounded-full text-white flex items-center justify-center"
                      style={{
                        backgroundColor: "var(--dynamic-accent, #FF5C00)",
                        boxShadow: "0 0 6px var(--dynamic-accent, #FF5C00)",
                      }}
                    >
                      {queue.length}
                    </span>
                  )}
                </button>

                {/* Library Drawer Toggle */}
                <button
                  type="button"
                  onClick={toggleLibrary}
                  className={cn(
                    "p-2 rounded-xl border transition-all cursor-pointer",
                    isLibraryOpen
                      ? "bg-[var(--dynamic-accent-dim)] border-[var(--dynamic-accent)]/50 text-[var(--dynamic-accent)]"
                      : "border-transparent text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                  title="Media Library (L)"
                >
                  <FolderTree className="w-4 h-4" />
                </button>

                {/* Preferences & Settings Toggle */}
                <button
                  type="button"
                  onClick={() => useSettingsStore.getState().toggleSettings()}
                  className={cn(
                    "p-2 rounded-xl border transition-all cursor-pointer",
                    useSettingsStore.getState().isSettingsOpen
                      ? "bg-[var(--dynamic-accent-dim)] border-[var(--dynamic-accent)]/50 text-[var(--dynamic-accent)]"
                      : "border-transparent text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                  title="Preferences & Settings (Ctrl+,)"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Compact Mode Popup Drawer (Floating above the bottom bar) */}
        {isCompact && isMoreOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-full right-4 mb-3 w-80 rounded-3xl bg-[#161622]/98 border border-[#2E2E42] shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-3xl p-3.5 flex flex-col gap-3 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#262635]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  className="w-4 h-4"
                  style={{ color: "var(--dynamic-accent, #FF5C00)" }}
                />
                <span className="text-xs font-bold text-[#F4F4F7]">
                  Decks & Controls
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Section: Inspector Decks */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[#8A8A9E] tracking-wider px-1">
                Inspector Decks
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    toggleDeckTab("audio");
                    setIsMoreOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                    activeDeckTab === "audio"
                      ? "border-[var(--dynamic-accent)] bg-[var(--dynamic-accent-dim)] text-[var(--dynamic-accent)]"
                      : "border-[#262635] bg-[#14141E]/80 text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                >
                  <AudioLines className="w-3.5 h-3.5 shrink-0" />
                  <span>Equalizer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleDeckTab("video");
                    setIsMoreOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                    activeDeckTab === "video"
                      ? "border-[var(--dynamic-accent)] bg-[var(--dynamic-accent-dim)] text-[var(--dynamic-accent)]"
                      : "border-[#262635] bg-[#14141E]/80 text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                  <span>Video Filters</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleDeckTab("subtitles");
                    setIsMoreOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                    activeDeckTab === "subtitles"
                      ? "border-[var(--dynamic-accent)] bg-[var(--dynamic-accent-dim)] text-[var(--dynamic-accent)]"
                      : "border-[#262635] bg-[#14141E]/80 text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                >
                  <Subtitles className="w-3.5 h-3.5 shrink-0" />
                  <span>Subtitles</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleDeckTab("playback");
                    setIsMoreOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                    activeDeckTab === "playback"
                      ? "border-[var(--dynamic-accent)] bg-[var(--dynamic-accent-dim)] text-[var(--dynamic-accent)]"
                      : "border-[#262635] bg-[#14141E]/80 text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                >
                  <Gauge className="w-3.5 h-3.5 shrink-0" />
                  <span>Speed & Pitch</span>
                </button>
              </div>
            </div>

            {/* Section: Tools & Floating Panels */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[#8A8A9E] tracking-wider px-1">
                Tools & Panes
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    toggleSubtitleSync();
                    setIsMoreOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                    isSubtitleSyncOpen
                      ? "border-[var(--dynamic-accent)] bg-[var(--dynamic-accent-dim)] text-[var(--dynamic-accent)]"
                      : "border-[#262635] bg-[#14141E]/80 text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Subtitle Match</span>
                </button>

                {chapters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      toggleChapters();
                      setIsMoreOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                      isChaptersOpen
                        ? "border-[var(--dynamic-accent)] bg-[var(--dynamic-accent-dim)] text-[var(--dynamic-accent)]"
                        : "border-[#262635] bg-[#14141E]/80 text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                    )}
                  >
                    <Bookmark className="w-3.5 h-3.5 shrink-0" />
                    <span>Chapters ({chapters.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    toggleQueue();
                    setIsMoreOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                    isQueueOpen
                      ? "border-[var(--dynamic-accent)] bg-[var(--dynamic-accent-dim)] text-[var(--dynamic-accent)]"
                      : "border-[#262635] bg-[#14141E]/80 text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                >
                  <ListMusic className="w-3.5 h-3.5 shrink-0" />
                  <span>Queue ({queue.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleLibrary();
                    setIsMoreOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                    isLibraryOpen
                      ? "border-[var(--dynamic-accent)] bg-[var(--dynamic-accent-dim)] text-[var(--dynamic-accent)]"
                      : "border-[#262635] bg-[#14141E]/80 text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]"
                  )}
                >
                  <FolderTree className="w-3.5 h-3.5 shrink-0" />
                  <span>Media Library</span>
                </button>
              </div>
            </div>

            {/* Section: Preferences */}
            <div className="pt-1.5 border-t border-[#262635]">
              <button
                type="button"
                onClick={() => {
                  useSettingsStore.getState().toggleSettings();
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl border border-[#262635] bg-[#14141E]/80 hover:bg-[#1F1F2B] text-xs font-medium text-[#F4F4F7] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-3.5 h-3.5 text-[#8A8A9E]" />
                  <span>Preferences & Settings</span>
                </div>
                <span className="text-[10px] font-mono text-[#8A8A9E]">Ctrl+,</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
