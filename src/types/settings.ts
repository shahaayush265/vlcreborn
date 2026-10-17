export type ThemeMode = "dark" | "light" | "oled";
export type AccentColor = "orange" | "crimson" | "cyan" | "emerald" | "purple";

export type SettingsCategory =
  | "general"
  | "interface"
  | "privacy"
  | "controls"
  | "playback"
  | "video"
  | "audio"
  | "subtitles"
  | "library"
  | "performance";

export interface GeneralSettings {
  saveRecentMedia: boolean;
  resumePlaybackPrompt: boolean;
  pauseOnMinimize: boolean;
  singleInstance: boolean;
  systemTray: boolean;
  autoCheckUpdates: boolean;
}

export interface InterfaceSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  acrylicTexture: "glass" | "acrylic" | "solid";
  uiScale: number; // 90, 100, 110, 120 (%)
  showBreadcrumbs: boolean;
  showRemainingTime: boolean;
  alwaysOnTop: boolean;
}

export interface PrivacySettings {
  savePlaybackHistory: boolean;
  saveSubtitleHistory: boolean;
  onlineMetadataLookup: boolean;
  anonymousTelemetry: boolean;
  clearHistoryOnExit: boolean;
}

export interface ControlsSettings {
  seekStepShort: number; // seconds (default: 5)
  seekStepMedium: number; // seconds (default: 10)
  seekStepLong: number; // seconds (default: 60)
  mouseWheelAction: "volume" | "seek" | "zoom";
  doubleClickAction: "fullscreen" | "playPause";
  showOsdHotkeyBadge: boolean;
}

export interface PlaybackSettingsConfig {
  defaultPlaybackRate: number; // 1.0
  autoPlayNextInQueue: boolean;
  hardwareAcceleration: "auto" | "vaapi" | "nvdec" | "d3d11va" | "software";
  rememberTrackSelections: boolean;
  audioNormalization: boolean;
}

export interface VideoSettingsConfig {
  defaultAspectRatio: "original" | "16:9" | "4:3" | "21:9" | "1:1" | "fill";
  deinterlacing: "auto" | "on" | "off";
  postProcessing: "crisp" | "balanced" | "cinematic";
  colorSpace: "bt709" | "srgb" | "bt2020";
}

export interface AudioSettingsConfig {
  outputDevice: string;
  maxVolumeBoost: number; // 125 or 150 (%)
  dynamicRangeCompression: boolean;
  spatialAudioVirtualizer: boolean;
  exclusiveAudioMode: boolean;
}

export interface SubtitlesSettingsConfig {
  preferredLanguage: string;
  autoDiscoverNearby: boolean;
  defaultFontFamily: string;
  defaultTextColor: string;
  defaultOutlineWidth: number;
  speechSyncSensitivity: "normal" | "fine" | "aggressive";
}

export interface LibrarySettingsConfig {
  scanOnStartup: boolean;
  autoGenerateThumbnails: boolean;
  groupByCategory: boolean;
  ignoredFolders: string[];
  supportedFormats: string[];
}

export interface PerformanceSettingsConfig {
  gpuCanvasAccelerated: boolean;
  bufferLengthSecs: number; // seconds (default: 30)
  storyboardBackgroundPreload: boolean;
  lowPowerMode: boolean;
  memoryCacheLimitMb: number; // MB (default: 256)
}

export interface HotkeyItem {
  id: string;
  name: string;
  category: "Playback" | "Navigation" | "Volume & Audio" | "Interface";
  combo: string; // e.g. "Space", "ArrowLeft", "KeyF", "Ctrl+Comma"
  displayCombo: string; // e.g. "Space", "←", "F", "Ctrl + ,"
  description: string;
}

export interface UnifiedSettingsState {
  general: GeneralSettings;
  interface: InterfaceSettings;
  privacy: PrivacySettings;
  controls: ControlsSettings;
  playback: PlaybackSettingsConfig;
  video: VideoSettingsConfig;
  audio: AudioSettingsConfig;
  subtitles: SubtitlesSettingsConfig;
  library: LibrarySettingsConfig;
  performance: PerformanceSettingsConfig;
  hotkeys: HotkeyItem[];
}
