import React from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Crop,
  Sun,
  Contrast,
  Palette,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  ZoomIn,
  Sparkles,
} from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { AspectRatioOption } from "../../types/player";

const ASPECT_RATIOS: { id: AspectRatioOption; label: string; desc: string }[] = [
  { id: "original", label: "Original", desc: "Native AR" },
  { id: "16:9", label: "16:9", desc: "Widescreen" },
  { id: "4:3", label: "4:3", desc: "Standard TV" },
  { id: "21:9", label: "21:9", desc: "Cinemascope" },
  { id: "1:1", label: "1:1", desc: "Square" },
  { id: "fill", label: "Fill / Crop", desc: "Edge-to-Edge" },
];

const COLOR_PRESETS = [
  {
    name: "Natural",
    settings: { brightness: 100, contrast: 100, gamma: 1.0, saturation: 100, hue: 0 },
  },
  {
    name: "Vibrant Cinema",
    settings: { brightness: 105, contrast: 115, gamma: 0.9, saturation: 130, hue: 0 },
  },
  {
    name: "Monochrome Noir",
    settings: { brightness: 100, contrast: 125, gamma: 1.0, saturation: 0, hue: 0 },
  },
  {
    name: "Warm Vintage",
    settings: { brightness: 105, contrast: 105, gamma: 1.1, saturation: 110, hue: 25 },
  },
  {
    name: "Cold Sci-Fi",
    settings: { brightness: 95, contrast: 120, gamma: 0.95, saturation: 115, hue: 200 },
  },
];

