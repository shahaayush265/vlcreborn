import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Palette,
  ShieldCheck,
  Keyboard,
  PlaySquare,
  Film,
  Volume2,
  Subtitles,
  FolderTree,
  Cpu,
  X,
  Search,
  RotateCcw,
  Settings as SettingsIcon,
} from "lucide-react";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { SettingsCategory } from "../../types/settings";
import { GeneralTab } from "./tabs/GeneralTab";
import { InterfaceTab } from "./tabs/InterfaceTab";
import { PrivacyTab } from "./tabs/PrivacyTab";
import { ControlsTab } from "./tabs/ControlsTab";
import { PlaybackTabConfig } from "./tabs/PlaybackTabConfig";
import { VideoTabConfig } from "./tabs/VideoTabConfig";
import { AudioTabConfig } from "./tabs/AudioTabConfig";
import { SubtitlesTabConfig } from "./tabs/SubtitlesTabConfig";
import { LibraryTabConfig } from "./tabs/LibraryTabConfig";
import { PerformanceTabConfig } from "./tabs/PerformanceTabConfig";

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    activeCategory,
    searchQuery,
    closeSettings,
    setActiveCategory,
    setSearchQuery,
    resetCategory,
    resetAll,
  } = useSettingsStore();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSettingsOpen) {
        closeSettings();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, closeSettings]);

  const categories: {
    id: SettingsCategory;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "general",
      label: "General",
      description: "Startup, resume playback, and system tray",
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: "interface",
      label: "Interface & Themes",
      description: "Dark, OLED, Light themes & VLC accent picker",
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: "privacy",
      label: "Privacy & Data",
      description: "History tracking and metadata scraping",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: "controls",
      label: "Controls & Hotkeys",
      description: "Visual keyboard layout inspector & seek steps",
      icon: <Keyboard className="w-4 h-4" />,
    },
    {
      id: "playback",
      label: "Playback",
      description: "Hardware decoding APIs & queue behavior",
      icon: <PlaySquare className="w-4 h-4" />,
    },
    {
      id: "video",
      label: "Video",
      description: "Aspect ratios, deinterlacing, and color space",
      icon: <Film className="w-4 h-4" />,
    },
    {
      id: "audio",
      label: "Audio",
      description: "125% conical boost, night mode, and spatializer",
      icon: <Volume2 className="w-4 h-4" />,
    },
    {
      id: "subtitles",
      label: "Subtitles",
      description: "Auto-discovery, fonts, and speech sync sensitivity",
      icon: <Subtitles className="w-4 h-4" />,
    },
    {
      id: "library",
      label: "Library",
      description: "Local media indexing & real video frame thumbnails",
      icon: <FolderTree className="w-4 h-4" />,
    },
    {
      id: "performance",
      label: "Performance",
      description: "GPU acceleration, storyboard pre-warming & cache",
      icon: <Cpu className="w-4 h-4" />,
    },
  ];

  const currentCategoryInfo = categories.find((c) => c.id === activeCategory);

  const renderActiveTabContent = () => {
    switch (activeCategory) {
      case "general":
        return <GeneralTab />;
      case "interface":
        return <InterfaceTab />;
      case "privacy":
        return <PrivacyTab />;
      case "controls":
        return <ControlsTab />;
      case "playback":
        return <PlaybackTabConfig />;
      case "video":
        return <VideoTabConfig />;
      case "audio":
        return <AudioTabConfig />;
      case "subtitles":
        return <SubtitlesTabConfig />;
      case "library":
        return <LibraryTabConfig />;
      case "performance":
        return <PerformanceTabConfig />;
      default:
        return <GeneralTab />;
    }
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div
          id="vlc-settings-modal"
          className="fixed inset-0 z-55 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md select-none"
          onClick={closeSettings}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl h-[85vh] max-h-[720px] rounded-3xl bg-[#0F0F17]/95 border border-[#2E2E42] shadow-[0_24px_70px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden flex flex-col text-[#F4F4F7]"
          >
            {/* Header: Title, Search, and Close */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262635] bg-[#14141E]/80 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-2xl text-white flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, var(--dynamic-accent, #FF5C00), var(--dynamic-accent-hover, #FF7526))",
                    boxShadow: "0 0 16px var(--dynamic-accent-glow, rgba(255,92,0,0.4))",
                  }}
                >
                  <SettingsIcon className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#F4F4F7] tracking-wide flex items-center gap-2">
                    <span>Preferences & Settings</span>
                    <span
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: "var(--dynamic-accent-dim)",
                        color: "var(--dynamic-accent)",
                        borderColor: "var(--dynamic-accent-border, var(--dynamic-accent-dim))",
                      }}
                    >
                      VLC 4.0 Refined
                    </span>
                  </h2>
                  <p className="text-[11px] text-[#8A8A9E] mt-0.5">
                    Unified 10-domain preferences with human-readable configuration
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search across settings */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A9E]" />
                  <input
                    type="text"
                    placeholder="Search preferences..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-[#1B1B26] border border-[#2E2E42] rounded-xl text-xs text-[#F4F4F7] placeholder-[#8A8A9E]/60 focus:outline-none w-48 sm:w-60 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8A9E] hover:text-[#F4F4F7] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={closeSettings}
                  className="p-2 rounded-xl text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1E1E2C] transition-all cursor-pointer"
                  title="Close Preferences (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Area: Left Category Navigation & Right Content View */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Left Sidebar: 10 Categories */}
              <div className="w-64 border-r border-[#262635] bg-[#12121A]/60 flex flex-col p-3 gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#262635] shrink-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8A8A9E] px-2 py-1">
                  Domains
                </span>

                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setSearchQuery("");
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? "text-white font-semibold"
                          : "text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1B1B26]"
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: "var(--dynamic-accent, #FF5C00)",
                              boxShadow: "0 4px 20px var(--dynamic-accent-glow, rgba(255,92,0,0.35))",
                            }
                          : undefined
                      }
                    >
                      <div
                        className="shrink-0"
                        style={{
                          color: isActive ? "#ffffff" : "var(--dynamic-accent, #FF5C00)",
                        }}
                      >
                        {cat.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs truncate">{cat.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Content View */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#0F0F17]/90 overflow-hidden">
                {/* Domain Header */}
                <div className="px-6 py-3.5 border-b border-[#262635]/60 bg-[#161622]/40 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div style={{ color: "var(--dynamic-accent, #FF5C00)" }}>
                      {currentCategoryInfo?.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#F4F4F7] uppercase tracking-wider font-mono">
                        {currentCategoryInfo?.label}
                      </h3>
                      <p className="text-[11px] text-[#8A8A9E]">
                        {currentCategoryInfo?.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => resetCategory(activeCategory)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1B1B26] hover:bg-[#2A2A3C] text-[11px] text-[#8A8A9E] hover:text-[#F4F4F7] border border-[#2E2E42] cursor-pointer transition-all"
                    title={`Reset ${currentCategoryInfo?.label} settings to default`}
                  >
                    <RotateCcw className="w-3 h-3" style={{ color: "var(--dynamic-accent, #FF5C00)" }} />
                    <span>Reset Domain</span>
                  </button>
                </div>

                {/* Scrollable Tab Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#262635]">
                  {renderActiveTabContent()}
                </div>
              </div>
            </div>

            {/* Footer: Global Actions & Confirmation */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-[#262635] bg-[#14141E]/90 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C28] hover:bg-rose-500/20 text-xs text-[#8A8A9E] hover:text-rose-300 border border-[#2E2E42] hover:border-rose-500/40 cursor-pointer transition-all"
                  title="Reset all 10 categories to factory settings"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All to Defaults</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#8A8A9E] hidden sm:inline">
                  Settings are autosaved and persisted in your local profile
                </span>

                <button
                  type="button"
                  onClick={closeSettings}
                  className="px-4 py-1.5 rounded-xl text-white text-xs font-semibold cursor-pointer transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, var(--dynamic-accent, #FF5C00), var(--dynamic-accent-hover, #FF7526))",
                    boxShadow: "0 2px 14px var(--dynamic-accent-glow, rgba(255,92,0,0.35))",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
