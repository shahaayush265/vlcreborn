import React, { useRef, useState, useCallback } from "react";
import { Volume2, Volume1, VolumeX, Volume as VolumeIcon } from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { useSettingsStore } from "../../stores/useSettingsStore";

export const ConeVolume: React.FC = () => {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();
  const maxVolumeBoost = useSettingsStore((s) => s.audio.maxVolumeBoost) || 125;
  const MAX_VOLUME = maxVolumeBoost / 100;
  const notchX = (1.0 / MAX_VOLUME) * 100;

  const coneRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerVolume = useCallback(
    (clientX: number) => {
      if (!coneRef.current) return;
      const rect = coneRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const fraction = Math.max(0, Math.min(1, relativeX / rect.width));
      // Map 0 -> 1 linearly or with mild auditory curve up to MAX_VOLUME
      const newVolume = fraction * MAX_VOLUME;
      setVolume(newVolume);
    },
    [setVolume, MAX_VOLUME]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    coneRef.current?.setPointerCapture(e.pointerId);
    setIsDragging(true);
    handlePointerVolume(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      handlePointerVolume(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      if (coneRef.current?.hasPointerCapture(e.pointerId)) {
        coneRef.current.releasePointerCapture(e.pointerId);
      }
      setIsDragging(false);
    }
  };

  // Mouse wheel scroll to adjust volume by 5%
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    const current = isMuted ? 0 : volume;
    setVolume(Math.max(0, Math.min(MAX_VOLUME, current + delta)));
  };

  const currentVolume = isMuted ? 0 : volume;
  const currentPercent = (currentVolume / MAX_VOLUME) * 100;
  const displayPercent = Math.round(currentVolume * 100);
  const isBoosted = currentVolume > 1.0;

  // Icon based on volume level
  const VolumeGlyph = () => {
    if (isMuted || currentVolume === 0) return <VolumeX className="w-4 h-4 text-[#8A8A9E]" />;
    if (currentVolume < 0.4) return <VolumeIcon className="w-4 h-4 text-[#F4F4F7]" />;
    if (currentVolume <= 1.0) return <Volume1 className="w-4 h-4 text-[#F4F4F7]" />;
    return <Volume2 className="w-4 h-4" style={{ color: "var(--dynamic-accent, #FF5C00)" }} />;
  };

  return (
    <div
      className="relative flex items-center gap-2 select-none"
      onClick={(e) => e.stopPropagation()}
      onWheel={handleWheel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mute / Unmute Button */}
      <button
        type="button"
        onClick={toggleMute}
        className="p-1.5 rounded-lg text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] transition-colors cursor-pointer"
        title={isMuted ? "Unmute (M)" : "Mute (M)"}
      >
        <VolumeGlyph />
      </button>

      {/* Floating Tooltip displaying exact percentage */}
      {(isHovered || isDragging) && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#16161E] border border-[#262635] text-[10px] font-mono font-bold text-[#F4F4F7] shadow-lg pointer-events-none whitespace-nowrap z-30">
          <span style={isBoosted ? { color: "var(--dynamic-accent, #FF5C00)" } : undefined}>
            {displayPercent}%
          </span>
          {isBoosted && (
            <span
              className="text-[9px] ml-1 font-bold"
              style={{ color: "var(--dynamic-accent, #FF5C00)" }}
            >
              (Boost)
            </span>
          )}
        </div>
      )}

      {/* Conical / Wedge Volume Slider (SVG Polygon Horn) */}
      <div
        ref={coneRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-[76px] h-[22px] flex items-center cursor-pointer touch-none group"
        title={`Volume: ${displayPercent}%`}
      >
        <svg
          viewBox="0 0 100 30"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="coneFillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--dynamic-accent-hover, #FF7A29)" />
              <stop offset="80%" stopColor="var(--dynamic-accent, #FF5C00)" />
              <stop offset="100%" stopColor="var(--dynamic-accent, #FF3D00)" />
            </linearGradient>

            {/* Clipping path for horizontal fill percentage */}
            <clipPath id="coneVolumeClip">
              <rect x="0" y="0" width={`${currentPercent}%`} height="30" />
            </clipPath>
          </defs>

          {/* Background Wedge (Empty Cone Track) */}
          <polygon
            points="0,12 100,2 100,28 0,18"
            className="fill-[#262635] group-hover:fill-[#323246] transition-colors"
          />

          {/* 100% Volume Divider Notch (if max boost > 100%) */}
          {MAX_VOLUME > 1.0 && (
            <line
              x1={notchX}
              y1="4"
              x2={notchX}
              y2="26"
              stroke="#16161E"
              strokeWidth="1.5"
              strokeDasharray="2,2"
            />
          )}

          {/* Active Filled Wedge clipped to volume percentage */}
          <polygon
            points="0,12 100,2 100,28 0,18"
            fill="url(#coneFillGrad)"
            clipPath="url(#coneVolumeClip)"
            className="transition-all duration-75"
          />

          {/* Boost Overdrive Glow */}
          {isBoosted && MAX_VOLUME > 1.0 && (
            <polygon
              points={`${notchX},4 100,2 100,28 ${notchX},26`}
              fill="var(--dynamic-accent, #FF5C00)"
              opacity="0.4"
              clipPath="url(#coneVolumeClip)"
            />
          )}
        </svg>

        {/* Position Notch / Pip indicator */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-4 rounded-full bg-white pointer-events-none transition-transform duration-75 ${
            isDragging || isHovered ? "scale-110 opacity-100" : "scale-75 opacity-70"
          }`}
          style={{
            left: `${Math.min(98, Math.max(2, currentPercent))}%`,
            boxShadow: "0 0 8px var(--dynamic-accent-glow, rgba(255,92,0,0.8))",
          }}
        />
      </div>
    </div>
  );
};
