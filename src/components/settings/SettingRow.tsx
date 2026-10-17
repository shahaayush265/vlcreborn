import React from "react";
import { HelpCircle } from "lucide-react";

interface SettingRowProps {
  label: string;
  description?: string;
  tooltip?: string;
  children: React.ReactNode;
}

export const SettingRow: React.FC<SettingRowProps> = ({
  label,
  description,
  tooltip,
  children,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-3.5 rounded-xl bg-[#14141E]/60 border border-[#262635]/60 hover:border-[#38384E] transition-all group">
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[#F4F4F7] tracking-wide">
            {label}
          </span>
          {tooltip && (
            <div className="relative group/tip cursor-help">
              <HelpCircle className="w-3.5 h-3.5 text-[#8A8A9E] group-hover/tip:text-[var(--dynamic-accent)] transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/tip:flex flex-col items-center z-50 pointer-events-none w-56 p-2 rounded-lg bg-[#1B1B26] border border-[#3A3A4E] text-[10px] text-[#C2C2D1] shadow-xl">
                <span>{tooltip}</span>
                <div className="w-2 h-2 bg-[#1B1B26] border-b border-r border-[#3A3A4E] transform rotate-45 -mb-1 mt-0.5" />
              </div>
            </div>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-[#8A8A9E] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="shrink-0 flex items-center">{children}</div>
    </div>
  );
};

export const SettingSection: React.FC<{
  title: string;
  badge?: string;
  children: React.ReactNode;
}> = ({ title, badge, children }) => {
  return (
    <div className="space-y-2 mb-5">
      <div className="flex items-center gap-2 px-1">
        <h4 className="text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider font-mono">
          {title}
        </h4>
        {badge && (
          <span
            className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold border"
            style={{
              backgroundColor: "var(--dynamic-accent-dim)",
              color: "var(--dynamic-accent)",
              borderColor: "var(--dynamic-accent-border, var(--dynamic-accent-dim))",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
};

export const SettingSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        !checked ? "bg-[#262635]" : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={checked ? { backgroundColor: "var(--dynamic-accent, #FF5C00)" } : undefined}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
};
