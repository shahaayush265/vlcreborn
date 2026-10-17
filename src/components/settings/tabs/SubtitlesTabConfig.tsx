import React from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { SettingRow, SettingSection, SettingSwitch } from "../SettingRow";

export const SubtitlesTabConfig: React.FC = () => {
  const { subtitles, setSubtitles } = useSettingsStore();

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish (Español)" },
    { code: "fr", name: "French (Français)" },
    { code: "de", name: "German (Deutsch)" },
    { code: "ja", name: "Japanese (日本語)" },
  ];

  return (
    <div className="space-y-6">
      <SettingSection title="Language & Auto-Discovery" badge="Subtitle Engine">
        <SettingRow
          label="Preferred Subtitle Language"
          description="Default subtitle language to automatically engage when opening media"
        >
          <select
            value={subtitles.preferredLanguage}
            onChange={(e) => setSubtitles({ preferredLanguage: e.target.value })}
            className="px-3 py-1.5 rounded-lg bg-[#1B1B26] border border-[#262635] text-xs text-[#F4F4F7] focus:outline-none focus:border-[#FF5C00] cursor-pointer"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </SettingRow>

        <SettingRow
          label="Auto-Discover Local Subtitles"
          description="Automatically scan for matching .srt, .vtt, and .ass files in the same directory"
        >
          <SettingSwitch
            checked={subtitles.autoDiscoverNearby}
            onChange={(checked) => setSubtitles({ autoDiscoverNearby: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Speech Sync Matcher Sensitivity"
          description="Speech rhythm alignment threshold used in the Visual Subtitle Matcher"
        >
          <div className="flex items-center gap-1 p-1 bg-[#1A1A24] rounded-lg border border-[#262635]">
            {(["fine", "normal", "aggressive"] as const).map((sens) => (
              <button
                key={sens}
                type="button"
                onClick={() => setSubtitles({ speechSyncSensitivity: sens })}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer transition-all ${
                  subtitles.speechSyncSensitivity === sens
                    ? "bg-[#FF5C00] text-white shadow"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {sens}
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Typography Defaults">
        <SettingRow
          label="Default Subtitle Font"
          description="Font family used for standard text subtitles (SRT/VTT)"
        >
          <select
            value={subtitles.defaultFontFamily}
            onChange={(e) => setSubtitles({ defaultFontFamily: e.target.value })}
            className="px-3 py-1.5 rounded-lg bg-[#1B1B26] border border-[#262635] text-xs text-[#F4F4F7] focus:outline-none focus:border-[#FF5C00] cursor-pointer"
          >
            <option value="Inter, sans-serif">Inter (Modern Sans)</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Courier New', monospace">Courier Monospace</option>
          </select>
        </SettingRow>

        <SettingRow
          label="Default Outline Shadow Width"
          description="High-contrast drop outline for legibility over bright scenes"
        >
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 4, 6].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setSubtitles({ defaultOutlineWidth: w })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-all ${
                  subtitles.defaultOutlineWidth === w
                    ? "bg-[#FF5C00] text-white shadow"
                    : "bg-[#1E1E2C] text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {w}px
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingSection>
    </div>
  );
};
