import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ThemeMode,
  AccentColor,
  SettingsCategory,
  GeneralSettings,
  InterfaceSettings,
  PrivacySettings,
  ControlsSettings,
  PlaybackSettingsConfig,
  VideoSettingsConfig,
  AudioSettingsConfig,
  SubtitlesSettingsConfig,
  LibrarySettingsConfig,
  PerformanceSettingsConfig,
  HotkeyItem,
} from "../types/settings";

export const ACCENT_PALETTES: Record<
  AccentColor,
  {
    name: string;
    primary: string;
    hover: string;
    glow: string;
    gradient: string;
    bgSubtle: string;
    borderSubtle: string;
  }
> = {
  orange: {
    name: "VLC Cone Orange",
    primary: "#FF5C00",
    hover: "#FF7526",
    glow: "rgba(255, 92, 0, 0.4)",
    gradient: "from-[#FF5C00] to-[#FF7526]",
    bgSubtle: "rgba(255, 92, 0, 0.12)",
    borderSubtle: "rgba(255, 92, 0, 0.35)",
  },
  crimson: {
    name: "Crimson Red",
    primary: "#FF2E55",
    hover: "#FF5072",
    glow: "rgba(255, 46, 85, 0.4)",
    gradient: "from-[#FF2E55] to-[#FF5072]",
    bgSubtle: "rgba(255, 46, 85, 0.12)",
    borderSubtle: "rgba(255, 46, 85, 0.35)",
  },
  cyan: {
    name: "Neon Cyan",
    primary: "#00D2FF",
    hover: "#33DBFF",
    glow: "rgba(0, 210, 255, 0.4)",
    gradient: "from-[#00D2FF] to-[#33DBFF]",
    bgSubtle: "rgba(0, 210, 255, 0.12)",
    borderSubtle: "rgba(0, 210, 255, 0.35)",
  },
  emerald: {
    name: "Emerald Green",
    primary: "#10B981",
    hover: "#34D399",
    glow: "rgba(16, 185, 129, 0.4)",
    gradient: "from-[#10B981] to-[#34D399]",
    bgSubtle: "rgba(16, 185, 129, 0.12)",
    borderSubtle: "rgba(16, 185, 129, 0.35)",
  },
  purple: {
    name: "Cyberpunk Purple",
    primary: "#A855F7",
    hover: "#C084FC",
    glow: "rgba(168, 85, 247, 0.4)",
    gradient: "from-[#A855F7] to-[#C084FC]",
    bgSubtle: "rgba(168, 85, 247, 0.12)",
    borderSubtle: "rgba(168, 85, 247, 0.35)",
  },
};

export const DEFAULT_HOTKEYS: HotkeyItem[] = [
  {
    id: "toggle_play",
    name: "Play / Pause",
    category: "Playback",
    combo: "Space",
    displayCombo: "Space",
    description: "Start or pause media playback",
  },
  {
    id: "rewind_10s",
    name: "Rewind 10 Seconds",
    category: "Playback",
    combo: "ArrowLeft",
    displayCombo: "←",
    description: "Seek backward by 10 seconds",
  },
  {
    id: "forward_10s",
    name: "Forward 10 Seconds",
    category: "Playback",
    combo: "ArrowRight",
    displayCombo: "→",
    description: "Seek forward by 10 seconds",
  },
  {
    id: "rewind_5s",
    name: "Short Rewind (5s)",
    category: "Playback",
    combo: "KeyJ",
    displayCombo: "J",
    description: "Fine seek backward by 5 seconds",
  },
  {
    id: "forward_5s",
    name: "Short Forward (5s)",
    category: "Playback",
    combo: "KeyL",
    displayCombo: "L",
    description: "Fine seek forward by 5 seconds",
  },
  {
    id: "speed_up",
    name: "Increase Speed",
    category: "Playback",
    combo: "BracketRight",
    displayCombo: "]",
    description: "Speed up playback by +0.25x",
  },
  {
    id: "speed_down",
    name: "Decrease Speed",
    category: "Playback",
    combo: "BracketLeft",
    displayCombo: "[",
    description: "Slow down playback by -0.25x",
  },
  {
    id: "speed_reset",
    name: "Reset Speed (1.0x)",
    category: "Playback",
    combo: "Equal",
    displayCombo: "=",
    description: "Reset playback rate to normal 1.0x",
  },
  {
    id: "next_track",
    name: "Next Video in Queue",
    category: "Navigation",
    combo: "KeyN",
    displayCombo: "N",
    description: "Cycle forward to next queue item",
  },
  {
    id: "prev_track",
    name: "Previous Video in Queue",
    category: "Navigation",
    combo: "KeyP",
    displayCombo: "P",
    description: "Cycle backward to previous queue item",
  },
  {
    id: "toggle_chapters",
    name: "Chapters Navigation",
    category: "Navigation",
    combo: "KeyC",
    displayCombo: "C",
    description: "Open floating chapter milestones drawer",
  },
  {
    id: "volume_up",
    name: "Volume Up",
    category: "Volume & Audio",
    combo: "ArrowUp",
    displayCombo: "↑",
    description: "Increase volume by +5%",
  },
  {
    id: "volume_down",
    name: "Volume Down",
    category: "Volume & Audio",
    combo: "ArrowDown",
    displayCombo: "↓",
    description: "Decrease volume by -5%",
  },
  {
    id: "toggle_mute",
    name: "Mute Audio",
    category: "Volume & Audio",
    combo: "KeyM",
    displayCombo: "M",
    description: "Toggle sound mute on/off",
  },
  {
    id: "toggle_fullscreen",
    name: "Fullscreen Mode",
    category: "Interface",
    combo: "KeyF",
    displayCombo: "F",
    description: "Toggle edge-to-edge fullscreen",
  },
  {
    id: "toggle_library",
    name: "Media Library",
    category: "Interface",
    combo: "Shift+KeyL",
    displayCombo: "Shift+L",
    description: "Open compact media library",
  },
  {
    id: "toggle_queue",
    name: "Playlist Queue",
    category: "Interface",
    combo: "KeyQ",
    displayCombo: "Q",
    description: "Open queue drawer",
  },
  {
    id: "toggle_settings",
    name: "Preferences & Settings",
    category: "Interface",
    combo: "Control+Comma",
    displayCombo: "Ctrl + ,",
    description: "Open 10-category Preferences dialog",
  },
  {
    id: "toggle_subtitle_sync",
    name: "Visual Subtitle Matcher",
    category: "Interface",
    combo: "Shift+KeyS",
    displayCombo: "Shift + S",
    description: "Open speech rhythm subtitle synchronizer",
  },
];