export const VideoTab: React.FC = () => {
  const {
    videoSettings,
    setVideoSettings,
    resetVideoSettings,
    showOsd,
  } = usePlayerStore();

  const {
    aspectRatio,
    flipHorizontal,
    flipVertical,
    rotation,
    zoom,
    brightness,
    contrast,
    gamma,
    saturation,
    hue,
  } = videoSettings;

  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setVideoSettings({ rotation: nextRot });
    showOsd(`Rotation: ${nextRot}°`);
  };

  const handleFlipH = () => {
    const next = !flipHorizontal;
    setVideoSettings({ flipHorizontal: next });
    showOsd(next ? "Flip Horizontal: ON" : "Flip Horizontal: OFF");
  };

  const handleFlipV = () => {
    const next = !flipVertical;
    setVideoSettings({ flipVertical: next });
    showOsd(next ? "Flip Vertical: ON" : "Flip Vertical: OFF");
  };

  return (
    <div className="flex flex-col gap-6 text-sm">
      {/* Header Summary & Reset */}
      <div className="flex items-center justify-between pb-1 border-b border-[#262635]">
        <div>
          <h3 className="text-base font-bold text-[#F4F4F7] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5C00] animate-pulse" />
            Video Deck
          </h3>
          <p className="text-xs text-[#8A8A9E] mt-0.5">
            Aspect ratio, geometry transforms & real-time color grading
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetVideoSettings();
            showOsd("Video adjustments reset to default");
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] transition-colors cursor-pointer"
          title="Reset to defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Aspect Ratio Switcher */}
      <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[#16161E]/60 border border-[#262635]">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Crop className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>Aspect Ratio</span>
          </span>
          <span className="text-xs font-mono text-[#FF5C00] font-bold">
            {aspectRatio.toUpperCase()}
          </span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {ASPECT_RATIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setVideoSettings({ aspectRatio: item.id });
                showOsd(`Aspect Ratio: ${item.label}`);
              }}
              className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                aspectRatio === item.id
                  ? "bg-[#FF5C00]/20 border-[#FF5C00]/60 text-white shadow-[0_0_12px_rgba(255,92,0,0.25)]"
                  : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:border-[#3A3A4E]"
              }`}
            >
              <span className="text-xs font-bold">{item.label}</span>
              <span className="text-[10px] opacity-75">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Geometry Transforms: Flip, Rotate, Pan/Crop Zoom */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#16161E]/60 border border-[#262635]">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF5C00]" />
          <span>Transform & Orientation</span>
        </label>

        {/* Quick Action Buttons: Flip H, Flip V, Rotate 90 */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleFlipH}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              flipHorizontal
                ? "bg-[#FF5C00]/20 border-[#FF5C00]/50 text-[#FF5C00] shadow-[0_0_10px_rgba(255,92,0,0.2)]"
                : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:border-[#3A3A4E]"
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
            <span>Flip H</span>
          </button>

          <button
            type="button"
            onClick={handleFlipV}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              flipVertical
                ? "bg-[#FF5C00]/20 border-[#FF5C00]/50 text-[#FF5C00] shadow-[0_0_10px_rgba(255,92,0,0.2)]"
                : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:border-[#3A3A4E]"
            }`}
          >
            <FlipVertical className="w-4 h-4" />
            <span>Flip V</span>
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="flex items-center justify-center gap-2 py-2 rounded-xl border bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:border-[#3A3A4E] text-xs font-medium transition-all cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-[#FF5C00]" />
            <span>{rotation > 0 ? `${rotation}°` : "Rotate 90°"}</span>
          </button>
        </div>

        {/* Pan / Crop Zoom Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8A8A9E] flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-[#FF5C00]" />
              <span>Pan & Crop Zoom</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#F4F4F7] font-semibold">
                {Math.round(zoom * 100)}%
              </span>
              {zoom !== 1.0 && (
                <button
                  type="button"
                  onClick={() => setVideoSettings({ zoom: 1.0 })}
                  className="text-[10px] text-[#FF5C00] hover:underline cursor-pointer"
                >
                  Reset (1x)
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.05"
              value={zoom}
              onChange={(e) =>
                setVideoSettings({ zoom: parseFloat(e.target.value) })
              }
              className="flex-1 h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
            />
          </div>
        </div>
      </div>

      {/* Color Adjustments: Brightness, Contrast, Gamma, Saturation */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#16161E]/60 border border-[#262635]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>Color & Image Filters</span>
          </label>
        </div>

        {/* Color Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-[#8A8A9E] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Color Look Presets</span>
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setVideoSettings(p.settings);
                  showOsd(`Filter: ${p.name}`);
                }}
                className="py-1.5 px-2 rounded-xl text-xs font-medium border bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:border-[#3A3A4E] transition-all cursor-pointer text-center"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Brightness */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8A8A9E] flex items-center gap-1">
              <Sun className="w-3.5 h-3.5" />
              <span>Brightness</span>
            </span>
            <span className="font-mono text-[#F4F4F7] font-semibold">{brightness}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            step="1"
            value={brightness}
            onChange={(e) =>
              setVideoSettings({ brightness: parseInt(e.target.value, 10) })
            }
            className="w-full h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
          />
        </div>

        {/* Contrast */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8A8A9E] flex items-center gap-1">
              <Contrast className="w-3.5 h-3.5" />
              <span>Contrast</span>
            </span>
            <span className="font-mono text-[#F4F4F7] font-semibold">{contrast}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            step="1"
            value={contrast}
            onChange={(e) =>
              setVideoSettings({ contrast: parseInt(e.target.value, 10) })
            }
            className="w-full h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
          />
        </div>

        {/* Gamma */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8A8A9E]">Gamma Curve</span>
            <span className="font-mono text-[#F4F4F7] font-semibold">{gamma.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={gamma}
            onChange={(e) =>
              setVideoSettings({ gamma: parseFloat(e.target.value) })
            }
            className="w-full h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
          />
        </div>

        {/* Saturation */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8A8A9E]">Saturation</span>
            <span className="font-mono text-[#F4F4F7] font-semibold">{saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="2"
            value={saturation}
            onChange={(e) =>
              setVideoSettings({ saturation: parseInt(e.target.value, 10) })
            }
            className="w-full h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
          />
        </div>

        {/* Hue Rotation */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8A8A9E]">Hue Angle</span>
            <span className="font-mono text-[#F4F4F7] font-semibold">{hue}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={hue}
            onChange={(e) =>
              setVideoSettings({ hue: parseInt(e.target.value, 10) })
            }
            className="w-full h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
          />
        </div>
      </div>
    </div>
  );
};
