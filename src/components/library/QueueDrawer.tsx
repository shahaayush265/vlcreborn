import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListMusic,
  X,
  Trash2,
  Shuffle,
  Repeat,
  Repeat1,
  GripVertical,
  Play,
  ChevronUp,
  ChevronDown,
  PlusCircle,
  Film,
  Music as MusicIcon,
  Radio,
} from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { MediaItem } from "../../types/player";
import { cn } from "../../lib/utils";

export const QueueDrawer: React.FC = () => {
  const {
    queue,
    currentQueueIndex,
    isQueueOpen,
    toggleQueue,
    removeFromQueue,
    clearQueue,
    reorderQueue,
    playQueueIndex,
    repeatMode,
    toggleRepeatMode,
    isShuffled,
    toggleShuffle,
    addToQueue,
    toggleStreamModal,
    isPlaying,
  } = usePlayerStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);

  // Compute total duration of items in queue
  const totalDurationSecs = queue.reduce(
    (acc, item) => acc + (item.duration || 0),
    0
  );

  // Reordering drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDropOnItem = (e: React.DragEvent, destinationIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if dragging from CompactLibrary (JSON format)
    const libraryData = e.dataTransfer.getData("application/json");
    if (libraryData) {
      try {
        const item: MediaItem = JSON.parse(libraryData);
        addToQueue(item, false);
      } catch (err) {
        console.warn("Invalid media drop data:", err);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Otherwise, internal reordering
    if (draggedIndex !== null && draggedIndex !== destinationIndex) {
      reorderQueue(draggedIndex, destinationIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropZoneActive(false);

    // 1. Check if dropped JSON from Library
    const libraryData = e.dataTransfer.getData("application/json");
    if (libraryData) {
      try {
        const item: MediaItem = JSON.parse(libraryData);
        addToQueue(item, false);
        return;
      } catch {}
    }

    // 2. Check if dropped File(s) from OS desktop
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const items: MediaItem[] = files.map((file, idx) => {
        const url = URL.createObjectURL(file);
        const isAudio =
          file.type.startsWith("audio/") ||
          file.name.match(/\.(mp3|flac|wav|aac|ogg|m4a)$/i);

        return {
          id: `drop-${Date.now()}-${idx}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          src: url,
          type: isAudio ? "music" : "video",
          codec: file.type || "Local File",
        };
      });

      addToQueue(items, false);
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isQueueOpen) {
        toggleQueue();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQueueOpen, toggleQueue]);

  return (
    <AnimatePresence>
      {isQueueOpen && (
        <motion.aside
          key="queue-drawer"
          initial={{ x: 60, opacity: 0, scale: 0.96 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 60, opacity: 0, scale: 0.96 }}
          transition={{
            type: "spring",
            damping: 28,
            stiffness: 280,
            mass: 0.8,
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDropZoneActive(true);
          }}
          onDragLeave={() => setIsDropZoneActive(false)}
          onDrop={handleGlobalDrop}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "fixed right-6 top-20 bottom-32 z-50 w-[420px] max-w-[calc(100vw-3rem)] bg-[#16161E]/95 backdrop-blur-2xl border border-[#262635] shadow-[0_20px_60px_rgba(0,0,0,0.75)] rounded-3xl flex flex-col select-none overflow-hidden pointer-events-auto transition-colors",
            isDropZoneActive && "border-[var(--dynamic-accent)] bg-[#1A1315]/95 ring-2 ring-[var(--dynamic-accent-glow)]"
          )}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#262635]">
            <div className="flex items-center gap-2.5">
              <div
                className="p-1.5 rounded-xl border"
                style={{
                  backgroundColor: "var(--dynamic-accent-dim, rgba(255,92,0,0.15))",
                  color: "var(--dynamic-accent, #FF5C00)",
                  borderColor: "var(--dynamic-accent-border, rgba(255,92,0,0.3))",
                }}
              >
                <ListMusic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F4F4F7] tracking-tight">
                  Playback Queue
                </h3>
                <span className="text-[11px] font-mono text-[#8A8A9E]">
                  {queue.length} track{queue.length !== 1 ? "s" : ""}
                  {totalDurationSecs > 0 && ` • ${formatTotalDuration(totalDurationSecs)}`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleQueue}
              className="p-1.5 rounded-lg text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] transition-colors cursor-pointer"
              title="Close Queue (Q)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Queue Actions Control Bar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-[#171722]/80 border-b border-[#262635]/60 text-xs">
            {/* Left: Shuffle & Repeat toggles */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleShuffle}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer",
                  isShuffled
                    ? "bg-[#FF5C00]/20 border-[#FF5C00]/60 text-[#FF5C00]"
                    : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7]"
                )}
                title={isShuffled ? "Shuffle Enabled" : "Shuffle Disabled"}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Shuffle</span>
              </button>

              <button
                type="button"
                onClick={toggleRepeatMode}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer",
                  repeatMode !== "off"
                    ? "bg-[#FF5C00]/20 border-[#FF5C00]/60 text-[#FF5C00]"
                    : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7]"
                )}
                title={`Repeat Mode: ${repeatMode.toUpperCase()}`}
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="w-3.5 h-3.5" />
                ) : (
                  <Repeat className="w-3.5 h-3.5" />
                )}
                <span className="text-[11px] font-medium capitalize">
                  {repeatMode === "off" ? "Repeat" : repeatMode}
                </span>
              </button>
            </div>

            {/* Right: Add Stream / Clear Queue */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleStreamModal}
                className="p-1.5 rounded-lg text-[#8A8A9E] hover:text-[#FF5C00] hover:bg-[#1F1F2B] transition-colors cursor-pointer"
                title="Add Stream URL to Queue"
              >
                <PlusCircle className="w-4 h-4" />
              </button>

              {queue.length > 0 && (
                <button
                  type="button"
                  onClick={clearQueue}
                  className="p-1.5 rounded-lg text-[#8A8A9E] hover:text-red-400 hover:bg-[#1F1F2B] transition-colors cursor-pointer"
                  title="Clear Queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Queue Items List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-[#262635]">
            {queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-[#8A8A9E] p-6 border-2 border-dashed border-[#262635] rounded-2xl">
                <ListMusic className="w-10 h-10 mb-2 opacity-30 text-[#FF5C00]" />
                <p className="text-xs font-semibold text-[#F4F4F7]">
                  Your queue is empty
                </p>
                <p className="text-[11px] text-[#8A8A9E] mt-1 max-w-[220px]">
                  Drag and drop media files or click "+" from the Media Library to add items.
                </p>
              </div>
            ) : (
              queue.map((item, index) => {
                const isCurrent = index === currentQueueIndex;
                const isOver = dragOverIndex === index;

                return (
                  <motion.div
                    key={`${item.id}-${index}`}
                    layout
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOverItem(e, index)}
                    onDrop={(e) => handleDropOnItem(e, index)}
                    className={cn(
                      "group relative flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-150 cursor-grab active:cursor-grabbing",
                      isCurrent
                        ? "bg-[#FF5C00]/15 border-[#FF5C00]/60 shadow-[0_2px_12px_rgba(255,92,0,0.2)]"
                        : "bg-[#181822]/90 hover:bg-[#1E1E2C] border-[#262635] hover:border-[#38384E]",
                      isOver && "border-t-2 border-t-[#FF5C00] scale-[1.01]"
                    )}
                  >
                    {/* Drag Handle Grip */}
                    <div
                      className="text-[#8A8A9E]/40 group-hover:text-[#8A8A9E] cursor-grab shrink-0 p-0.5"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    {/* Track Number / Equalizer Playing Indicator */}
                    <div
                      onClick={() => playQueueIndex(index)}
                      className="w-7 h-7 rounded-lg bg-[#111119] border border-[#262635] flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
                    >
                      {isCurrent ? (
                        <div className="flex items-end justify-center gap-[2.5px] h-3.5 w-3.5">
                          <span
                            className={cn(
                              "w-[2.5px] rounded-full bg-[#FF5C00]",
                              isPlaying ? "animate-vlc-eq-1" : "h-[30%]"
                            )}
                          />
                          <span
                            className={cn(
                              "w-[2.5px] rounded-full bg-[#FF5C00]",
                              isPlaying ? "animate-vlc-eq-2" : "h-[75%]"
                            )}
                          />
                          <span
                            className={cn(
                              "w-[2.5px] rounded-full bg-[#FF5C00]",
                              isPlaying ? "animate-vlc-eq-3" : "h-[45%]"
                            )}
                          />
                          <span
                            className={cn(
                              "w-[2.5px] rounded-full bg-[#FF5C00]",
                              isPlaying ? "animate-vlc-eq-4" : "h-[85%]"
                            )}
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono font-medium text-[#8A8A9E] group-hover:hidden">
                          {index + 1}
                        </span>
                      )}
                      <Play
                        className={cn(
                          "w-3.5 h-3.5 text-white fill-current ml-0.5",
                          isCurrent ? "hidden" : "hidden group-hover:block"
                        )}
                      />
                    </div>

                    {/* Type Icon (Video / Music / Stream) */}
                    <div className="shrink-0 text-[#8A8A9E]/70">
                      {item.type === "music" ? (
                        <MusicIcon className="w-3.5 h-3.5" />
                      ) : item.type === "stream" ? (
                        <Radio className="w-3.5 h-3.5 text-[#FF5C00]" />
                      ) : (
                        <Film className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Track Title & Artist */}
                    <div
                      onClick={() => playQueueIndex(index)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <h4
                        className={cn(
                          "text-xs font-semibold truncate leading-tight",
                          isCurrent
                            ? "text-[#FF5C00]"
                            : "text-[#F4F4F7] group-hover:text-[#FF5C00] transition-colors"
                        )}
                        title={item.title}
                      >
                        {item.title}
                      </h4>
                      {item.artist && (
                        <p className="text-[10px] text-[#8A8A9E] truncate">
                          {item.artist}
                        </p>
                      )}
                    </div>

                    {/* Track Duration */}
                    {item.duration && (
                      <span className="text-[10px] font-mono text-[#8A8A9E] shrink-0">
                        {formatDuration(item.duration)}
                      </span>
                    )}

                    {/* Reorder Buttons (Up / Down) */}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderQueue(index, index - 1);
                        }}
                        className="p-1 rounded hover:bg-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        disabled={index === queue.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderQueue(index, index + 1);
                        }}
                        className="p-1 rounded hover:bg-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(index);
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-[#8A8A9E] hover:text-red-400 cursor-pointer ml-0.5"
                        title="Remove from Queue"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Drop Target Helper Banner at Bottom */}
          <div className="px-5 py-3 border-t border-[#262635] bg-[#101017] flex items-center justify-between text-xs text-[#8A8A9E]">
            <span className="text-[11px]">
              Drag to reorder • Auto-advance enabled
            </span>
            <span className="font-mono text-[10px] text-[#FF5C00]">
              {queue.length > 0 ? `${currentQueueIndex + 1}/${queue.length}` : "0/0"}
            </span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTotalDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
