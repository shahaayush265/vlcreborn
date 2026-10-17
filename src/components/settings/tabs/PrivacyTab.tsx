import React from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { SettingRow, SettingSection, SettingSwitch } from "../SettingRow";
import { Trash2 } from "lucide-react";

export const PrivacyTab: React.FC = () => {
  const { privacy, setPrivacy } = useSettingsStore();

  const handleClearHistory = () => {
    localStorage.removeItem("vlc-reborn-continue-watching");
    alert("Local playback history and timestamps cleared successfully.");
  };

  return (
    <div className="space-y-6">
      <SettingSection title="Playback Privacy & Diagnostics" badge="Zero-Telemetry Friendly">
        <SettingRow
          label="Track Playback Timestamps"
          description="Save completion percentages locally to support resume prompts"
        >
          <SettingSwitch
            checked={privacy.savePlaybackHistory}
            onChange={(checked) => setPrivacy({ savePlaybackHistory: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Remember Subtitle Sync Offsets"
          description="Retain manual audio/subtitle millisecond delays for each movie title"
        >
          <SettingSwitch
            checked={privacy.saveSubtitleHistory}
            onChange={(checked) => setPrivacy({ saveSubtitleHistory: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Online Metadata Scraping"
          description="Fetch artwork, artist names, and chapter titles from public databases (TMDB, MusicBrainz)"
          tooltip="When disabled, VLC Reborn makes zero outbound internet requests during local file playback"
        >
          <SettingSwitch
            checked={privacy.onlineMetadataLookup}
            onChange={(checked) => setPrivacy({ onlineMetadataLookup: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Anonymous Crash Diagnostics"
          description="Help improve hardware decoding reliability by submitting anonymous stack traces on crashes"
        >
          <SettingSwitch
            checked={privacy.anonymousTelemetry}
            onChange={(checked) => setPrivacy({ anonymousTelemetry: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Wipe Session Data on Exit"
          description="Automatically clear recently played paths and temporary buffers when closing application"
        >
          <SettingSwitch
            checked={privacy.clearHistoryOnExit}
            onChange={(checked) => setPrivacy({ clearHistoryOnExit: checked })}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Data Management">
        <div className="p-3.5 rounded-xl bg-[#1E1418]/80 border border-rose-500/30 flex items-center justify-between">
          <div>
            <h5 className="text-xs font-semibold text-rose-300">
              Clear All Cached Playback Timestamps
            </h5>
            <p className="text-[11px] text-[#8A8A9E] mt-0.5">
              Purges all saved video progress markers and continue watching entries.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 border border-rose-500/40 hover:border-transparent text-rose-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Data</span>
          </button>
        </div>
      </SettingSection>
    </div>
  );
};