export const DEFAULT_GENERAL: GeneralSettings = {
  saveRecentMedia: true,
  resumePlaybackPrompt: true,
  pauseOnMinimize: false,
  singleInstance: true,
  systemTray: true,
  autoCheckUpdates: true,
};

export const DEFAULT_INTERFACE: InterfaceSettings = {
  theme: "dark",
  accentColor: "orange",
  acrylicTexture: "acrylic",
  uiScale: 100,
  showBreadcrumbs: true,
  showRemainingTime: false,
  alwaysOnTop: false,
};

export const DEFAULT_PRIVACY: PrivacySettings = {
  savePlaybackHistory: true,
  saveSubtitleHistory: true,
  onlineMetadataLookup: true,
  anonymousTelemetry: false,
  clearHistoryOnExit: false,
};

export const DEFAULT_CONTROLS: ControlsSettings = {
  seekStepShort: 5,
  seekStepMedium: 10,
  seekStepLong: 60,
  mouseWheelAction: "volume",
  doubleClickAction: "fullscreen",
  showOsdHotkeyBadge: true,
};

export const DEFAULT_PLAYBACK: PlaybackSettingsConfig = {
  defaultPlaybackRate: 1.0,
  autoPlayNextInQueue: true,
  hardwareAcceleration: "auto",
  rememberTrackSelections: true,
  audioNormalization: true,
};

export const DEFAULT_VIDEO: VideoSettingsConfig = {
  defaultAspectRatio: "original",
  deinterlacing: "auto",
  postProcessing: "crisp",
  colorSpace: "bt709",
};

export const DEFAULT_AUDIO: AudioSettingsConfig = {
  outputDevice: "default",
  maxVolumeBoost: 125,
  dynamicRangeCompression: false,
  spatialAudioVirtualizer: true,
  exclusiveAudioMode: false,
};

export const DEFAULT_SUBTITLES: SubtitlesSettingsConfig = {
  preferredLanguage: "en",
  autoDiscoverNearby: true,
  defaultFontFamily: "Inter, sans-serif",
  defaultTextColor: "#FFFFFF",
  defaultOutlineWidth: 2,
  speechSyncSensitivity: "normal",
};

export const DEFAULT_LIBRARY: LibrarySettingsConfig = {
  scanOnStartup: true,
  autoGenerateThumbnails: true,
  groupByCategory: true,
  ignoredFolders: [".git", "node_modules", "$RECYCLE.BIN"],
  supportedFormats: ["mp4", "mkv", "avi", "mov", "webm", "flv", "mp3", "flac", "wav"],
};

