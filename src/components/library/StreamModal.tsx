import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  X,
  Clipboard,
  Play,
  Plus,
  Tv,
  Music,
  Film,
  History,
  Check,
  Globe,
  Sparkles,
} from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { MediaItem } from "../../types/player";
import { cn } from "../../lib/utils";

interface StreamPreset {
  title: string;
  url: string;
  category: "iptv" | "radio" | "movie";
  badge: string;
  description: string;
}

const PUBLIC_PRESETS: StreamPreset[] = [
  {
    title: "NASA TV Public HD",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    category: "iptv",
    badge: "LIVE IPTV",
    description: "NASA Television 1080p Live Stream & Space Mission Coverage",
  },
  {
    title: "SomaFM - Groove Salad (Downtempo Chill)",
    url: "https://ice1.somafm.com/groovesalad-128-mp3",
    category: "radio",
    badge: "128k MP3",
    description: "San Francisco's legendary commercial-free ambient downtempo radio",
  },
  {
    title: "Big Buck Bunny (HLS / 1080p)",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    category: "movie",
    badge: "FHD Stream",
    description: "Blender Open Movie high-bitrate adaptive network test",
  },
  {
    title: "Tears of Steel (4K Sci-Fi)",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    category: "movie",
    badge: "4K UHD",
    description: "VFX open short film high-bandwidth benchmark stream",
  },
  {
    title: "Mux HLS Multi-bitrate Stream",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    category: "iptv",
    badge: "Adaptive HLS",
    description: "Adaptive bitrate live streaming test matrix",
  },
];

const STORAGE_RECENT_KEY = "vlcreborn_recent_streams";

