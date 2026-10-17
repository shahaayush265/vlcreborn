import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Music,
  Radio,
  Search,
  X,
  Plus,
  Play,
  FolderOpen,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Volume2,
} from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { MediaItem, MediaType } from "../../types/player";
import { generateMediaThumbnail } from "../../lib/thumbnailGenerator";
import { cn } from "../../lib/utils";
import vlcConeSvg from "../../assets/vlc-cone.svg";

const LIBRARY_VIDEOS_KEY = "vlc_reborn_library_videos";
const LIBRARY_MUSIC_KEY = "vlc_reborn_library_music";
const LIBRARY_STREAMS_KEY = "vlc_reborn_library_streams";

const DUMMY_MEDIA_IDS = new Set([
  "demo-sample",
  "vid-1",
  "vid-2",
  "vid-3",
  "mus-1",
  "mus-2",
  "mus-3",
  "stream-nasa",
  "stream-somafm",
  "stream-mux-test",
]);

const loadPersistedLibrary = (key: string): MediaItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item: MediaItem) =>
            item &&
            !DUMMY_MEDIA_IDS.has(item.id) &&
            !item.src?.includes("demo-sample") &&
            !item.src?.includes("commondatastorage.googleapis.com")
        );
      }
    }
  } catch (err) {
    console.warn(`Failed loading ${key}:`, err);
  }
  return [];
};