export const DEFAULT_PERFORMANCE: PerformanceSettingsConfig = {
  gpuCanvasAccelerated: true,
  bufferLengthSecs: 30,
  storyboardBackgroundPreload: true,
  lowPowerMode: false,
  memoryCacheLimitMb: 256,
};

interface SettingsStoreState {
  // Modal navigation
  isSettingsOpen: boolean;
  activeCategory: SettingsCategory;
  searchQuery: string;

  // 10 Domains
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

  // Modal actions
  openSettings: (category?: SettingsCategory) => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  setActiveCategory: (cat: SettingsCategory) => void;
  setSearchQuery: (query: string) => void;

  // Domain update actions
  setGeneral: (patch: Partial<GeneralSettings>) => void;
  setInterface: (patch: Partial<InterfaceSettings>) => void;
  setPrivacy: (patch: Partial<PrivacySettings>) => void;
  setControls: (patch: Partial<ControlsSettings>) => void;
  setPlayback: (patch: Partial<PlaybackSettingsConfig>) => void;
  setVideo: (patch: Partial<VideoSettingsConfig>) => void;
  setAudio: (patch: Partial<AudioSettingsConfig>) => void;
  setSubtitles: (patch: Partial<SubtitlesSettingsConfig>) => void;
  setLibrary: (patch: Partial<LibrarySettingsConfig>) => void;
  setPerformance: (patch: Partial<PerformanceSettingsConfig>) => void;

  // Theming quick actions
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (accent: AccentColor) => void;
  applyThemeToDom: () => void;

  // Hotkey actions
  remapHotkey: (id: string, newCombo: string, displayCombo: string) => void;
  resetHotkeys: () => void;

