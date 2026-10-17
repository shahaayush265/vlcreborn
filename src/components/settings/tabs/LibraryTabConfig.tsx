import React from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { SettingRow, SettingSection, SettingSwitch } from "../SettingRow";

export const LibraryTabConfig: React.FC = () => {
  const { library, setLibrary } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingSection title="Media Library & Indexing" badge="Catalog Engine">
        <SettingRow
          label="Auto-Scan on Application Startup"
          description="Scan default system Videos and Music directories when launching VLC Reborn"
        >
          <SettingSwitch
            checked={library.scanOnStartup}
            onChange={(checked) => setLibrary({ scanOnStartup: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Auto-Extract Real Video Thumbnails"
          description="Use browser-native offscreen canvas decoder to extract genuine frame snapshots"
          tooltip="Extracts high-resolution poster frames from actual video content instead of blank placeholders"
        >
          <SettingSwitch
            checked={library.autoGenerateThumbnails}
            onChange={(checked) => setLibrary({ autoGenerateThumbnails: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Group Items by Category"
          description="Organize library items into Movies, Sci-Fi, Featured, and Local Imports"
        >
          <SettingSwitch
            checked={library.groupByCategory}
            onChange={(checked) => setLibrary({ groupByCategory: checked })}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Ignored Folders & Formats">
        <div className="p-3.5 rounded-xl bg-[#14141E]/80 border border-[#262635] space-y-2">
          <span className="text-xs font-semibold text-[#F4F4F7]">
            Indexed Video & Audio Codecs
          </span>
          <p className="text-[11px] text-[#8A8A9E]">
            VLC Reborn natively indexes and parses metadata for the following containers:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {library.supportedFormats.map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded-md bg-[#1E1E2C] border border-[#3A3A4E] text-[10px] font-mono text-[#FF5C00] font-semibold uppercase"
              >
                .{fmt}
              </span>
            ))}
          </div>
        </div>
      </SettingSection>
    </div>
  );
};