export const CompactLibrary: React.FC = () => {
  const {
    isLibraryOpen,
    toggleLibrary,
    setCurrentMedia,
    addToQueue,
    setIsPlaying,
    currentMedia,
    isPlaying,
    toggleStreamModal,
    showOsd,
  } = usePlayerStore();

  const [activeCategory, setActiveCategory] = useState<MediaType>("video");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  const [hoveredWaveformIndex, setHoveredWaveformIndex] = useState<{
    itemId: string;
    barIndex: number;
  } | null>(null);

  // Media library state with persistent storage support
  const [videos, setVideos] = useState<MediaItem[]>(() =>
    loadPersistedLibrary(LIBRARY_VIDEOS_KEY)
  );
  const [music, setMusic] = useState<MediaItem[]>(() =>
    loadPersistedLibrary(LIBRARY_MUSIC_KEY)
  );
  const [streams] = useState<MediaItem[]>(() =>
    loadPersistedLibrary(LIBRARY_STREAMS_KEY)
  );

  // Automatically persist changes across reloads
  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_VIDEOS_KEY, JSON.stringify(videos));
    } catch (err) {
      console.warn("Failed persisting library videos:", err);
    }
  }, [videos]);

  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_MUSIC_KEY, JSON.stringify(music));
    } catch (err) {
      console.warn("Failed persisting library music:", err);
    }
  }, [music]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Get current dataset based on tab
  const currentList = useMemo(() => {
    switch (activeCategory) {
      case "video":
        return videos;
      case "music":
        return music;
      case "stream":
        return streams;
    }
  }, [activeCategory, videos, music, streams]);

  // Extract unique subcategories
  const subCategories = useMemo(() => {
    const set = new Set<string>(["All"]);
    currentList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [currentList]);

  // Filter items by search query and subcategory
  const filteredItems = useMemo(() => {
    return currentList.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.album?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.codec?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubCategory =
        selectedSubCategory === "All" || item.category === selectedSubCategory;

      return matchesSearch && matchesSubCategory;
    });
  }, [currentList, searchQuery, selectedSubCategory]);

  // Handle local file import
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const url = URL.createObjectURL(file);
      const isAudio =
        file.type.startsWith("audio/") ||
        file.name.match(/\.(mp3|flac|wav|aac|ogg|m4a|wma|opus)$/i);

      // Extract real video frame thumbnail, or undefined for audio
      const realThumbnail = !isAudio ? await generateMediaThumbnail(file) : undefined;

      const newItem: MediaItem = {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        src: url,
        type: isAudio ? "music" : "video",
        category: "Local Imports",
        resolution: isAudio ? undefined : "Local Media",
        codec: isAudio ? file.type || "Audio File" : file.type || "Video File",
        thumbnail: realThumbnail,
      };

      if (isAudio) {
        setMusic((prev) => [newItem, ...prev]);
        setActiveCategory("music");
      } else {
        setVideos((prev) => [newItem, ...prev]);
        setActiveCategory("video");
      }

      // If no media is currently playing in player, load and start playing the imported file right away!
      if (!currentMedia) {
        setCurrentMedia(newItem);
        setIsPlaying(true);
      }

      showOsd(`Imported to Library: ${newItem.title}`);
    }

    if (e.target) {
      e.target.value = "";
    }
  };

  const handlePlayItem = (item: MediaItem) => {
    setCurrentMedia(item);
    setIsPlaying(true);
  };

  // Drag start handler so items can be dragged into QueueDrawer
  const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "copy";
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLibraryOpen) {
        toggleLibrary();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLibraryOpen, toggleLibrary]);

  return (
    <AnimatePresence>
      {isLibraryOpen && (
        <motion.aside
          key="compact-library"
          initial={{ x: -60, opacity: 0, scale: 0.96 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -60, opacity: 0, scale: 0.96 }}
          transition={{
            type: "spring",
            damping: 28,
            stiffness: 280,
            mass: 0.8,
          }}
          onClick={(e) => e.stopPropagation()}
          className="fixed left-6 top-20 bottom-32 z-50 w-[420px] max-w-[calc(100vw-3rem)] bg-[#16161E]/95 backdrop-blur-2xl border border-[#262635] shadow-[0_20px_60px_rgba(0,0,0,0.75)] rounded-3xl flex flex-col pointer-events-auto select-none overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#262635]/80">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-[#FF5C00]/30 blur-sm" />
                <img
                  src={vlcConeSvg}
                  alt="VLC"
                  className="relative w-6 h-6 drop-shadow-[0_2px_8px_rgba(255,92,0,0.5)]"
                />
              </div>
              <h2 className="text-base font-bold tracking-tight text-[#F4F4F7]">
                Media Library
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-[#FF5C00]/20 text-[#FF5C00] border border-[#FF5C00]/30">
                In-Player
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] transition-colors cursor-pointer"
                title="Import Local Files"
              >
                <FolderOpen className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleLibrary}
                className="p-1.5 rounded-lg text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] transition-colors cursor-pointer"
                title="Close Library (L)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hidden File Picker */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,audio/*"
            className="hidden"
            onChange={handleImportFile}
          />

          {/* Interactive Category Switcher Tabs */}
          <div className="px-4 pt-3 pb-2">
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#1A1A24] rounded-xl border border-[#262635]">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("video");
                  setSelectedSubCategory("All");
                }}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeCategory === "video"
                    ? "bg-[#FF5C00] text-white shadow-[0_2px_12px_rgba(255,92,0,0.35)]"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#262635]/40"
                )}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Videos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("music");
                  setSelectedSubCategory("All");
                }}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeCategory === "music"
                    ? "bg-[#FF5C00] text-white shadow-[0_2px_12px_rgba(255,92,0,0.35)]"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#262635]/40"
                )}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Music</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("stream");
                  setSelectedSubCategory("All");
                }}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeCategory === "stream"
                    ? "bg-[#FF5C00] text-white shadow-[0_2px_12px_rgba(255,92,0,0.35)]"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#262635]/40"
                )}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Streams</span>
              </button>
            </div>
          </div>

          {/* Breadcrumb Navigation & Subcategory Filter Pills */}
          <div className="px-5 py-2 flex flex-col gap-2">
            {/* Breadcrumb nodes */}
            <div className="flex items-center gap-1.5 text-xs text-[#8A8A9E]">
              <span className="hover:text-[#F4F4F7] cursor-pointer transition-colors">
                Library
              </span>
              <ChevronRight className="w-3 h-3 text-[#8A8A9E]/60" />
              <span className="capitalize text-[#F4F4F7] font-medium">
                {activeCategory}s
              </span>
              {selectedSubCategory !== "All" && (
                <>
                  <ChevronRight className="w-3 h-3 text-[#8A8A9E]/60" />
                  <span className="text-[#FF5C00] font-medium">
                    {selectedSubCategory}
                  </span>
                </>
              )}
            </div>

            {/* Subcategory Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {subCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedSubCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer border",
                    selectedSubCategory === cat
                      ? "bg-[#FF5C00]/20 border-[#FF5C00]/60 text-[#FF5C00]"
                      : "bg-[#1A1A24] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search Filter Box */}
          <div className="px-5 py-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-[#8A8A9E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeCategory}s, artist, or tags...`}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#1A1A24] border border-[#262635] text-xs text-[#F4F4F7] placeholder-[#8A8A9E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 p-0.5 text-[#8A8A9E] hover:text-[#F4F4F7] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Stream Quick-Action Header (When in Streams category) */}
          {activeCategory === "stream" && (
            <div className="px-5 py-1">
              <button
                type="button"
                onClick={toggleStreamModal}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF5C00]/15 to-[#FF7526]/20 border border-[#FF5C00]/30 hover:border-[#FF5C00] text-[#FF5C00] hover:text-white hover:bg-[#FF5C00] text-xs font-semibold transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,92,0,0.15)]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Custom Network Stream URL...</span>
              </button>
            </div>
          )}

          {/* Media Items Scrollable List */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5 scrollbar-thin scrollbar-thumb-[#262635]">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-[#8A8A9E] p-4">
                <Search className="w-8 h-8 mb-2 opacity-40 text-[#FF5C00]" />
                <p className="text-xs font-medium">No {activeCategory}s found</p>
                <p className="text-[11px] text-[#8A8A9E]/70 mt-1">
                  Try a different search term or import files from your computer.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isCurrentlyPlaying =
                  currentMedia?.id === item.id || currentMedia?.src === item.src;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, item)}
                    className={cn(
                      "group relative flex flex-col p-2.5 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing",
                      isCurrentlyPlaying
                        ? "bg-[#FF5C00]/15 border-[#FF5C00]/50 shadow-[0_4px_20px_rgba(255,92,0,0.2)]"
                        : "bg-[#181822]/90 hover:bg-[#1E1E2C] border-[#262635] hover:border-[#38384E]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Media Thumbnail / Album Cover */}
                      <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-[#0D0D11] border border-[#262635] flex items-center justify-center">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : item.type === "music" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#261E1A] to-[#121010] text-[#FF5C00]/90">
                            <Music className="w-6 h-6 drop-shadow-md" />
                            <span className="text-[8px] font-mono text-[#8A8A9E] mt-0.5 font-semibold uppercase tracking-wider">AUDIO</span>
                          </div>
                        ) : item.type === "stream" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1A28] to-[#101018] text-[#FF5C00]">
                            <Radio className="w-6 h-6 drop-shadow-md" />
                            <span className="text-[8px] font-mono text-[#8A8A9E] mt-0.5 font-semibold uppercase tracking-wider">STREAM</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1E1E2C] to-[#111118] text-[#FF5C00]/80">
                            <Film className="w-6 h-6 drop-shadow-md" />
                            <span className="text-[8px] font-mono text-[#8A8A9E] mt-0.5 font-semibold uppercase tracking-wider">VIDEO</span>
                          </div>
                        )}
                        {/* Overlay Play Action Button */}
                        <div
                          onClick={() => handlePlayItem(item)}
                          className={cn(
                            "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity cursor-pointer",
                            isCurrentlyPlaying && isPlaying
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          )}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#FF5C00] text-white flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                            {isCurrentlyPlaying && isPlaying ? (
                              <Volume2 className="w-4 h-4 animate-pulse" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </div>
                        </div>

                        {/* Badges on Thumbnail */}
                        {item.resolution && (
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 text-[9px] font-mono font-bold bg-black/80 text-white rounded">
                            {item.resolution}
                          </span>
                        )}
                        {item.type === "stream" && (
                          <span className="absolute top-1 left-1 px-1 py-0.2 text-[8px] font-bold uppercase tracking-wider bg-[#FF5C00] text-white rounded">
                            LIVE
                          </span>
                        )}
                      </div>

                      {/* Info Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4
                            onClick={() => handlePlayItem(item)}
                            className={cn(
                              "text-xs font-semibold truncate cursor-pointer transition-colors leading-tight",
                              isCurrentlyPlaying
                                ? "text-[#FF5C00]"
                                : "text-[#F4F4F7] group-hover:text-[#FF5C00]"
                            )}
                            title={item.title}
                          >
                            {item.title}
                          </h4>
                        </div>

                        {item.artist && (
                          <p className="text-[11px] text-[#8A8A9E] truncate mt-0.5">
                            {item.artist}
                            {item.album && ` • ${item.album}`}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#8A8A9E]/80 font-mono">
                          {item.duration && (
                            <span>{formatDuration(item.duration)}</span>
                          )}
                          {item.codec && (
                            <span className="px-1.5 py-0.2 rounded bg-[#262635]/60 text-[#8A8A9E]">
                              {item.codec}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Add to Queue */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => addToQueue(item, false)}
                          className="p-1.5 rounded-lg bg-[#262635] hover:bg-[#FF5C00] text-[#8A8A9E] hover:text-white transition-all cursor-pointer"
                          title="Add to Active Queue"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Juxtopposed's Special Music Feature: Mini Waveform Seeker Preview */}
                    {item.type === "music" && item.waveform && (
                      <div className="mt-2.5 pt-2 border-t border-[#262635]/50 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px] text-[#8A8A9E]">
                          <span className="flex items-center gap-1 font-mono text-[9px]">
                            <Sparkles className="w-2.5 h-2.5 text-[#FF5C00]" />
                            Waveform Preview
                          </span>
                          {hoveredWaveformIndex?.itemId === item.id && item.duration && (
                            <span className="text-[#FF5C00] font-mono text-[9px]">
                              Seek to ~
                              {formatDuration(
                                Math.floor(
                                  (hoveredWaveformIndex.barIndex /
                                    item.waveform.length) *
                                    item.duration
                                )
                              )}
                            </span>
                          )}
                        </div>

                        {/* Interactive Waveform Bar Visualizer */}
                        <div
                          className="flex items-end gap-[2px] h-6 px-1.5 py-0.5 rounded-lg bg-[#111119] border border-[#262635]/40 cursor-pointer"
                          onClick={() => {
                            handlePlayItem(item);
                            if (
                              hoveredWaveformIndex?.itemId === item.id &&
                              item.duration &&
                              item.waveform
                            ) {
                              const targetSec = Math.floor(
                                (hoveredWaveformIndex.barIndex /
                                  item.waveform.length) *
                                  item.duration
                              );
                              usePlayerStore.getState().seekTo(targetSec);
                            }
                          }}
                        >
                          {item.waveform.map((amp, idx) => {
                            const isHovered =
                              hoveredWaveformIndex?.itemId === item.id &&
                              hoveredWaveformIndex.barIndex === idx;

                            return (
                              <div
                                key={idx}
                                onMouseEnter={() =>
                                  setHoveredWaveformIndex({
                                    itemId: item.id,
                                    barIndex: idx,
                                  })
                                }
                                onMouseLeave={() => setHoveredWaveformIndex(null)}
                                className={cn(
                                  "flex-1 rounded-sm transition-all duration-100",
                                  isHovered
                                    ? "bg-[#FF5C00] scale-y-110 shadow-[0_0_6px_#FF5C00]"
                                    : isCurrentlyPlaying
                                    ? "bg-[#FF5C00]/70 group-hover:bg-[#FF5C00]"
                                    : "bg-[#3A3A4E] group-hover:bg-[#52526E]"
                                )}
                                style={{ height: `${Math.max(15, amp * 100)}%` }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-5 py-3 border-t border-[#262635] flex items-center justify-between text-xs text-[#8A8A9E] bg-[#101017]">
            <span className="font-mono text-[11px]">
              {filteredItems.length} {activeCategory}
              {filteredItems.length !== 1 ? "s" : ""} indexed
            </span>
            <span className="text-[10px] text-[#8A8A9E]/60">
              Drag items to Queue
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