  // Reset actions
  resetCategory: (category: SettingsCategory) => void;
  resetAll: () => void;
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set, get) => ({
      isSettingsOpen: false,
      activeCategory: "general",
      searchQuery: "",

      general: { ...DEFAULT_GENERAL },
      interface: { ...DEFAULT_INTERFACE },
      privacy: { ...DEFAULT_PRIVACY },
      controls: { ...DEFAULT_CONTROLS },
      playback: { ...DEFAULT_PLAYBACK },
      video: { ...DEFAULT_VIDEO },
      audio: { ...DEFAULT_AUDIO },
      subtitles: { ...DEFAULT_SUBTITLES },
      library: { ...DEFAULT_LIBRARY },
      performance: { ...DEFAULT_PERFORMANCE },
      hotkeys: [...DEFAULT_HOTKEYS],

      openSettings: (category) =>
        set((state) => ({
          isSettingsOpen: true,
          activeCategory: category || state.activeCategory,
        })),
      closeSettings: () => set({ isSettingsOpen: false }),
      toggleSettings: () =>
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      setActiveCategory: (activeCategory) => set({ activeCategory }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      setGeneral: (patch) =>
        set((state) => ({ general: { ...state.general, ...patch } })),
      setInterface: (patch) => {
        set((state) => {
          const updated = { ...state.interface, ...patch };
          setTimeout(() => get().applyThemeToDom(), 0);
          return { interface: updated };
        });
      },
      setPrivacy: (patch) =>
        set((state) => ({ privacy: { ...state.privacy, ...patch } })),
      setControls: (patch) =>
        set((state) => ({ controls: { ...state.controls, ...patch } })),
      setPlayback: (patch) =>
        set((state) => ({ playback: { ...state.playback, ...patch } })),
      setVideo: (patch) =>
        set((state) => ({ video: { ...state.video, ...patch } })),
      setAudio: (patch) =>
        set((state) => ({ audio: { ...state.audio, ...patch } })),
      setSubtitles: (patch) =>
        set((state) => ({ subtitles: { ...state.subtitles, ...patch } })),
      setLibrary: (patch) =>
        set((state) => ({ library: { ...state.library, ...patch } })),
      setPerformance: (patch) =>
        set((state) => ({ performance: { ...state.performance, ...patch } })),

      setTheme: (theme) => {
        get().setInterface({ theme });
      },
      setAccentColor: (accentColor) => {
        get().setInterface({ accentColor });
      },

      applyThemeToDom: () => {
        const { theme, accentColor, uiScale } = get().interface;
        const root = document.documentElement;

        // Apply data attributes
        root.setAttribute("data-theme", theme);
        root.setAttribute("data-accent", accentColor);

        // Apply dynamic CSS variables for immediate reactive styling
        const palette = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.orange;
        root.style.setProperty("--vlc-orange", palette.primary);
        root.style.setProperty("--vlc-orange-hover", palette.hover);
        root.style.setProperty("--vlc-orange-glow", palette.glow);
        root.style.setProperty("--vlc-orange-dim", palette.bgSubtle);
        root.style.setProperty("--accent-primary", palette.primary);
        root.style.setProperty("--accent-hover", palette.hover);
        root.style.setProperty("--accent-glow", palette.glow);
        root.style.setProperty("--accent-dim", palette.bgSubtle);
        root.style.setProperty("--dynamic-accent", palette.primary);
        root.style.setProperty("--dynamic-accent-hover", palette.hover);
        root.style.setProperty("--dynamic-accent-glow", palette.glow);
        root.style.setProperty("--dynamic-accent-dim", palette.bgSubtle);
        root.style.setProperty("--dynamic-accent-border", palette.borderSubtle);

        // Apply UI Scale immediately
        if (uiScale && uiScale !== 100) {
          root.style.zoom = `${uiScale}%`;
        } else {
          root.style.zoom = "100%";
        }

        if (theme === "light") {
          root.style.setProperty("--bg-primary", "#F5F6FA");
          root.style.setProperty("--bg-surface", "#FFFFFF");
          root.style.setProperty("--border", "#E2E8F0");
          root.style.setProperty("--text-primary", "#0F172A");
          root.style.setProperty("--text-muted", "#64748B");
          root.classList.add("light");
          root.classList.remove("dark", "oled");
        } else if (theme === "oled") {
          root.style.setProperty("--bg-primary", "#000000");
          root.style.setProperty("--bg-surface", "#08080C");
          root.style.setProperty("--border", "#1A1A24");
          root.style.setProperty("--text-primary", "#F4F4F7");
          root.style.setProperty("--text-muted", "#8A8A9E");
          root.classList.add("oled", "dark");
          root.classList.remove("light");
        } else {
          // Standard dark
          root.style.setProperty("--bg-primary", "#0D0D11");
          root.style.setProperty("--bg-surface", "#16161E");
          root.style.setProperty("--border", "#262635");
          root.style.setProperty("--text-primary", "#F4F4F7");
          root.style.setProperty("--text-muted", "#8A8A9E");
          root.classList.add("dark");
          root.classList.remove("light", "oled");
        }
      },

      remapHotkey: (id, newCombo, displayCombo) => {
        set((state) => ({
          hotkeys: state.hotkeys.map((h) =>
            h.id === id ? { ...h, combo: newCombo, displayCombo } : h
          ),
        }));
      },

      resetHotkeys: () => {
        set({ hotkeys: [...DEFAULT_HOTKEYS] });
      },

      resetCategory: (cat) => {
        switch (cat) {
          case "general":
            set({ general: { ...DEFAULT_GENERAL } });
            break;
          case "interface":
            set({ interface: { ...DEFAULT_INTERFACE } });
            setTimeout(() => get().applyThemeToDom(), 0);
            break;
          case "privacy":
            set({ privacy: { ...DEFAULT_PRIVACY } });
            break;
          case "controls":
            set({ controls: { ...DEFAULT_CONTROLS }, hotkeys: [...DEFAULT_HOTKEYS] });
            break;
          case "playback":
            set({ playback: { ...DEFAULT_PLAYBACK } });
            break;
          case "video":
            set({ video: { ...DEFAULT_VIDEO } });
            break;
          case "audio":
            set({ audio: { ...DEFAULT_AUDIO } });
            break;
          case "subtitles":
            set({ subtitles: { ...DEFAULT_SUBTITLES } });
            break;
          case "library":
            set({ library: { ...DEFAULT_LIBRARY } });
            break;
          case "performance":
            set({ performance: { ...DEFAULT_PERFORMANCE } });
            break;
        }
      },

      resetAll: () => {
        set({
          general: { ...DEFAULT_GENERAL },
          interface: { ...DEFAULT_INTERFACE },
          privacy: { ...DEFAULT_PRIVACY },
          controls: { ...DEFAULT_CONTROLS },
          playback: { ...DEFAULT_PLAYBACK },
          video: { ...DEFAULT_VIDEO },
          audio: { ...DEFAULT_AUDIO },
          subtitles: { ...DEFAULT_SUBTITLES },
          library: { ...DEFAULT_LIBRARY },
          performance: { ...DEFAULT_PERFORMANCE },
          hotkeys: [...DEFAULT_HOTKEYS],
        });
        setTimeout(() => get().applyThemeToDom(), 0);
      },
    }),
    {
      name: "vlc-reborn-unified-preferences",
      partialize: (state) => ({
        general: state.general,
        interface: state.interface,
        privacy: state.privacy,
        controls: state.controls,
        playback: state.playback,
        video: state.video,
        audio: state.audio,
        subtitles: state.subtitles,
        library: state.library,
        performance: state.performance,
        hotkeys: state.hotkeys,
      }),
    }
  )
);
