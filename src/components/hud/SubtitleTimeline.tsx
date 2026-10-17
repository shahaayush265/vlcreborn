import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "../../stores/usePlayerStore";
import {
  Subtitles,
  Magnet,
  RotateCcw,
  Download,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface SubtitleTimelineProps {
  isExpanded?: boolean;
  onClose?: () => void;
}

export const SubtitleTimeline: React.FC<SubtitleTimelineProps> = ({
  isExpanded = false,
  onClose,
}) => {
  const {
    duration,
    currentTime,
    subtitles,
    subtitleSettings,
    subtitleTracks,
    activeSubtitleName,
    setSubtitleDelay,
    shiftSubtitleDelay,
    alignNearestCueToTime,
    seekTo,
    selectSubtitleTrack,
    exportCurrentSubtitles,
    showOsd,
  } = usePlayerStore();

  const { delay, selectedTrackId } = subtitleSettings;
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Dragging state for visual sync alignment
  const [isDraggingTrack, setIsDraggingTrack] = useState(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartDelayRef = useRef<number>(0);
  const [dragCurrentOffset, setDragCurrentOffset] = useState<number | null>(null);

  // Hovered cue state for rich tooltip
  const [hoveredCue, setHoveredCue] = useState<{
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    screenX: number;
  } | null>(null);

  // Track selection dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Effective delay (in ms) during active dragging or from store
  const effectiveDelayMs = dragCurrentOffset !== null ? dragCurrentOffset : delay;
  const offsetSeconds = effectiveDelayMs / 1000;

  // Handle pointer down on the subtitle alignment track to start visual dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Prevent default and capture pointer for zero-lag dragging
    e.preventDefault();
    e.stopPropagation();

    if (!duration || duration <= 0 || subtitles.length === 0) return;

    trackRef.current?.setPointerCapture(e.pointerId);
    setIsDraggingTrack(true);
    dragStartXRef.current = e.clientX;
    dragStartDelayRef.current = delay;
    setDragCurrentOffset(delay);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingTrack || !trackRef.current || duration <= 0) return;

    const rect = trackRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;

    const deltaX = e.clientX - dragStartXRef.current;
    // Map pixel delta to seconds across timeline width:
    // (deltaX / width) * duration = deltaSeconds
    const deltaSeconds = (deltaX / rect.width) * duration;
    const deltaMs = Math.round(deltaSeconds * 1000);

    const targetDelay = Math.max(-5000, Math.min(5000, dragStartDelayRef.current + deltaMs));
    setDragCurrentOffset(targetDelay);
    setSubtitleDelay(targetDelay);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingTrack) {
      if (trackRef.current?.hasPointerCapture(e.pointerId)) {
        trackRef.current.releasePointerCapture(e.pointerId);
      }
      setIsDraggingTrack(false);
      const finalOffset = dragCurrentOffset !== null ? dragCurrentOffset : delay;
      setSubtitleDelay(finalOffset);
      setDragCurrentOffset(null);
      showOsd(`Subtitle Sync Offset: ${finalOffset > 0 ? "+" : ""}${finalOffset}ms`);
    }
  };

  // Click on a specific cue to seek directly to its start timestamp
  const handleCueClick = (cueStartTime: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Seek to cue's adjusted start time
    const target = Math.max(0, cueStartTime + offsetSeconds);
    seekTo(target);
    showOsd(`Seek to dialogue [${formatTimecode(target)}]`);
  };

  const currentTrack = subtitleTracks.find((t) => t.id === selectedTrackId);
  const activePlayheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full select-none" onClick={(e) => e.stopPropagation()}>
      {/* Expanded Visual Sync Alignment Header & Controls Ribbon */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden mb-2"
          >
            <div className="p-3 rounded-2xl bg-[#16161E]/95 border border-[#262635] shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex flex-col gap-2.5">
              {/* Top Row: Track badge, current offset display, snap button, and close */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#FF5C00]/15 text-[#FF5C00] border border-[#FF5C00]/30">
                    <Subtitles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F4F4F7]">
                        Visual Subtitle Matcher
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1F1F2B] text-[#8A8A9E] border border-[#262635]">
                        {subtitles.length} cues
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A8A9E] leading-tight">
                      Drag the timeline below horizontally to match subtitle cues with spoken dialogue
                    </p>
                  </div>
                </div>

                {/* Right Actions: Track selector, Reset, Snap, Close */}
                <div className="flex items-center gap-2">
                  {/* Track switch dropdown button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1F1F2B] hover:bg-[#28283A] border border-[#262635] text-xs font-medium text-[#F4F4F7] transition-colors cursor-pointer"
                    >
                      <span className="max-w-[120px] truncate">
                        {currentTrack?.label || activeSubtitleName || "Select Track"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8A8A9E]" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-[#16161E] border border-[#262635] shadow-2xl p-1 z-50">
                        <div className="text-[10px] font-semibold text-[#8A8A9E] px-2 py-1 uppercase tracking-wider">
                          Available Subtitles
                        </div>
                        {subtitleTracks.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              selectSubtitleTrack(t.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                              t.id === selectedTrackId
                                ? "bg-[#FF5C00]/20 text-[#FF5C00]"
                                : "text-[#C2C2D1] hover:bg-[#1F1F2B] hover:text-white"
                            }`}
                          >
                            <span className="truncate">{t.label}</span>
                            {t.format && (
                              <span className="text-[10px] uppercase font-mono px-1 rounded bg-[#262635]">
                                {t.format}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Snap Nearest Cue to Current Playhead */}
                  <button
                    type="button"
                    onClick={() => alignNearestCueToTime(currentTime)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5C00] to-[#FF7526] hover:brightness-110 text-white font-semibold text-xs transition-all shadow-[0_2px_12px_rgba(255,92,0,0.3)] active:scale-98 cursor-pointer"
                    title="Snap nearest subtitle cue start to current playback position"
                  >
                    <Magnet className="w-3.5 h-3.5" />
                    <span>Snap to Playhead</span>
                  </button>

                  {/* Reset Offset (0ms) */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubtitleDelay(0);
                      showOsd("Subtitle Sync Reset to 0ms");
                    }}
                    disabled={delay === 0}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1F1F2B] hover:bg-[#28283A] disabled:opacity-40 disabled:hover:bg-[#1F1F2B] border border-[#262635] text-xs font-medium text-[#C2C2D1] hover:text-[#F4F4F7] transition-colors cursor-pointer"
                    title="Reset offset to 0ms"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  {/* Export Synced Subtitles */}
                  <button
                    type="button"
                    onClick={() => exportCurrentSubtitles("srt")}
                    className="p-1.5 rounded-xl bg-[#1F1F2B] hover:bg-[#28283A] border border-[#262635] text-[#C2C2D1] hover:text-[#FF5C00] transition-colors cursor-pointer"
                    title="Download synced subtitle file (.srt)"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {onClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1.5 rounded-xl text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] transition-colors cursor-pointer ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Offset Fine-Tuning Pill Bar */}
              <div className="flex items-center justify-between pt-1 border-t border-[#262635]/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#8A8A9E] text-[11px]">Offset:</span>
                  <span
                    className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-md border ${
                      effectiveDelayMs === 0
                        ? "bg-[#1F1F2B] text-[#8A8A9E] border-[#262635]"
                        : effectiveDelayMs > 0
                        ? "bg-[#FF5C00]/20 text-[#FF5C00] border-[#FF5C00]/40 shadow-[0_0_10px_rgba(255,92,0,0.3)]"
                        : "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                    }`}
                  >
                    {effectiveDelayMs > 0 ? `+${effectiveDelayMs} ms` : `${effectiveDelayMs} ms`}
                  </span>

                  {isDraggingTrack && (
                    <span className="text-[11px] text-[#FFA066] animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Dragging to sync in real time...</span>
                    </span>
                  )}
                </div>

                {/* Fine Stepper Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => shiftSubtitleDelay(-250)}
                    className="px-2 py-0.5 text-[11px] font-mono rounded-lg bg-[#1F1F2B] hover:bg-[#28283A] text-[#C2C2D1] hover:text-white transition-colors cursor-pointer"
                  >
                    -250ms
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftSubtitleDelay(-50)}
                    className="px-2 py-0.5 text-[11px] font-mono rounded-lg bg-[#1F1F2B] hover:bg-[#28283A] text-[#C2C2D1] hover:text-white transition-colors cursor-pointer"
                  >
                    -50ms
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftSubtitleDelay(50)}
                    className="px-2 py-0.5 text-[11px] font-mono rounded-lg bg-[#1F1F2B] hover:bg-[#28283A] text-[#C2C2D1] hover:text-white transition-colors cursor-pointer"
                  >
                    +50ms
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftSubtitleDelay(250)}
                    className="px-2 py-0.5 text-[11px] font-mono rounded-lg bg-[#1F1F2B] hover:bg-[#28283A] text-[#C2C2D1] hover:text-white transition-colors cursor-pointer"
                  >
                    +250ms
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Hover Cue Tooltip */}
      {hoveredCue && duration > 0 && (
        <div
          className="absolute -top-16 z-40 pointer-events-none transform -translate-x-1/2 flex flex-col items-center"
          style={{
            left: `${((hoveredCue.startTime + offsetSeconds) / duration) * 100}%`,
          }}
        >
          <div className="max-w-xs px-3 py-1.5 rounded-xl bg-[#16161E]/95 border border-[#FF5C00]/40 text-xs shadow-2xl backdrop-blur-xl flex flex-col gap-0.5 text-center">
            <div className="text-[10px] font-mono font-bold text-[#FF5C00]">
              {formatTimecode(hoveredCue.startTime + offsetSeconds)} →{" "}
              {formatTimecode(hoveredCue.endTime + offsetSeconds)}
            </div>
            <div className="text-[#F4F4F7] font-medium text-[11px] line-clamp-2 italic">
              “{hoveredCue.text}”
            </div>
            <div className="text-[9px] text-[#8A8A9E] mt-0.5">Click cue block to seek</div>
          </div>
          <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#FF5C00]/40" />
        </div>
      )}

      {/* Subtitle Visual Strip / Scrub Ribbon */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full rounded-xl transition-all duration-200 select-none touch-none ${
          isExpanded
            ? "h-7 bg-[#1A1A24] border border-[#2E2E3F] hover:border-[#FF5C00]/50 shadow-inner cursor-grab active:cursor-grabbing py-1"
            : "h-2.5 bg-transparent hover:h-3.5 cursor-pointer py-0.5"
        }`}
        title={
          isExpanded
            ? "Drag horizontally to align subtitle timing"
            : "Subtitle speech rhythm track (Click to open visual matcher)"
        }
      >
        {/* Subtle grid ticks on expanded mode */}
        {isExpanded && (
          <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20 px-1">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="w-px h-full bg-[#8A8A9E]" />
            ))}
          </div>
        )}

        {/* Vertical Playhead Alignment Marker */}
        {duration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#FF5C00] z-20 pointer-events-none shadow-[0_0_8px_#FF5C00]"
            style={{ left: `${Math.min(100, Math.max(0, activePlayheadPercent))}%` }}
          >
            {isExpanded && (
              <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-[#FF5C00] shadow-[0_0_6px_#FF5C00]" />
            )}
          </div>
        )}

        {/* Subtitle Cue Blocks */}
        {subtitles.length > 0 && duration > 0 ? (
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            {subtitles.map((cue) => {
              const shiftedStart = cue.startTime + offsetSeconds;
              const shiftedEnd = cue.endTime + offsetSeconds;

              const leftPercent = (shiftedStart / duration) * 100;
              const widthPercent = Math.max(
                0.3,
                ((shiftedEnd - shiftedStart) / duration) * 100
              );

              // Check if cue is currently active based on current time
              const isCurrent =
                currentTime >= shiftedStart && currentTime <= shiftedEnd;

              return (
                <div
                  key={cue.id}
                  onClick={(e) => handleCueClick(cue.startTime, e)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredCue({
                      id: cue.id,
                      text: cue.text,
                      startTime: cue.startTime,
                      endTime: cue.endTime,
                      screenX: rect.left + rect.width / 2,
                    });
                  }}
                  onMouseLeave={() => setHoveredCue(null)}
                  style={{
                    left: `${Math.max(0, Math.min(100, leftPercent))}%`,
                    width: `${Math.min(100 - leftPercent, widthPercent)}%`,
                  }}
                  className={`absolute top-0.5 bottom-0.5 rounded-sm transition-colors duration-100 cursor-pointer ${
                    isCurrent
                      ? "bg-[#FF5C00] shadow-[0_0_10px_rgba(255,92,0,0.8)] z-10"
                      : isExpanded
                      ? "bg-[#FFA066]/50 hover:bg-[#FF5C00] border-x border-[#FF5C00]/40"
                      : "bg-[#FFA066]/35 hover:bg-[#FF5C00]"
                  }`}
                />
              );
            })}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-[#8A8A9E]/60 italic font-medium">
            No subtitles loaded — Drop a .srt/.vtt file or open Inspector Deck
          </div>
        )}
      </div>
    </div>
  );
};

function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00.0";
  const totalSecs = Math.floor(seconds);
  const minutes = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const millis = Math.floor((seconds % 1) * 10);

  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}.${millis}`;
}
