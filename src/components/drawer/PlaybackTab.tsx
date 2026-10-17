import React from "react";
import {
  Gauge,
  RotateCcw,
  Clock,
  Waves,
  Bell,
  Repeat,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { SleepTimerOption } from "../../types/player";

const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 3.0, 4.0];

const SLEEP_TIMER_OPTIONS: { id: SleepTimerOption; label: string }[] = [
  { id: null, label: "Off" },
  { id: 15, label: "15 min" },
  { id: 30, label: "30 min" },
  { id: 45, label: "45 min" },
  { id: 60, label: "1 hour" },
  { id: 90, label: "90 min" },
  { id: -1, label: "End of Video" },
];

export const PlaybackTab: React.FC = () => {
  const {
    playbackRate,
    setPlaybackRate,
    playbackDeckSettings,
    setPlaybackDeckSettings,
    setSleepTimer,
    isLooping,
    toggleLoop,
    setIsLooping,
    showOsd,
  } = usePlayerStore();

  const { showWaveform, osdNotifications, sleepTimer, sleepTimerRemainingSecs } =
    playbackDeckSettings;

  const handleSpeedChange = (rate: number) => {
    const clamped = Math.max(0.25, Math.min(4.0, parseFloat(rate.toFixed(2))));
    setPlaybackRate(clamped);
    showOsd(`Speed: ${clamped}x`);
  };

  const formatCountdown = (secs: number | null) => {
    if (secs === null || secs <= 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-6 text-sm">
      {/* Header Summary & Reset */}
      <div className="flex items-center justify-between pb-1 border-b border-[#262635]">
        <div>
          <h3 className="text-base font-bold text-[#F4F4F7] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5C00] animate-pulse" />
            Playback Deck
          </h3>
          <p className="text-xs text-[#8A8A9E] mt-0.5">
            Speed scaling, waveform preview, OSD & sleep timers
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setPlaybackRate(1.0);
            setIsLooping(false);
            setPlaybackDeckSettings({
              showWaveform: true,
              osdNotifications: true,
              sleepTimer: null,
              sleepTimerRemainingSecs: null,
            });
            showOsd("Playback extras reset to default");
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1F1F2B] transition-colors cursor-pointer"
          title="Reset to defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Granular Playback Speed Multiplier */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#16161E]/60 border border-[#262635]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>Playback Speed Rate</span>
          </label>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#FF5C00]/20 text-[#FF5C00] border border-[#FF5C00]/30">
            {playbackRate.toFixed(2)}x
          </span>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#8A8A9E]">0.25x</span>
          <input
            type="range"
            min="0.25"
            max="4.0"
            step="0.05"
            value={playbackRate}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none bg-[#262635] cursor-pointer accent-[#FF5C00]"
          />
          <span className="text-[10px] font-mono text-[#8A8A9E]">4.00x</span>
        </div>

        {/* Stepper buttons & 1.0x normal reset */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleSpeedChange(playbackRate - 0.05)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-[#1F1F2B] hover:bg-[#282837] text-xs font-mono text-[#C2C2D1] hover:text-[#F4F4F7] transition-colors cursor-pointer"
          >
            <Minus className="w-3 h-3" />
            <span>0.05x</span>
          </button>
          <button
            type="button"
            onClick={() => handleSpeedChange(1.0)}
            className="px-4 py-1.5 rounded-xl bg-[#2A2A3B] hover:bg-[#323246] text-xs font-semibold text-[#FF5C00] transition-colors cursor-pointer"
          >
            Normal (1.0x)
          </button>
          <button
            type="button"
            onClick={() => handleSpeedChange(playbackRate + 0.05)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-[#1F1F2B] hover:bg-[#282837] text-xs font-mono text-[#C2C2D1] hover:text-[#F4F4F7] transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>0.05x</span>
          </button>
        </div>

        {/* Quick Speed Preset Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SPEED_PRESETS.map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleSpeedChange(rate)}
              className={`py-1 px-2.5 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer ${
                playbackRate === rate
                  ? "bg-[#FF5C00]/20 border-[#FF5C00]/50 text-[#FF5C00] font-bold"
                  : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:border-[#3A3A4E]"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Timer Section */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#16161E]/60 border border-[#262635]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>Sleep Timer</span>
          </label>
          {sleepTimerRemainingSecs !== null && (
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
              {formatCountdown(sleepTimerRemainingSecs)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {SLEEP_TIMER_OPTIONS.slice(0, 4).map((opt) => (
            <button
              key={String(opt.id)}
              type="button"
              onClick={() => {
                setSleepTimer(opt.id);
                showOsd(`Sleep Timer: ${opt.label}`);
              }}
              className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                sleepTimer === opt.id
                  ? "bg-[#FF5C00]/20 border-[#FF5C00]/50 text-[#FF5C00] font-bold shadow-[0_0_10px_rgba(255,92,0,0.2)]"
                  : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:border-[#3A3A4E]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {SLEEP_TIMER_OPTIONS.slice(4).map((opt) => (
            <button
              key={String(opt.id)}
              type="button"
              onClick={() => {
                setSleepTimer(opt.id);
                showOsd(`Sleep Timer: ${opt.label}`);
              }}
              className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                sleepTimer === opt.id
                  ? "bg-[#FF5C00]/20 border-[#FF5C00]/50 text-[#FF5C00] font-bold shadow-[0_0_10px_rgba(255,92,0,0.2)]"
                  : "bg-[#1F1F2B] border-[#262635] text-[#8A8A9E] hover:text-[#F4F4F7] hover:border-[#3A3A4E]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {sleepTimerRemainingSecs !== null && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#111117] border border-[#262635] mt-1">
            <span className="text-xs text-[#8A8A9E]">
              Timer active: Pauses playback automatically
            </span>
            <button
              type="button"
              onClick={() => {
                setSleepTimer(null);
                showOsd("Sleep Timer Cancelled");
              }}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Feature Toggles: Waveform & OSD */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#16161E]/60 border border-[#262635]">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9E] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5C00]" />
          <span>Interface Extras</span>
        </label>

        {/* Waveform Seekbar Display Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1F1F2B] border border-[#262635] text-[#C2C2D1]">
              <Waves className="w-4 h-4 text-[#FF5C00]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#F4F4F7]">
                Waveform Seekbar Display
              </div>
              <div className="text-[11px] text-[#8A8A9E]">
                Render audio peaks & intensity across the seekbar
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !showWaveform;
              setPlaybackDeckSettings({ showWaveform: next });
              showOsd(next ? "Waveform Display: ON" : "Waveform Display: OFF");
            }}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              showWaveform ? "bg-[#FF5C00]" : "bg-[#262635]"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                showWaveform ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="w-full h-px bg-[#262635]" />

        {/* OSD Notifications Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1F1F2B] border border-[#262635] text-[#C2C2D1]">
              <Bell className="w-4 h-4 text-[#FF5C00]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#F4F4F7]">
                OSD Notification Badges
              </div>
              <div className="text-[11px] text-[#8A8A9E]">
                Display floating heads-up badges on parameter changes
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !osdNotifications;
              setPlaybackDeckSettings({ osdNotifications: next });
              showOsd(next ? "OSD Badges: Enabled" : "OSD Badges: Disabled");
            }}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              osdNotifications ? "bg-[#FF5C00]" : "bg-[#262635]"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                osdNotifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="w-full h-px bg-[#262635]" />

        {/* Loop Playback Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1F1F2B] border border-[#262635] text-[#C2C2D1]">
              <Repeat className={`w-4 h-4 ${isLooping ? "text-[#FF5C00]" : "text-[#8A8A9E]"}`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#F4F4F7]">
                Continuous Loop Mode
              </div>
              <div className="text-[11px] text-[#8A8A9E]">
                Repeat media playback automatically upon completion
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !isLooping;
              toggleLoop();
              showOsd(next ? "Continuous Loop: ON" : "Continuous Loop: OFF");
            }}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              isLooping ? "bg-[#FF5C00]" : "bg-[#262635]"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                isLooping ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
