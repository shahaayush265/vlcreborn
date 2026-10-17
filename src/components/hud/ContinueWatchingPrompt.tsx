import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, X, Clock } from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";

export const ContinueWatchingPrompt: React.FC = () => {
  const {
    continueWatching,
    resumeContinueWatching,
    dismissContinueWatching,
  } = usePlayerStore();

  // Auto-dismiss prompt after 9 seconds if ignored
  useEffect(() => {
    if (continueWatching) {
      const timer = setTimeout(() => {
        dismissContinueWatching();
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [continueWatching, dismissContinueWatching]);

  if (!continueWatching) return null;

  const m = Math.floor(continueWatching.positionSecs / 60);
  const s = Math.floor(continueWatching.positionSecs % 60);
  const formattedTime = `${m}:${s.toString().padStart(2, "0")}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#161622]/95 border shadow-[0_12px_36px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
        style={{
          borderColor: "var(--dynamic-accent-border, rgba(255,92,0,0.35))",
          boxShadow: "0 12px 36px rgba(0,0,0,0.8), 0 0 20px var(--dynamic-accent-glow, rgba(255,92,0,0.2))",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg"
            style={{
              backgroundColor: "var(--dynamic-accent-dim, rgba(255,92,0,0.15))",
              color: "var(--dynamic-accent, #FF5C00)",
            }}
          >
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs text-[#8A8A9E]">
            Resume <span className="text-[#F4F4F7] font-semibold truncate max-w-[140px] inline-block align-bottom">{continueWatching.title}</span> from{" "}
            <span
              className="font-mono font-bold"
              style={{ color: "var(--dynamic-accent, #FF5C00)" }}
            >
              {formattedTime}
            </span>?
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-1">
          <button
            type="button"
            onClick={resumeContinueWatching}
            className="flex items-center gap-1 px-3 py-1 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, var(--dynamic-accent, #FF5C00), var(--dynamic-accent-hover, #FF7526))",
              boxShadow: "0 2px 10px var(--dynamic-accent-glow, rgba(255,92,0,0.35))",
            }}
          >
            <Play className="w-3 h-3 fill-current ml-0.5" />
            <span>Resume</span>
          </button>

          <button
            type="button"
            onClick={dismissContinueWatching}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#262635] hover:bg-[#333345] text-[#8A8A9E] hover:text-[#F4F4F7] font-medium text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Start Over</span>
          </button>

          <button
            type="button"
            onClick={dismissContinueWatching}
            className="p-1 rounded-lg text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#262635] transition-colors cursor-pointer ml-0.5"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
