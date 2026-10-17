import React from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { SettingRow, SettingSection, SettingSwitch } from "../SettingRow";

export const GeneralTab: React.FC = () => {
  const { general, setGeneral } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingSection title="Session & History" badge="State Persistence">
        <SettingRow
          label="Save Recent Media History"
          description="Keep a record of recently opened files in the Library drawer"
          tooltip="History is stored locally in your app profile and never leaves your computer"
        >
          <SettingSwitch
            checked={general.saveRecentMedia}
            onChange={(checked) => setGeneral({ saveRecentMedia: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Resume Playback Prompt"
          description="Show a floating card to continue watching where you left off"
          tooltip="When reopening a video, offers a 1-click button to resume at the exact second"
        >
          <SettingSwitch
            checked={general.resumePlaybackPrompt}
            onChange={(checked) => setGeneral({ resumePlaybackPrompt: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Auto-Pause on Window Minimize"
          description="Automatically pause video playback when VLC Reborn is minimized"
        >
          <SettingSwitch
            checked={general.pauseOnMinimize}
            onChange={(checked) => setGeneral({ pauseOnMinimize: checked })}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title="System Integration">
        <SettingRow
          label="Allow Only One Running Instance"
          description="Queue newly clicked media files in the existing player rather than opening duplicate windows"
        >
          <SettingSwitch
            checked={general.singleInstance}
            onChange={(checked) => setGeneral({ singleInstance: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Minimize to System Tray"
          description="Keep audio playing in the background with a tray icon when window is closed"
        >
          <SettingSwitch
            checked={general.systemTray}
            onChange={(checked) => setGeneral({ systemTray: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Automatic Update Checks"
          description="Periodically check for new releases and codec updates"
        >
          <SettingSwitch
            checked={general.autoCheckUpdates}
            onChange={(checked) => setGeneral({ autoCheckUpdates: checked })}
          />
        </SettingRow>
      </SettingSection>
    </div>
  );
};
