import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  X,
  Play,
  Clock,
  Sparkles,
  ChevronRight,
  Layers,
} from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { Chapter } from "../../types/player";
import { cn } from "../../lib/utils";

export const ChaptersDeck: React.FC = () => {
  const {
    chapters,
    isChaptersOpen,
    setIsChaptersOpen,
    currentTime,
    seekTo,
    isPlaying,
    setIsPlaying,
    showOsd,
  } = usePlayerStore();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isChaptersOpen) {
        setIsChaptersOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isChaptersOpen, setIsChaptersOpen]);

  const handleSelectChapter = (chapter: Chapter) => {
    seekTo(chapter.startTime);
    setIsPlaying(true);
    showOsd(`Jumped to Chapter: ${chapter.title}`);
  };

  return (
    <AnimatePresence>
      {isChaptersOpen && chapters.length > 0 && (
        <motion.aside
          key="chapters-deck-panel"
          initial={{ x: 60, opacity: 0, scale: 0.96 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 60, opacity: 0, scale: 0.96 }}
          transition={{
            type: "spring",
            damping: 28,
            stiffness: 280,
            mass: 0.8,
          }}
          onClick={(e) => e.stopPropagation()}
          className="fixed right-6 top-20 bottom-32 z-50 w-[420px] max-w-[calc(100vw-3rem)] bg-[#16161E]/95 backdrop-blur-2xl border border-[#262635] shadow-[0_20px_60px_rgba(0,0,0,0.75)] rounded-3xl flex flex-col select-none overflow-hidden pointer-events-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#262635] bg-[#111117]/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div
                className="p-2 rounded-xl border"
                style={{
                  backgroundColor: "var(--dynamic-accent-dim, rgba(255,92,0,0.15))",
                  color: "var(--dynamic-accent, #FF5C00)",
                  borderColor: "var(--dynamic-accent-border, rgba(255,92,0,0.3))",
                  boxShadow: "0 0 12px var(--dynamic-accent-glow, rgba(255,92,0,0.25))",
                }}
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#F4F4F7] tracking-tight">
                    Video Chapters
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border"
                    style={{
                      backgroundColor: "var(--dynamic-accent-dim, rgba(255,92,0,0.15))",
                      color: "var(--dynamic-accent, #FF5C00)",
                      borderColor: "var(--dynamic-accent-border, rgba(255,92,0,0.3))",
                    }}
                  >
                    {chapters.length} Parts
                  </span>
                </div>
                <p className="text-[11px] text-[#8A8A9E] mt-0.5">
                  Click any segment to jump playback directly
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChaptersOpen(false)}
              className="p-1.5 rounded-xl text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] border border-transparent hover:border-[#262635] transition-all cursor-pointer"
              title="Close Chapters (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chapters List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {chapters.map((chapter, index) => {
              const isCurrent =
                currentTime >= chapter.startTime && currentTime < chapter.endTime;
              const chapterDuration = Math.max(0, chapter.endTime - chapter.startTime);

              return (
                <motion.div
                  key={chapter.id}
                  layout
                  onClick={() => handleSelectChapter(chapter)}
                  className={cn(
                    "group relative flex flex-col p-3 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden",
                    !isCurrent && "bg-[#181822]/90 hover:bg-[#1F1F2D] border-[#262635] hover:border-[#3D3D52]"
                  )}
                  style={
                    isCurrent
                      ? {
                          backgroundColor: "var(--dynamic-accent-dim, rgba(255,92,0,0.15))",
                          borderColor: "var(--dynamic-accent-border, rgba(255,92,0,0.6))",
                          boxShadow: "0 4px 24px var(--dynamic-accent-glow, rgba(255,92,0,0.22))",
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3.5">
                    {/* Chapter Thumbnail Preview */}
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-[#0D0D11] border border-[#262635]">
                      {chapter.thumbnail ? (
                        <img
                          src={chapter.thumbnail}
                          alt={chapter.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1C1C26] to-[#12121A]">
                          <Layers className="w-6 h-6 text-[#8A8A9E]/40" />
                        </div>
                      )}

                      {/* Play overlay on hover */}
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
                          isCurrent
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <div
                          className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-lg"
                          style={{
                            backgroundColor: "var(--dynamic-accent, #FF5C00)",
                            boxShadow: "0 0 10px var(--dynamic-accent-glow, rgba(255,92,0,0.4))",
                          }}
                        >
                          {isCurrent && isPlaying ? (
                            <div className="flex items-end justify-center gap-[2px] h-3 w-3">
                              <span className="w-[2px] rounded-full bg-white animate-vlc-eq-1" />
                              <span className="w-[2px] rounded-full bg-white animate-vlc-eq-2" />
                              <span className="w-[2px] rounded-full bg-white animate-vlc-eq-3" />
                            </div>
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </div>
                      </div>

                      {/* Timestamp Pill */}
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-black/80 text-white">
                        {formatDuration(chapter.startTime)}
                      </span>
                    </div>

                    {/* Chapter Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold text-[#FF5C00]">
                          Part {index + 1}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-[#FF5C00] text-white">
                            Active
                          </span>
                        )}
                      </div>

                      <h4
                        className={cn(
                          "text-xs font-semibold truncate leading-tight transition-colors",
                          isCurrent
                            ? "text-[#FF5C00]"
                            : "text-[#F4F4F7] group-hover:text-[#FF5C00]"
                        )}
                      >
                        {chapter.title}
                      </h4>

                      {chapter.description && (
                        <p className="text-[11px] text-[#8A8A9E] line-clamp-1 mt-1">
                          {chapter.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#8A8A9E]/80 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#FF5C00]" />
                          {formatDuration(chapter.startTime)} –{" "}
                          {formatDuration(chapter.endTime)}
                        </span>
                        <span>•</span>
                        <span>{formatDuration(chapterDuration)}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#8A8A9E] group-hover:text-[#FF5C00] group-hover:translate-x-0.5 transition-all shrink-0 opacity-0 group-hover:opacity-100" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Bar */}
          <div className="px-5 py-3 border-t border-[#262635] bg-[#101017] flex items-center justify-between text-xs text-[#8A8A9E]">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Sparkles className="w-3 h-3 text-[#FF5C00]" />
              Track Markers Enabled
            </span>
            <span className="text-[10px] text-[#8A8A9E]/60">
              Press C to toggle
            </span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