export const StreamModal: React.FC = () => {
  const {
    isStreamModalOpen,
    toggleStreamModal,
    setCurrentMedia,
    addToQueue,
    setIsPlaying,
    showOsd,
  } = usePlayerStore();

  const [streamUrl, setStreamUrl] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [recentStreams, setRecentStreams] = useState<
    Array<{ url: string; title: string; date: number }>
  >([]);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Load recent streams from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECENT_KEY);
      if (saved) {
        setRecentStreams(JSON.parse(saved));
      }
    } catch {}
  }, [isStreamModalOpen]);

  const saveRecentStream = (url: string, title: string) => {
    try {
      const updated = [
        { url, title: title || url, date: Date.now() },
        ...recentStreams.filter((s) => s.url !== url),
      ].slice(0, 8);
      setRecentStreams(updated);
      localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setStreamUrl(text.trim());
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 1500);

        // Auto-infer title from filename if empty
        if (!streamTitle) {
          const guess = text.split("/").pop()?.split("?")[0] || "Network Stream";
          setStreamTitle(guess);
        }
      }
    } catch (err) {
      console.warn("Failed to read clipboard:", err);
    }
  };

  const handleSelectPreset = (preset: StreamPreset) => {
    setStreamUrl(preset.url);
    setStreamTitle(preset.title);
  };

  const handlePlayNow = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!streamUrl.trim()) return;

    const finalTitle = streamTitle.trim() || streamUrl.split("/").pop() || "Network Stream";
    const isAudio =
      streamUrl.includes(".mp3") ||
      streamUrl.includes("somafm") ||
      streamUrl.includes("radio");

    const mediaItem: MediaItem = {
      id: `stream-${Date.now()}`,
      title: finalTitle,
      src: streamUrl.trim(),
      type: isAudio ? "music" : "stream",
      category: "Network Stream",
      codec: streamUrl.includes(".m3u8") ? "HLS Live" : "HTTP Stream",
      thumbnail: isAudio
        ? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    };

    saveRecentStream(streamUrl.trim(), finalTitle);
    setCurrentMedia(mediaItem);
    setIsPlaying(true);
    toggleStreamModal();
    showOsd(`Opening Stream: ${finalTitle}`);
  };

  const handleAddToQueue = () => {
    if (!streamUrl.trim()) return;

    const finalTitle = streamTitle.trim() || streamUrl.split("/").pop() || "Network Stream";
    const isAudio =
      streamUrl.includes(".mp3") ||
      streamUrl.includes("somafm") ||
      streamUrl.includes("radio");

    const mediaItem: MediaItem = {
      id: `stream-${Date.now()}`,
      title: finalTitle,
      src: streamUrl.trim(),
      type: isAudio ? "music" : "stream",
      category: "Network Stream",
      codec: streamUrl.includes(".m3u8") ? "HLS Live" : "HTTP Stream",
      thumbnail: isAudio
        ? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    };

    saveRecentStream(streamUrl.trim(), finalTitle);
    addToQueue(mediaItem, false);
    toggleStreamModal();
    showOsd(`Queued Stream: ${finalTitle}`);
  };

  return (
    <AnimatePresence>
      {isStreamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleStreamModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-xl rounded-3xl bg-[#161622]/95 border border-[#262635] shadow-[0_24px_64px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden flex flex-col z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#262635]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-[#FF5C00]/20 text-[#FF5C00] shadow-[0_0_16px_rgba(255,92,0,0.3)]">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F4F4F7]">
                    Open Network Stream
                  </h3>
                  <p className="text-xs text-[#8A8A9E]">
                    Play online videos, HLS streams (.m3u8), IPTV channels, or web radio.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleStreamModal}
                className="p-1.5 rounded-xl text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#262635] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handlePlayNow} className="p-6 space-y-4">
              {/* URL Input with Quick-Paste */}
              <div>
                <label className="block text-xs font-semibold text-[#F4F4F7] mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#FF5C00]" />
                    Stream URL or M3U8 Link
                  </span>
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="flex items-center gap-1 text-[11px] text-[#FF5C00] hover:underline cursor-pointer font-medium"
                  >
                    {copiedSuccess ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">Pasted!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3 h-3" />
                        <span>Paste from Clipboard</span>
                      </>
                    )}
                  </button>
                </label>

                <div className="relative flex items-center">
                  <input
                    type="url"
                    required
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="https://example.com/live/playlist.m3u8"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A26] border border-[#262635] text-xs text-[#F4F4F7] placeholder-[#8A8A9E]/60 focus:outline-none focus:border-[#FF5C00] transition-colors font-mono"
                  />
                  {streamUrl && (
                    <button
                      type="button"
                      onClick={() => setStreamUrl("")}
                      className="absolute right-3 p-1 text-[#8A8A9E] hover:text-[#F4F4F7] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stream Title (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-[#8A8A9E] mb-1.5">
                  Stream Title (Optional)
                </label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="e.g. My Favorite Radio Channel"
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A26] border border-[#262635] text-xs text-[#F4F4F7] placeholder-[#8A8A9E]/60 focus:outline-none focus:border-[#FF5C00] transition-colors"
                />
              </div>

              {/* Curated Public Streams & IPTV Test Presets */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#F4F4F7] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5C00]" />
                    Public IPTV & HLS Stream Presets
                  </span>
                  <span className="text-[10px] text-[#8A8A9E]">
                    Click to load preset
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#262635]">
                  {PUBLIC_PRESETS.map((preset) => (
                    <div
                      key={preset.title}
                      onClick={() => handleSelectPreset(preset)}
                      className={cn(
                        "flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer text-left",
                        streamUrl === preset.url
                          ? "bg-[#FF5C00]/20 border-[#FF5C00] shadow-[0_0_12px_rgba(255,92,0,0.25)]"
                          : "bg-[#1A1A26] border-[#262635] hover:border-[#3A3A4E] hover:bg-[#202030]"
                      )}
                    >
                      <div className="p-1.5 rounded-lg bg-[#262635] text-[#FF5C00] shrink-0 mt-0.5">
                        {preset.category === "iptv" ? (
                          <Tv className="w-3.5 h-3.5" />
                        ) : preset.category === "radio" ? (
                          <Music className="w-3.5 h-3.5" />
                        ) : (
                          <Film className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-[11px] font-semibold text-[#F4F4F7] truncate">
                            {preset.title}
                          </h5>
                          <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-[#FF5C00]/20 text-[#FF5C00] uppercase shrink-0">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8A8A9E] truncate mt-0.5">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Streams History */}
              {recentStreams.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-[#8A8A9E] flex items-center gap-1.5 mb-1.5">
                    <History className="w-3 h-3" />
                    Recently Played Streams
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recentStreams.slice(0, 4).map((rec) => (
                      <button
                        key={rec.url}
                        type="button"
                        onClick={() => {
                          setStreamUrl(rec.url);
                          setStreamTitle(rec.title);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#1A1A26] border border-[#262635] hover:border-[#FF5C00]/50 text-[10px] text-[#8A8A9E] hover:text-[#F4F4F7] transition-colors truncate max-w-[200px] cursor-pointer"
                        title={rec.url}
                      >
                        {rec.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262635]">
                <button
                  type="button"
                  onClick={toggleStreamModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!streamUrl.trim()}
                  onClick={handleAddToQueue}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#262635] hover:bg-[#333345] text-[#F4F4F7] text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Queue</span>
                </button>

                <button
                  type="submit"
                  disabled={!streamUrl.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5C00] to-[#FF7526] hover:brightness-110 text-white text-xs font-bold transition-all shadow-[0_4px_16px_rgba(255,92,0,0.4)] disabled:opacity-40 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Stream Now</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
