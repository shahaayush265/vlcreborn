import React from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { SettingRow, SettingSection, SettingSwitch } from "../SettingRow";

export const PlaybackTabConfig: React.FC = () => {
  const { playback, setPlayback } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingSection title="Playback Defaults" badge="Engine Config">
        <SettingRow
          label="Default Playback Speed"
          description="Default rate when launching a newly opened media file"
        >
          <div className="flex items-center gap-1.5">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setPlayback({ defaultPlaybackRate: rate })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-all ${
                  playback.defaultPlaybackRate === rate
                    ? "bg-[#FF5C00] text-white shadow"
                    : "bg-[#1E1E2C] text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="Auto-Advance in Playlist Queue"
          description="Automatically play the next item in the queue when current video finishes"
        >
          <SettingSwitch
            checked={playback.autoPlayNextInQueue}
            onChange={(checked) => setPlayback({ autoPlayNextInQueue: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Remember Track Selections"
          description="Remember preferred audio and subtitle language for upcoming episodes in the same series"
        >
          <SettingSwitch
            checked={playback.rememberTrackSelections}
            onChange={(checked) => setPlayback({ rememberTrackSelections: checked })}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Hardware Acceleration & Decoders">
        <SettingRow
          label="Hardware-Accelerated Decoding API"
          description="GPU video decoder pipeline"
          tooltip="Auto selects VA-API on Linux, D3D11VA on Windows, or VideoToolbox on macOS"
        >
          <div className="flex items-center gap-1 p-1 bg-[#1A1A24] rounded-lg border border-[#262635]">
            {(["auto", "vaapi", "nvdec", "d3d11va", "software"] as const).map((api) => (
              <button
                key={api}
                type="button"
                onClick={() => setPlayback({ hardwareAcceleration: api })}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold uppercase cursor-pointer transition-all ${
                  playback.hardwareAcceleration === api
                    ? "bg-[#FF5C00] text-white shadow"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {api}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="Audio Dynamic Loudness Normalization"
          description="Even out dialogue whispers and loud explosions without distortion"
        >
          <SettingSwitch
            checked={playback.audioNormalization}
            onChange={(checked) => setPlayback({ audioNormalization: checked })}
          />
        </SettingRow>
      </SettingSection>
    </div>
  );
};
