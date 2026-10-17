import React from "react";
import {
  AudioLines,
  RotateCcw,
  Sliders,
  Speaker,
  Activity,
  Layers,
  ChevronDown,
} from "lucide-react";
import {
  usePlayerStore,
  EQUALIZER_FREQUENCIES,
} from "../../stores/usePlayerStore";
import { EqualizerPresetId, AudioChannelRouting } from "../../types/player";

const PRESET_LABELS: { id: EqualizerPresetId; label: string }[] = [
  { id: "flat", label: "Flat (Original)" },
  { id: "bass_boost", label: "Bass Boost" },
  { id: "vocal_clarity", label: "Vocal Clarity" },
  { id: "rock", label: "Rock / Metal" },
  { id: "electronic", label: "Electronic" },
  { id: "movie", label: "Cinema / Movie" },
];

const ROUTING_OPTIONS: { id: AudioChannelRouting; label: string; desc: string }[] = [
  { id: "stereo", label: "Stereo", desc: "Default 2-ch" },
  { id: "5.1", label: "5.1 Surround", desc: "Spatial Downmix" },
  { id: "mono", label: "Mono", desc: "Combined 1-ch" },
  { id: "left", label: "Left Only", desc: "L Isolated" },
  { id: "right", label: "Right Only", desc: "R Isolated" },
];

