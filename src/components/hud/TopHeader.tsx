import React, { useState, useEffect } from "react";
import {
  Folder,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  Minus,
  Square,
  X,
  ChevronRight,
  HardDrive,
  Settings as SettingsIcon,
} from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { cn } from "../../lib/utils";

interface TopHeaderProps {
  isIdle: boolean;
  videoElement: HTMLVideoElement | null;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ isIdle, videoElement }) => {
  const [isNearTop, setIsNearTop] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const {
    currentMedia,
    isFullscreen,
    activeDeckTab,
    toggleFullscreen,
    toggleLibrary,
  } = usePlayerStore();

  const showBreadcrumbs = useSettingsStore((s) => s.interface.showBreadcrumbs);
  const acrylicTexture = useSettingsStore((s) => s.interface.acrylicTexture);

  // Reveal top header when mouse is within 70px from top bounds (unless hovering over the inspector deck)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const isOverFloatingDeck =
        activeDeckTab !== null &&
        e.clientX > window.innerWidth - 460 &&
        e.clientY > 60;
      setIsNearTop(e.clientY < 70 && !isOverFloatingDeck);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [activeDeckTab]);

  // Listen for Picture-in-Picture state changes
  useEffect(() => {
    const handleEnterPiP = () => setIsPiPActive(true);
    const handleLeavePiP = () => setIsPiPActive(false);

    const video = videoElement;
    if (video) {
      video.addEventListener("enterpictureinpicture", handleEnterPiP);
      video.addEventListener("leavepictureinpicture", handleLeavePiP);
    }

    return () => {
      if (video) {
        video.removeEventListener("enterpictureinpicture", handleEnterPiP);
        video.removeEventListener("leavepictureinpicture", handleLeavePiP);
      }
    };
  }, [videoElement]);

  const togglePiP = async () => {
    if (!videoElement) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoElement.requestPictureInPicture();
      }
    } catch (err) {
      console.warn("Picture-in-picture error:", err);
    }
  };

  // Safe window control triggers (works in Tauri 2 or web environment)
  const handleMinimize = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().minimize();
    } catch {
      // Running in standard browser
      console.info("Window minimize requested");
    }
  };

  const handleMaximize = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().toggleMaximize();
    } catch {
      toggleFullscreen();
    }
  };

  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().close();
    } catch {
      console.info("Window close requested");
    }
  };

  const isVisible = !currentMedia || isNearTop || (!isIdle && isNearTop);

  // Extract clean breadcrumbs from media title or path
  const mediaTitle = currentMedia?.title || "No Media Loaded";
  const breadcrumbParts = mediaTitle.includes("/")
    ? mediaTitle.split("/").filter(Boolean)
    : ["Media", mediaTitle];

  return (
    <header
      className={cn(
        "absolute top-0 left-0 right-0 z-35 transition-all duration-300 pointer-events-none select-none",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2"
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "pointer-events-auto flex items-center justify-between px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-200",
          acrylicTexture === "solid"
            ? "bg-[#0D0D15] border-b border-white/[0.08]"
            : acrylicTexture === "glass"
            ? "bg-[#0D0D15]/65 backdrop-blur-md border-b border-white/[0.08]"
            : "bg-[#0D0D15]/80 backdrop-blur-3xl backdrop-saturate-180 border-b border-white/[0.08]"
        )}
      >
        {/* Left: Breadcrumbs & Library trigger */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#8A8A9E] select-none">
          <button
            type="button"
            onClick={toggleLibrary}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#16161E] hover:bg-[#1F1F2B] border border-[#262635] text-[#F4F4F7] hover:border-[var(--dynamic-accent)]/50 transition-all cursor-pointer group"
            title="Open Media Library (L)"
          >
            <HardDrive
              className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
              style={{ color: "var(--dynamic-accent, #FF5C00)" }}
            />
            <span className="font-semibold text-[#F4F4F7]">Library</span>
          </button>

          {showBreadcrumbs && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#8A8A9E]/60" />

              <div className="flex items-center gap-1.5 text-[#8A8A9E]">
                <Folder className="w-3.5 h-3.5" />
                <span className="hover:text-[#F4F4F7] transition-colors truncate max-w-[140px]">
                  {breadcrumbParts[0]}
                </span>
              </div>

              {breadcrumbParts.length > 1 && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8A8A9E]/60" />
                  <span className="text-[#F4F4F7] font-semibold truncate max-w-[240px]">
                    {breadcrumbParts[breadcrumbParts.length - 1]}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Right: PiP, Fullscreen, and Window Controls */}
        <div className="flex items-center gap-1.5">
          {/* Picture in Picture */}
          {document.pictureInPictureEnabled && (
            <button
              type="button"
              onClick={togglePiP}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isPiPActive
                  ? "bg-[var(--dynamic-accent-dim)] text-[var(--dynamic-accent)]"
                  : "text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#16161E]"
              }`}
              title="Picture in Picture (P)"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#16161E] transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Preferences & Settings Trigger */}
          <button
            type="button"
            onClick={() => useSettingsStore.getState().openSettings()}
            className="p-2 rounded-lg text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#16161E] transition-colors cursor-pointer group/settings"
            title="Preferences & Settings (Ctrl+,)"
          >
            <SettingsIcon className="w-4 h-4 text-[#8A8A9E] group-hover/settings:text-[var(--dynamic-accent)] transition-colors" />
          </button>

          <div className="w-px h-4 bg-[#262635] mx-1" />

          {/* Window action buttons (Tauri / desktop style) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleMinimize}
              className="p-2 rounded-lg text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#16161E] transition-colors cursor-pointer"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleMaximize}
              className="p-2 rounded-lg text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#16161E] transition-colors cursor-pointer"
              title="Maximize"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg text-[#8A8A9E] hover:text-white hover:bg-rose-500/80 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
