import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { SettingRow, SettingSection, SettingSwitch } from "../SettingRow";
import { RotateCcw, Search, AlertCircle, Edit2, Check, X } from "lucide-react";

export const ControlsTab: React.FC = () => {
  const {
    controls,
    setControls,
    hotkeys,
    remapHotkey,
    resetHotkeys,
  } = useSettingsStore();

  const [hotkeyFilter, setHotkeyFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [recordingHotkeyId, setRecordingHotkeyId] = useState<string | null>(null);
  const [recordedCombo, setRecordedCombo] = useState<{ combo: string; display: string } | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Key recorder event listener
  useEffect(() => {
    if (!recordingHotkeyId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignore single modifier key presses alone
      if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
        return;
      }

      const parts: string[] = [];
      const displayParts: string[] = [];

      if (e.ctrlKey) {
        parts.push("Control");
        displayParts.push("Ctrl");
      }
      if (e.altKey) {
        parts.push("Alt");
        displayParts.push("Alt");
      }
      if (e.shiftKey) {
        parts.push("Shift");
        displayParts.push("Shift");
      }
      if (e.metaKey) {
        parts.push("Meta");
        displayParts.push("Cmd");
      }

      parts.push(e.code);

      // Clean display representation
      let keyDisplay = e.key.toUpperCase();
      if (e.code === "Space") keyDisplay = "Space";
      else if (e.code === "ArrowLeft") keyDisplay = "←";
      else if (e.code === "ArrowRight") keyDisplay = "→";
      else if (e.code === "ArrowUp") keyDisplay = "↑";
      else if (e.code === "ArrowDown") keyDisplay = "↓";
      else if (e.code === "BracketLeft") keyDisplay = "[";
      else if (e.code === "BracketRight") keyDisplay = "]";
      else if (e.code === "Comma") keyDisplay = ",";
      else if (e.code === "Period") keyDisplay = ".";
      else if (e.code.startsWith("Key")) keyDisplay = e.code.replace("Key", "");

      displayParts.push(keyDisplay);

      const combo = parts.join("+");
      const display = displayParts.join(" + ");

      // Check conflict
      const conflict = hotkeys.find(
        (h) => h.combo === combo && h.id !== recordingHotkeyId
      );
      if (conflict) {
        setConflictWarning(`Already mapped to: “${conflict.name}”`);
      } else {
        setConflictWarning(null);
      }

      setRecordedCombo({ combo, display });
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [recordingHotkeyId, hotkeys]);

  const handleSaveRecording = () => {
    if (recordingHotkeyId && recordedCombo) {
      remapHotkey(recordingHotkeyId, recordedCombo.combo, recordedCombo.display);
    }
    setRecordingHotkeyId(null);
    setRecordedCombo(null);
    setConflictWarning(null);
  };

  const handleCancelRecording = () => {
    setRecordingHotkeyId(null);
    setRecordedCombo(null);
    setConflictWarning(null);
  };

  const categories = ["All", "Playback", "Navigation", "Volume & Audio", "Interface"];

  const filteredHotkeys = hotkeys.filter((h) => {
    const matchesCat = hotkeyFilter === "All" || h.category === hotkeyFilter;
    const matchesSearch =
      searchQuery === "" ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.displayCombo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Playback & Seeking Intervals */}
      <SettingSection title="Navigation & Seek Intervals" badge="Fine-Tuning">
        <SettingRow
          label="Short Seek Step (J / L)"
          description="Interval for quick precision seeking"
        >
          <div className="flex items-center gap-1.5">
            {[3, 5, 10].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setControls({ seekStepShort: step })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-all ${
                  controls.seekStepShort === step
                    ? "bg-[#FF5C00] text-white shadow"
                    : "bg-[#1E1E2C] text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {step}s
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="Medium Seek Step (Arrow Keys)"
          description="Interval for standard timeline skipping"
        >
          <div className="flex items-center gap-1.5">
            {[5, 10, 15, 30].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setControls({ seekStepMedium: step })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-all ${
                  controls.seekStepMedium === step
                    ? "bg-[#FF5C00] text-white shadow"
                    : "bg-[#1E1E2C] text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {step}s
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="Mouse Scroll Wheel Action"
          description="Primary behavior when scrolling over the video canvas"
        >
          <div className="flex items-center gap-1 p-1 bg-[#1A1A24] rounded-lg border border-[#262635]">
            {(["volume", "seek", "zoom"] as const).map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setControls({ mouseWheelAction: act })}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer transition-all ${
                  controls.mouseWheelAction === act
                    ? "bg-[#FF5C00] text-white shadow"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="OSD Feedback on Hotkey Trigger"
          description="Display an animated on-screen HUD badge when a shortcut is pressed"
          tooltip="Shows badge like [Space] Play / Pause or [→] Forward +10s"
        >
          <SettingSwitch
            checked={controls.showOsdHotkeyBadge}
            onChange={(checked) => setControls({ showOsdHotkeyBadge: checked })}
          />
        </SettingRow>
      </SettingSection>

      {/* Visual Hotkey Management Hub */}
      <SettingSection title="Hotkey Management Hub" badge="Visual Remapper">
        <div className="p-4 rounded-xl bg-[#14141E]/80 border border-[#262635] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setHotkeyFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all shrink-0 ${
                    hotkeyFilter === cat
                      ? "bg-[#FF5C00]/20 text-[#FF5C00] border border-[#FF5C00]/40 font-semibold"
                      : "text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#1E1E2C]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search and Reset */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A9E]" />
                <input
                  type="text"
                  placeholder="Filter shortcuts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-[#1A1A24] border border-[#262635] rounded-lg text-xs text-[#F4F4F7] placeholder-[#8A8A9E]/60 focus:outline-none focus:border-[#FF5C00] w-36 sm:w-44"
                />
              </div>

              <button
                type="button"
                onClick={resetHotkeys}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E1E2C] hover:bg-[#2A2A3C] text-xs font-medium text-[#8A8A9E] hover:text-[#F4F4F7] border border-[#3A3A4E] cursor-pointer transition-all shrink-0"
                title="Reset all shortcuts to factory defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Hotkey List Table */}
          <div className="border border-[#262635] rounded-xl overflow-hidden divide-y divide-[#262635]/60 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-[#262635]">
            {filteredHotkeys.map((hk) => {
              const isRecordingThis = recordingHotkeyId === hk.id;

              return (
                <div
                  key={hk.id}
                  className={`flex items-center justify-between p-2.5 transition-colors ${
                    isRecordingThis ? "bg-[#FF5C00]/15 border-l-2 border-[#FF5C00]" : "hover:bg-[#181824]"
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#F4F4F7]">{hk.name}</span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#262635] text-[#8A8A9E]">
                        {hk.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8A8A9E] mt-0.5 truncate">{hk.description}</p>
                  </div>

                  {isRecordingThis ? (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        <div className="px-3 py-1 rounded-lg bg-[#2A1E14] border border-[#FF5C00] text-xs font-mono font-bold text-[#FF5C00] animate-pulse">
                          {recordedCombo ? recordedCombo.display : "Press keys..."}
                        </div>
                        {conflictWarning && (
                          <span className="text-[9px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                            <AlertCircle className="w-2.5 h-2.5" />
                            {conflictWarning}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveRecording}
                        className="p-1.5 rounded-lg bg-[#FF5C00] hover:bg-[#FF7526] text-white cursor-pointer transition-all shadow"
                        title="Confirm shortcut"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRecording}
                        className="p-1.5 rounded-lg bg-[#262635] hover:bg-[#38384E] text-[#8A8A9E] cursor-pointer transition-all"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <kbd className="px-2.5 py-1 rounded-lg bg-[#1B1B26] border border-[#3A3A4E] text-[11px] font-mono font-bold text-[#F4F4F7] shadow-sm select-none">
                        {hk.displayCombo}
                      </kbd>
                      <button
                        type="button"
                        onClick={() => {
                          setRecordingHotkeyId(hk.id);
                          setRecordedCombo(null);
                          setConflictWarning(null);
                        }}
                        className="p-1.5 rounded-lg text-[#8A8A9E] hover:text-[#F4F4F7] hover:bg-[#262635] transition-all cursor-pointer"
                        title="Remap this shortcut"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SettingSection>
    </div>
  );
};