export const AudioTab: React.FC = () => {
  const {
    audioSettings,
    setAudioSettings,
    setEqualizerBand,
    setEqualizerPreset,
    resetAudioSettings,
    audioTracks,
    showOsd,
  } = usePlayerStore();

  const {
    selectedTrackId,
    channelRouting,
    delay,
    equalizerEnabled,
    equalizerPreset,
    equalizerBands,
  } = audioSettings;

  const handleDelayChange = (val: number) => {
    const clamped = Math.max(-5000, Math.min(5000, val));
    setAudioSettings({ delay: clamped });
    showOsd(`Audio Delay: ${clamped > 0 ? "+" : ""}${clamped} ms`);
  };

  // Build SVG path curve for the 10 bands (-12 to +12 dB)
  const svgWidth = 320;
  const svgHeight = 70;
  const points = equalizerBands.map((db, i) => {
    const x = (i / (equalizerBands.length - 1)) * (svgWidth - 20) + 10;
    // Map -12dB (bottom) to +12dB (top) with 0dB in center
    const y = svgHeight / 2 - (db / 12) * (svgHeight / 2 - 8);
    return { x, y };
  });

  // Catmull-Rom or bezier smoothing for aesthetic curve
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  return (
    <div className="flex flex-col gap-6 text-sm">
      {/* Header Summary & Reset */}
      <div className="flex items-center justify-between pb-1 border-b border-[#262635]">
        <div>
          <h3 className="text-base font-bold text-[#F4F4F7] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5C00] animate-pulse" />
            Audio Deck
          </h3>
          <p className="text-xs text-[#8A8A9E] mt-0.5">
            Track routing, A/V synchronization & 10-band equalizer
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetAudioSettings();
            showOsd("Audio settings reset to default");
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] transition-colors cursor-pointer"
          title="Reset to defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Audio Track Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AudioLines className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>Active Audio Stream</span>
          </span>
          <span className="text-[11px] font-mono text-[#FF5C00]">
            {audioTracks.length} streams
          </span>
        </label>
        <div className="relative">
          <select
            value={selectedTrackId || ""}
            onChange={(e) => {
              setAudioSettings({ selectedTrackId: e.target.value });
              const track = audioTracks.find((t) => t.id === e.target.value);
              if (track) showOsd(`Audio: ${track.label}`);
            }}
            className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-[#1F1F2B] border border-[#262635] text-[#F4F4F7] text-xs font-medium hover:border-[#3A3A4E] focus:border-[#FF5C00] focus:outline-none transition-colors cursor-pointer pr-9"
          >
            {audioTracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9E] pointer-events-none" />
        </div>
      </div>

      {/* Channel Routing */}
      <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[#16161E]/60 border border-[#262635]">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Speaker className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>Channel Output Mode</span>
          </span>
          <span className="text-xs font-mono text-[#F4F4F7] capitalize">
            {channelRouting}
          </span>
        </label>

        <div className="grid grid-cols-3 gap-1.5">
          {ROUTING_OPTIONS.slice(0, 3).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setAudioSettings({ channelRouting: r.id });
                showOsd(`Channel Mode: ${r.label}`);
              }}
              className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                channelRouting === r.id
                  ? "bg-[#FF5C00]/20 border-[#FF5C00]/60 text-white shadow-[0_0_12px_rgba(255,92,0,0.25)]"
                  : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:border-[#3A3A4E]"
              }`}
            >
              <span className="text-xs font-bold">{r.label}</span>
              <span className="text-[10px] opacity-75">{r.desc}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {ROUTING_OPTIONS.slice(3).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setAudioSettings({ channelRouting: r.id });
                showOsd(`Channel Mode: ${r.label}`);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                channelRouting === r.id
                  ? "bg-[#FF5C00]/20 border-[#FF5C00]/60 text-white shadow-[0_0_12px_rgba(255,92,0,0.25)]"
                  : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:border-[#3A3A4E]"
              }`}
            >
              <span className="text-xs font-bold">{r.label}</span>
              <span className="text-[10px] opacity-75">{r.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Audio Delay Timing Slider */}
      <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[#16161E]/60 border border-[#262635]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>Audio Delay Offset</span>
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

      {/* 10-Band Graphic Equalizer with Visual Response Curve */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#16161E]/60 border border-[#262635]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>10-Band Graphic Equalizer</span>
          </label>

          <button
            type="button"
            onClick={() => {
              const next = !equalizerEnabled;
              setAudioSettings({ equalizerEnabled: next });
              showOsd(next ? "Equalizer Enabled" : "Equalizer Bypassed");
            }}
            className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
              equalizerEnabled ? "bg-[#FF5C00]" : "bg-[#262635]"
            }`}
          >
            <div
              className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                equalizerEnabled ? "translate-x-4.5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Visual Preview Frequency Curve (Juxtopposed requirement) */}
        <div className="relative w-full h-[75px] rounded-xl bg-gradient-to-b from-[#111117] to-[#0A0A0E] border border-[#262635] overflow-hidden flex items-center justify-center shadow-inner">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="eqFillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5C00" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FF5C00" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 0 dB Center Baseline */}
            <line
              x1="0"
              y1={svgHeight / 2}
              x2={svgWidth}
              y2={svgHeight / 2}
              stroke="#262635"
              strokeDasharray="3 3"
              strokeWidth="1"
            />

            {/* Dynamic Area Fill */}
            <path d={areaD} fill="url(#eqFillGrad)" />

            {/* Glowing Spline Response Curve */}
            <path
              d={pathD}
              fill="none"
              stroke="#FF5C00"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-150 drop-shadow-[0_0_8px_rgba(255,92,0,0.6)]"
            />

            {/* Frequency Points */}
            {points.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="3"
                className="fill-white stroke-[#FF5C00] stroke-2"
              />
            ))}
          </svg>

          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-[#8A8A9E]/60 pointer-events-none">
            {equalizerEnabled ? "Active Response (±12 dB)" : "EQ Bypassed"}
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-[#8A8A9E] flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>Sound Presets</span>
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESET_LABELS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setEqualizerPreset(p.id);
                  showOsd(`EQ Preset: ${p.label}`);
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  equalizerPreset === p.id
                    ? "bg-[#FF5C00]/20 border-[#FF5C00]/50 text-[#FF5C00] font-bold shadow-[0_0_10px_rgba(255,92,0,0.2)]"
                    : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:border-[#3A3A4E]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 10 Vertical Sliders Grid */}
        <div
          className={`flex items-end justify-between pt-2 px-1 transition-opacity ${
            equalizerEnabled ? "opacity-100" : "opacity-40 pointer-events-none"
          }`}
        >
          {equalizerBands.map((db, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 group">
              <span className="text-[9px] font-mono font-semibold text-[#8A8A9E] group-hover:text-[#FF5C00] transition-colors">
                {db > 0 ? `+${db}` : db}
              </span>

              {/* Vertical slider wrapper */}
              <div className="relative w-4 h-24 flex items-center justify-center">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={db}
                  onChange={(e) =>
                    setEqualizerBand(idx, parseInt(e.target.value, 10))
                  }
                  className="w-24 h-1.5 -rotate-90 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
                />
              </div>

              <span className="text-[8px] font-mono text-[#8A8A9E] whitespace-nowrap mt-1">
                {EQUALIZER_FREQUENCIES[idx]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
