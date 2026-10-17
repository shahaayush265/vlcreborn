import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Subtitles,
  AudioLines,
  SlidersHorizontal,
  Gauge,
  X,
} from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { RightDeckTab } from "../../types/player";
import { SubtitleTab } from "./SubtitleTab";
import { AudioTab } from "./AudioTab";
import { VideoTab } from "./VideoTab";
import { PlaybackTab } from "./PlaybackTab";

interface TabDefinition {
  id: NonNullable<RightDeckTab>;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const TABS: TabDefinition[] = [
  { id: "subtitles", label: "Subtitles", icon: Subtitles },
  { id: "audio", label: "Audio", icon: AudioLines },
  { id: "video", label: "Video", icon: SlidersHorizontal },
  { id: "playback", label: "Playback", icon: Gauge },
];

export const InspectorDeck: React.FC = () => {
  const { activeDeckTab, setActiveDeckTab } = usePlayerStore();

  const isOpen = activeDeckTab !== null;

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setActiveDeckTab(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setActiveDeckTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="inspector-deck-panel"
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
          className="fixed right-6 top-20 bottom-32 z-50 w-[420px] max-w-[calc(100vw-3rem)] bg-[#16161E]/95 backdrop-blur-2xl border border-[#262635] shadow-[0_20px_60px_rgba(0,0,0,0.75)] rounded-3xl flex flex-col select-none overflow-hidden"
        >
          {/* Top Header & Tab Navigation Bar */}
          <div className="flex flex-col border-b border-[#262635] bg-[#111117]/80 shrink-0">
            {/* Title Bar & Close Button */}
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: "var(--dynamic-accent, #FF5C00)",
                    boxShadow: "0 0 8px var(--dynamic-accent-glow, rgba(255,92,0,0.8))",
                  }}
                />
                <span className="text-sm font-extrabold tracking-wider text-[#F4F4F7] uppercase">
                  Inspector Deck
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1F1F2B] border border-[#262635] text-[#8A8A9E]">
                  ESC
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveDeckTab(null)}
                className="p-1.5 rounded-xl text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] border border-transparent hover:border-[#262635] transition-all cursor-pointer"
                title="Close Deck (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4-Tab Navigation Selector */}
            <div className="flex items-center justify-between px-3 pb-2 gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeDeckTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDeckTab(tab.id)}
                    className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
                      !isActive ? "text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B]/50" : ""
                    }`}
                    style={isActive ? { color: "var(--dynamic-accent, #FF5C00)" } : undefined}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-semibold tracking-tight">
                      {tab.label}
                    </span>

                    {/* Active Pill Highlight */}
                    {isActive && (
                      <motion.div
                        layoutId="activeDeckTabPill"
                        transition={{
                          type: "spring",
                          damping: 25,
                          stiffness: 300,
                        }}
                        className="absolute inset-0 rounded-xl -z-10 border"
                        style={{
                          backgroundColor: "var(--dynamic-accent-dim)",
                          borderColor: "var(--dynamic-accent-border, var(--dynamic-accent-dim))",
                          boxShadow: "0 0 12px var(--dynamic-accent-glow)",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-5 scroll-smooth custom-scrollbar">
            {activeDeckTab === "subtitles" && <SubtitleTab />}
            {activeDeckTab === "audio" && <AudioTab />}
            {activeDeckTab === "video" && <VideoTab />}
            {activeDeckTab === "playback" && <PlaybackTab />}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
