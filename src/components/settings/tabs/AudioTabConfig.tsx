import React from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { SettingRow, SettingSection, SettingSwitch } from "../SettingRow";

export const AudioTabConfig: React.FC = () => {
  const { audio, setAudio } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingSection title="Audio Device & DSP" badge="WebAudio Engine">
        <SettingRow
          label="Maximum Conical Volume Boost"
          description="Allow boosting volume beyond 100% (VLC signature feature)"
          tooltip="VLC's famous conical overdrive lets you boost quiet movies up to 125% or 150%"
        >
          <div className="flex items-center gap-1.5">
            {[100, 125, 150].map((ceiling) => (
              <button
                key={ceiling}
                type="button"
                onClick={() => setAudio({ maxVolumeBoost: ceiling })}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-all ${
                  audio.maxVolumeBoost === ceiling
                    ? "bg-[#FF5C00] text-white shadow"
                    : "bg-[#1E1E2C] text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {ceiling}%
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="Spatial Audio & Surround Virtualizer"
          description="Simulate 5.1/7.1 theater spatial acoustics when using stereo headphones"
        >
          <SettingSwitch
            checked={audio.spatialAudioVirtualizer}
            onChange={(checked) => setAudio({ spatialAudioVirtualizer: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Night Mode (Dynamic Range Compression)"
          description="Compress loud sound effects so dialogue remains clear at low volumes"
        >
          <SettingSwitch
            checked={audio.dynamicRangeCompression}
            onChange={(checked) => setAudio({ dynamicRangeCompression: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Exclusive Hardware Audio Mode"
          description="Bypass OS mixer for bit-perfect audio passthrough (WASAPI/ALSA direct)"
        >
          <SettingSwitch
            checked={audio.exclusiveAudioMode}
            onChange={(checked) => setAudio({ exclusiveAudioMode: checked })}
          />
        </SettingRow>
      </SettingSection>
    </div>
  );
};
