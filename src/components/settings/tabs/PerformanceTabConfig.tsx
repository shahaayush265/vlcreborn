import React from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { SettingRow, SettingSection, SettingSwitch } from "../SettingRow";

export const PerformanceTabConfig: React.FC = () => {
  const { performance, setPerformance } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingSection title="Hardware Acceleration & Memory" badge="Engine Performance">
        <SettingRow
          label="Hardware Accelerated Canvas Composition"
          description="Use GPU WebGL/WebGPU compositor for the video viewport and thick seekbar"
          tooltip="Provides 60fps buttery-smooth playback and instant seek scrubbing"
        >
          <SettingSwitch
            checked={performance.gpuCanvasAccelerated}
            onChange={(checked) => setPerformance({ gpuCanvasAccelerated: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Background Storyboard Frame Pre-Warming"
          description="Extract a lightweight keyframe storyboard in the background for zero-latency hover thumbnails"
        >
          <SettingSwitch
            checked={performance.storyboardBackgroundPreload}
            onChange={(checked) => setPerformance({ storyboardBackgroundPreload: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Network Stream Lookahead Buffer"
          description="Pre-buffer media stream ahead of playhead to withstand network jitter"
        >
          <div className="flex items-center gap-1.5">
            {[15, 30, 60, 90].map((secs) => (
              <button
                key={secs}
                type="button"
                onClick={() => setPerformance({ bufferLengthSecs: secs })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-all ${
                  performance.bufferLengthSecs === secs
                    ? "bg-[#FF5C00] text-white shadow"
                    : "bg-[#1E1E2C] text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {secs}s
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="In-Memory Thumbnail Cache Limit"
          description="Maximum memory allocated to decoded scrub frames and storyboards"
        >
          <div className="flex items-center gap-1.5">
            {[128, 256, 512].map((mb) => (
              <button
                key={mb}
                type="button"
                onClick={() => setPerformance({ memoryCacheLimitMb: mb })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-all ${
                  performance.memoryCacheLimitMb === mb
                    ? "bg-[#FF5C00] text-white shadow"
                    : "bg-[#1E1E2C] text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {mb}MB
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="Low Power Battery Mode"
          description="Reduce HUD backdrop blur quality and throttle background threads when on battery"
        >
          <SettingSwitch
            checked={performance.lowPowerMode}
            onChange={(checked) => setPerformance({ lowPowerMode: checked })}
          />
        </SettingRow>
      </SettingSection>
    </div>
  );
};
