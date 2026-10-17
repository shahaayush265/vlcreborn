import React from "react";
import { useSettingsStore, ACCENT_PALETTES } from "../../../stores/useSettingsStore";
import { ThemeMode, AccentColor } from "../../../types/settings";
import { SettingRow, SettingSection, SettingSwitch } from "../SettingRow";
import { Moon, Sun, Monitor, Check } from "lucide-react";

export const InterfaceTab: React.FC = () => {
  const { interface: iface, setInterface, setTheme, setAccentColor } = useSettingsStore();

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: "dark",
      label: "Dark Glass",
      icon: <Moon className="w-4 h-4 text-[#FF5C00]" />,
      desc: "Deep Obsidian (#0D0D11) with translucent acrylic panels",
    },
    {
      id: "oled",
      label: "OLED Black",
      icon: <Monitor className="w-4 h-4 text-purple-400" />,
      desc: "Pure #000000 pitch blacks for OLED displays",
    },
    {
      id: "light",
      label: "Light Frosted",
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      desc: "Clean pearl frosted acrylic with high-contrast typography",
    },
  ];

  const accents: AccentColor[] = ["orange", "crimson", "cyan", "emerald", "purple"];

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <SettingSection title="Appearance & Themes" badge="Reactive Theme Engine">
        <div className="grid grid-cols-3 gap-2.5">
          {themes.map((t) => {
            const isSelected = iface.theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1E1E2C] border-[#FF5C00] shadow-[0_0_16px_rgba(255,92,0,0.2)]"
                    : "bg-[#14141E]/80 border-[#262635] hover:border-[#38384E] text-[#8A8A9E]"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-2">
                    {t.icon}
                    <span className="text-xs font-semibold text-[#F4F4F7]">
                      {t.label}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#FF5C00]" />}
                </div>
                <p className="text-[10px] text-[#8A8A9E] leading-relaxed">
                  {t.desc}
                </p>
              </button>
            );
          })}
        </div>
      </SettingSection>

      {/* Accent Color Palette Engine */}
      <SettingSection title="VLC Accent Engine" badge="Real-time CSS Variables">
        <div className="p-3.5 rounded-xl bg-[#14141E]/80 border border-[#262635] space-y-3">
          <p className="text-[11px] text-[#8A8A9E]">
            Choose an accent color to tint interactive controls, progress bars, highlights, and glowing badges.
          </p>

          <div className="grid grid-cols-5 gap-2.5">
            {accents.map((acc) => {
              const pal = ACCENT_PALETTES[acc];
              const isSelected = iface.accentColor === acc;
              return (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setAccentColor(acc)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-white bg-[#1F1F2B] shadow-lg scale-105"
                      : "border-[#262635] hover:border-[#38384E] bg-[#161622]"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-transform"
                    style={{
                      backgroundColor: pal.primary,
                      boxShadow: isSelected ? `0 0 14px ${pal.primary}` : "none",
                    }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </div>
                  <span className="text-[10px] font-semibold text-[#F4F4F7] truncate max-w-full">
                    {pal.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </SettingSection>

      {/* Interface Options */}
      <SettingSection title="Window & HUD Elements">
        <SettingRow
          label="Top Ambient Breadcrumbs"
          description="Display file name and folder path in the acrylic top header bar"
        >
          <SettingSwitch
            checked={iface.showBreadcrumbs}
            onChange={(checked) => setInterface({ showBreadcrumbs: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Default Remaining Time Display"
          description="Show time counting down (-00:23) rather than elapsed duration"
        >
          <SettingSwitch
            checked={iface.showRemainingTime}
            onChange={(checked) => setInterface({ showRemainingTime: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Always on Top"
          description="Pin player window above all other desktop applications"
          tooltip="Keeps VLC Reborn visible while you multitask in other windows"
        >
          <SettingSwitch
            checked={iface.alwaysOnTop}
            onChange={(checked) => setInterface({ alwaysOnTop: checked })}
          />
        </SettingRow>

        <SettingRow
          label="Acrylic Glass Texture"
          description="Background blur depth for floating dialogs and controls"
        >
          <div className="flex items-center gap-1 p-1 bg-[#1A1A24] rounded-lg border border-[#262635]">
            {(["glass", "acrylic", "solid"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setInterface({ acrylicTexture: mode })}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize cursor-pointer transition-all ${
                  iface.acrylicTexture === mode
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
          label="UI Scale Factor"
          description="Adjust interface density and font scale"
        >
          <div className="flex items-center gap-1 p-1 bg-[#1A1A24] rounded-lg border border-[#262635]">
            {[90, 100, 110, 120].map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={() => setInterface({ uiScale: scale })}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold cursor-pointer transition-all ${
                  iface.uiScale === scale
                    ? "bg-[#FF5C00] text-white shadow"
                    : "text-[#8A8A9E] hover:text-[#F4F4F7]"
                }`}
              >
                {scale}%
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingSection>
    </div>
  );
};
