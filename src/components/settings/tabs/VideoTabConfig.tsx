import React from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { SettingRow, SettingSection } from "../SettingRow";

export const VideoTabConfig: React.FC = () => {
  const { video, setVideo } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingSection title="Video Geometry & Output" badge="Render Pipeline">
        <SettingRow
          label="Default Aspect Ratio"
          description="Default framing mode applied to new video streams"
        >
          <div className="flex items-center gap-1 p-1 bg-[#1A1A24] rounded-lg border border-[#262635]">
            {(["original", "16:9", "4:3", "21:9", "fill"] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setVideo({ defaultAspectRatio: ratio })}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold cursor-pointer transition-all ${
                  video.defaultAspectRatio === ratio
                    ? "bg-[#FF5C00] text-white shadow"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="Hardware Deinterlacing Mode"
          description="Fix interlaced combing artifacts from broadcast TV streams"
        >
          <div className="flex items-center gap-1 p-1 bg-[#1A1A24] rounded-lg border border-[#262635]">
            {(["auto", "on", "off"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setVideo({ deinterlacing: mode })}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase cursor-pointer transition-all ${
                  video.deinterlacing === mode
                    ? "bg-[#FF5C00] text-white shadow"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="Color Grading Profile"
          description="Target color space profile for SDR and HDR tone mapping"
        >
          <div className="flex items-center gap-1 p-1 bg-[#1A1A24] rounded-lg border border-[#262635]">
            {(["bt709", "srgb", "bt2020"] as const).map((cs) => (
              <button
                key={cs}
                type="button"
                onClick={() => setVideo({ colorSpace: cs })}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold uppercase cursor-pointer transition-all ${
                  video.colorSpace === cs
                    ? "bg-[#FF5C00] text-white shadow"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {cs}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="Edge Post-Processing Shaders"
          description="Dynamic sharpening and bilinear scaling quality"
        >
          <div className="flex items-center gap-1 p-1 bg-[#1A1A24] rounded-lg border border-[#262635]">
            {(["crisp", "balanced", "cinematic"] as const).map((sh) => (
              <button
                key={sh}
                type="button"
                onClick={() => setVideo({ postProcessing: sh })}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer transition-all ${
                  video.postProcessing === sh
                    ? "bg-[#FF5C00] text-white shadow"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {sh}
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingSection>
    </div>
  );
};
