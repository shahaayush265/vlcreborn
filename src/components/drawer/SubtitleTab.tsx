import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Type,
  RotateCcw,
  Sparkles,
  Check,
  BookmarkCheck,
  Plus,
  Sliders,
  ChevronDown,
  FolderSearch,
  Download,
  Magnet,
} from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { importSubtitleFile } from "../../lib/subtitleScanner";
import { cn } from "../../lib/utils";

const FONT_OPTIONS = [
  { label: "Inter (Modern Sans)", value: "Inter, sans-serif" },
  { label: "Roboto (Clean)", value: "Roboto, sans-serif" },
  { label: "Outfit (Futuristic)", value: "Outfit, sans-serif" },
  { label: "Fira Code (Monospace)", value: "'Fira Code', monospace" },
  { label: "Georgia (Serif Elegance)", value: "Georgia, serif" },
  { label: "Trebuchet (High Legibility)", value: "'Trebuchet MS', sans-serif" },
];

const PRESET_COLORS = [
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Cinema Yellow", hex: "#FFE600" },
  { name: "Warm Amber", hex: "#FFAA00" },
  { name: "Cyan Ice", hex: "#5CE1E6" },
  { name: "VLC Orange", hex: "#FF5C00" },
];

export const SubtitleTab: React.FC = () => {
  const {
    subtitleSettings,
    setSubtitleSettings,
    resetSubtitleSettings,
    subtitleTracks,
    subtitles,
    currentMedia,
    currentTime,
    isSubtitleSyncOpen,
    toggleSubtitleSync,
    selectSubtitleTrack,
    addSubtitleTrack,
    autoDiscoverSubtitles,
    alignNearestCueToTime,
    exportCurrentSubtitles,
    showOsd,
  } = usePlayerStore();

  const {
    delay,
    fontFamily,
    sizeMode,
    relativeSize,
    preciseSize,
    outlineWidth,
    verticalPosition,
    textColor,
    backgroundColor,
    saveForSeries,
    selectedTrackId,
  } = subtitleSettings;

  const handleDelayChange = (val: number) => {
    const clamped = Math.max(-5000, Math.min(5000, val));
    setSubtitleSettings({ delay: clamped });
    showOsd(`Subtitle Delay: ${clamped > 0 ? "+" : ""}${clamped} ms`);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { track, cues } = await importSubtitleFile(file);
        addSubtitleTrack(track, cues, true);
        showOsd(`Loaded Subtitle: ${file.name} (${cues.length} cues)`);
      } catch (err) {
        console.error("Failed importing subtitle:", err);
        showOsd(`Failed to load ${file.name}`);
      }
    }
  };

  const [isTrackDropdownOpen, setIsTrackDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsTrackDropdownOpen(false);
      }
    };
    if (isTrackDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isTrackDropdownOpen]);

  const activeTrack = subtitleTracks.find((t) => t.id === selectedTrackId);

  return (
    <div className="flex flex-col gap-6 text-sm">
      {/* Header Summary & Reset */}
      <div className="flex items-center justify-between pb-1 border-b border-[#262635]">
        <div>
          <h3 className="text-base font-bold text-[#F4F4F7] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5C00] animate-pulse" />
            Subtitle Deck
          </h3>
          <p className="text-xs text-[#8A8A9E] mt-0.5">
            Timing offset, precise typography & rendering styling
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetSubtitleSettings();
            showOsd("Subtitle settings reset to default");
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] transition-colors cursor-pointer"
          title="Reset to defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Visual Subtitle Matcher Hero Card (Phase 3 Core Feature) */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E1E2A] via-[#16161E] to-[#121218] border border-[#FF5C00]/30 shadow-[0_8px_24px_rgba(255,92,0,0.12)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF5C00]/20 text-[#FF5C00] border border-[#FF5C00]/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F4F4F7] flex items-center gap-2">
                <span>Visual Timeline Matcher</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FF5C00]/20 text-[#FF5C00]">
                  Juxtopposed
                </span>
              </div>
              <div className="text-[11px] text-[#8A8A9E]">
                Scrub & drag cues along the seekbar to align with audio
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleSubtitleSync}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isSubtitleSyncOpen
                ? "bg-[#FF5C00] text-white shadow-[0_0_12px_rgba(255,92,0,0.4)]"
                : "bg-[#1F1F2B] hover:bg-[#28283B] text-[#F4F4F7] border border-[#262635]"
            }`}
          >
            {isSubtitleSyncOpen ? "Close Matcher" : "Open Matcher"}
          </button>
        </div>

        {/* Quick Matcher Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#262635]">
          <button
            type="button"
            onClick={() => alignNearestCueToTime(currentTime)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A1A26] hover:bg-[#232334] border border-[#262635] text-xs font-medium text-[#F4F4F7] transition-all cursor-pointer"
            title="Snap nearest dialogue cue start to current playback time"
          >
            <Magnet className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>Snap to Playhead</span>
          </button>

          <button
            type="button"
            onClick={() => exportCurrentSubtitles("srt")}
            disabled={subtitles.length === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A1A26] hover:bg-[#232334] disabled:opacity-40 border border-[#262635] text-xs font-medium text-[#F4F4F7] transition-all cursor-pointer"
            title="Download synced subtitle file (.srt)"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Synced .SRT</span>
          </button>
        </div>
      </div>

      {/* Subtitle Track Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center justify-between">
          <span>Active Subtitle Track</span>
          <span className="text-[11px] font-mono text-[#FF5C00]">
            {subtitleTracks.length} available {subtitles.length > 0 && `(${subtitles.length} cues)`}
          </span>
        </label>
        {/* Unclipped Custom Floating Track Dropdown */}
        <div ref={dropdownRef} className="relative z-30">
          <button
            type="button"
            onClick={() => setIsTrackDropdownOpen(!isTrackDropdownOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#1F1F2B] hover:bg-[#252535] border border-[#262635] hover:border-[#FF5C00]/50 text-[#F4F4F7] text-xs font-medium transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <span className={cn("w-2 h-2 rounded-full", activeTrack ? "bg-[#FF5C00]" : "bg-[#8A8A9E]/40")} />
              <span className="truncate">
                {activeTrack ? activeTrack.label : "Disabled (None)"}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-[#8A8A9E] transition-transform duration-200 shrink-0",
                isTrackDropdownOpen && "rotate-180 text-[#FF5C00]"
              )}
            />
          </button>

          {/* Floating Dropdown List (Unclipped) */}
          <AnimatePresence>
            {isTrackDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-2xl bg-[#191924] border border-[#3A3A4E] shadow-[0_16px_40px_rgba(0,0,0,0.9)] backdrop-blur-3xl z-50 flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar"
              >
                {/* Disabled Option */}
                <button
                  type="button"
                  onClick={() => {
                    selectSubtitleTrack("");
                    setIsTrackDropdownOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left",
                    !selectedTrackId
                      ? "bg-[#FF5C00]/20 text-[#FF5C00] font-semibold"
                      : "text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#252535]"
                  )}
                >
                  <span>Disabled (None)</span>
                  {!selectedTrackId && <Check className="w-3.5 h-3.5 text-[#FF5C00]" />}
                </button>

                {subtitleTracks.map((track) => {
                  const isSelected = selectedTrackId === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        selectSubtitleTrack(track.id);
                        setIsTrackDropdownOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left gap-2",
                        isSelected
                          ? "bg-[#FF5C00]/20 text-[#FF5C00] font-semibold"
                          : "text-[#F4F4F7] hover:bg-[#252535]"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">{track.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {track.format && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-[#262635] text-[#8A8A9E]">
                            {track.format}
                          </span>
                        )}
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FF5C00]" />}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {activeTrack && (
          <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-[#1F1F2B]/60 border border-[#262635] text-[11px] text-[#8A8A9E]">
            <span className="truncate text-[#F4F4F7] font-medium">{activeTrack.label}</span>
            {activeTrack.format && (
              <span className="uppercase px-1.5 py-0.5 rounded bg-[#2A2A3B] text-[#FF5C00] font-mono text-[10px] font-bold">
                {activeTrack.format}
              </span>
            )}
          </div>
        )}

        {/* Action Row: Load External .SRT / .VTT and Scan Folder */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#16161E] hover:bg-[#1F1F2B] border border-[#262635] text-xs font-medium text-[#C2C2D1] hover:text-[#F4F4F7] cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>Import .SRT / .VTT</span>
            <input
              type="file"
              accept=".srt,.vtt,.ass"
              className="hidden"
              onChange={handleFileImport}
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (currentMedia?.src) {
                autoDiscoverSubtitles(currentMedia.src, currentMedia.title);
                showOsd("Auto-discovered matching subtitle tracks");
              } else {
                showOsd("Please load a video first to scan folder");
              }
            }}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#16161E] hover:bg-[#1F1F2B] border border-[#262635] text-xs font-medium text-[#C2C2D1] hover:text-[#F4F4F7] cursor-pointer transition-colors"
            title="Scan current video folder for subtitles matching title"
          >
            <FolderSearch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scan Folder</span>
          </button>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="relative p-4 rounded-2xl bg-gradient-to-b from-[#121218] to-[#0A0A0E] border border-[#262635] overflow-hidden flex flex-col items-center justify-center min-h-[90px] shadow-inner">
        <div className="absolute top-2 left-3 text-[10px] uppercase font-mono tracking-wider text-[#8A8A9E]/60 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#FF5C00]" />
          <span>Real-time Subtitle Preview</span>
        </div>
        <div
          className="text-center font-medium transition-all duration-150 select-none px-4 py-1.5 mt-2 rounded-md"
          style={{
            fontFamily,
            fontSize: sizeMode === "relative" ? `${(relativeSize / 100) * 1.15}rem` : `${preciseSize}pt`,
            color: textColor,
            backgroundColor: backgroundColor,
            textShadow:
              outlineWidth > 0
                ? `0px 0px ${outlineWidth * 2}px #000, 0px 0px ${outlineWidth}px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`
                : "0 2px 8px rgba(0,0,0,0.8)",
          }}
        >
          “The quick brown fox jumps over the lazy dog.”
        </div>
      </div>

      {/* Subtitle Delay Timing Section */}
      <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[#16161E]/60 border border-[#262635]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>Subtitle Delay Offset</span>
          </label>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
              delay === 0
                ? "bg-[#1F1F2B] text-[#8A8A9E]"
                : delay > 0
                ? "bg-[#FF5C00]/20 text-[#FF5C00] border border-[#FF5C00]/30"
                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            }`}
          >
            {delay > 0 ? `+${delay} ms` : `${delay} ms`}
          </span>
        </div>

        {/* Center-balanced Delay Range Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#8A8A9E]">-5.0s</span>
          <div className="relative flex-1 flex items-center">
            {/* Center zero tick */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-[#FF5C00]/50 pointer-events-none" />
            <input
              type="range"
              min="-5000"
              max="5000"
              step="50"
              value={delay}
              onChange={(e) => handleDelayChange(parseInt(e.target.value, 10))}
              className="w-full h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
            />
          </div>
          <span className="text-[10px] font-mono text-[#8A8A9E]">+5.0s</span>
        </div>

        {/* Quick Stepper Buttons */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => handleDelayChange(delay - 250)}
            className="py-1 px-1 text-[11px] font-mono rounded-lg bg-[#1F1F2B] hover:bg-[#282837] text-[#C2C2D1] hover:text-[#F4F4F7] transition-colors text-center cursor-pointer"
          >
            -250ms
          </button>
          <button
            type="button"
            onClick={() => handleDelayChange(delay - 50)}
            className="py-1 px-1 text-[11px] font-mono rounded-lg bg-[#1F1F2B] hover:bg-[#282837] text-[#C2C2D1] hover:text-[#F4F4F7] transition-colors text-center cursor-pointer"
          >
            -50ms
          </button>
          <button
            type="button"
            onClick={() => handleDelayChange(0)}
            className="py-1 px-1 text-[11px] font-mono rounded-lg bg-[#2A2A3B] hover:bg-[#323246] text-[#FF5C00] font-bold transition-colors text-center cursor-pointer"
          >
            Sync (0)
          </button>
          <button
            type="button"
            onClick={() => handleDelayChange(delay + 50)}
            className="py-1 px-1 text-[11px] font-mono rounded-lg bg-[#1F1F2B] hover:bg-[#282837] text-[#C2C2D1] hover:text-[#F4F4F7] transition-colors text-center cursor-pointer"
          >
            +50ms
          </button>
          <button
            type="button"
            onClick={() => handleDelayChange(delay + 250)}
            className="py-1 px-1 text-[11px] font-mono rounded-lg bg-[#1F1F2B] hover:bg-[#282837] text-[#C2C2D1] hover:text-[#F4F4F7] transition-colors text-center cursor-pointer"
          >
            +250ms
          </button>
        </div>
      </div>

      {/* Typography & Font Settings */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#16161E]/60 border border-[#262635]">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-[#FF5C00]" />
          <span>Typography & Formatting</span>
        </label>

        {/* Font Selection Dropdown */}
        <div className="flex flex-col gap-1.5">
          <div className="text-xs text-[#8A8A9E]">Font Family</div>
          <div className="relative">
            <select
              value={fontFamily}
              onChange={(e) => setSubtitleSettings({ fontFamily: e.target.value })}
              className="w-full appearance-none px-3.5 py-2 rounded-xl bg-[#1F1F2B] border border-[#262635] text-[#F4F4F7] text-xs font-medium hover:border-[#3A3A4E] focus:border-[#FF5C00] focus:outline-none transition-colors cursor-pointer pr-9"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9E] pointer-events-none" />
          </div>
        </div>

        {/* Size Mode Toggle: Relative (%) vs Precise (pt) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8A8A9E]">Font Sizing Mode</span>
            <div className="flex items-center p-0.5 rounded-lg bg-[#1F1F2B] border border-[#262635]">
              <button
                type="button"
                onClick={() => setSubtitleSettings({ sizeMode: "relative" })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  sizeMode === "relative"
                    ? "bg-[#FF5C00] text-white shadow-sm font-semibold"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                Relative (%)
              </button>
              <button
                type="button"
                onClick={() => setSubtitleSettings({ sizeMode: "precise" })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  sizeMode === "precise"
                    ? "bg-[#FF5C00] text-white shadow-sm font-semibold"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                Precise (pt)
              </button>
            </div>
          </div>

          {/* Size Slider based on mode */}
          {sizeMode === "relative" ? (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="70"
                max="200"
                step="5"
                value={relativeSize}
                onChange={(e) =>
                  setSubtitleSettings({ relativeSize: parseInt(e.target.value, 10) })
                }
                className="flex-1 h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
              />
              <span className="w-12 text-right text-xs font-mono font-bold text-[#F4F4F7]">
                {relativeSize}%
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="12"
                max="48"
                step="1"
                value={preciseSize}
                onChange={(e) =>
                  setSubtitleSettings({ preciseSize: parseInt(e.target.value, 10) })
                }
                className="flex-1 h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
              />
              <span className="w-12 text-right text-xs font-mono font-bold text-[#F4F4F7]">
                {preciseSize} pt
              </span>
            </div>
          )}
        </div>

        {/* Outline Width Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8A8A9E]">Outline / Shadow Stroke</span>
            <span className="font-mono text-[#F4F4F7] font-semibold">{outlineWidth} px</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={outlineWidth}
              onChange={(e) =>
                setSubtitleSettings({ outlineWidth: parseInt(e.target.value, 10) })
              }
              className="flex-1 h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
            />
          </div>
        </div>

        {/* Vertical Position Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8A8A9E]">Vertical Position (From Bottom)</span>
            <span className="font-mono text-[#F4F4F7] font-semibold">{verticalPosition}%</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="2"
              max="40"
              step="1"
              value={verticalPosition}
              onChange={(e) =>
                setSubtitleSettings({ verticalPosition: parseInt(e.target.value, 10) })
              }
              className="flex-1 h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
            />
          </div>
        </div>

        {/* Color Palette Chips */}
        <div className="flex flex-col gap-2">
          <div className="text-xs text-[#8A8A9E]">Text Color Accent</div>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setSubtitleSettings({ textColor: c.hex })}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer border ${
                  textColor === c.hex
                    ? "scale-115 ring-2 ring-[#FF5C00] border-white"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {textColor === c.hex && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      c.hex === "#FFFFFF" || c.hex === "#FFE600" || c.hex === "#5CE1E6"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                )}
              </button>
            ))}

            <div className="w-px h-5 bg-[#262635] mx-1" />

            {/* Background pill box toggle */}
            <button
              type="button"
              onClick={() =>
                setSubtitleSettings({
                  backgroundColor:
                    backgroundColor === "transparent" ? "rgba(0,0,0,0.75)" : "transparent",
                })
              }
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                backgroundColor !== "transparent"
                  ? "bg-[#FF5C00]/20 border-[#FF5C00]/50 text-[#FF5C00]"
                  : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7]"
              }`}
            >
              Background Box
            </button>
          </div>
        </div>
      </div>

      {/* Quick-Preset Loader: Save for this series */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1F1F2B] to-[#16161E] border border-[#262635] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#FF5C00]/10 border border-[#FF5C00]/20 text-[#FF5C00]">
            <BookmarkCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#F4F4F7]">
              Save for this Series / Folder
            </div>
            <div className="text-[11px] text-[#8A8A9E]">
              Remember offset & formatting for matching episodes
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !saveForSeries;
            setSubtitleSettings({ saveForSeries: next });
            showOsd(next ? "Subtitle preset saved for series" : "Series preset unlinked");
          }}
          className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
            saveForSeries ? "bg-[#FF5C00]" : "bg-[#262635]"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
              saveForSeries ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
};
