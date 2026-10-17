import { create } from "zustand";
import {
  PlaybackState,
  OverlayState,
  RightDeckTab,
  SubtitleCue,
  Track,
  MediaItem,
  Chapter,
  RepeatMode,
  ContinueWatchingPrompt,
  SubtitleSettings,
  AudioSettings,
  EqualizerPresetId,
  VideoSettings,
  PlaybackDeckSettings,
  SleepTimerOption,
} from "../types/player";
import {
  scanSubtitlesForMedia,
  loadSubtitleTrackContent,
  DiscoveredSubtitleTrack,
} from "../lib/subtitleScanner";
import { triggerSubtitleDownload } from "../lib/subtitleParser";
import { saveWatchProgress, getSavedProgress } from "../lib/watchHistory";
import { useSettingsStore } from "./useSettingsStore";

export const EQUALIZER_FREQUENCIES = [
  "32Hz",
  "64Hz",
  "125Hz",
  "250Hz",
  "500Hz",
  "1kHz",
  "2kHz",
  "4kHz",
  "8kHz",
  "16kHz",
];

export const EQUALIZER_PRESETS: Record<EqualizerPresetId, number[]> = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bass_boost: [7, 6, 5, 3, 1, 0, 0, 0, 0, 0],
  vocal_clarity: [-2, -1, 0, 2, 5, 6, 5, 3, 1, 0],
  rock: [5, 4, 2, -1, -2, 0, 2, 4, 5, 6],
  electronic: [6, 5, 2, 0, -2, 2, 1, 3, 5, 6],
  movie: [4, 3, 1, -1, 2, 3, 4, 3, 2, 1],
  custom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  delay: 0,
  fontFamily: "Inter",
  sizeMode: "relative",
  relativeSize: 100,
  preciseSize: 24,
  outlineWidth: 2,
  verticalPosition: 8,
  textColor: "#FFFFFF",
  backgroundColor: "transparent",
  saveForSeries: true,
  selectedTrackId: "sub-1",
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  selectedTrackId: "aud-1",
  channelRouting: "stereo",
  delay: 0,
  equalizerEnabled: true,
  equalizerPreset: "flat",
  equalizerBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  aspectRatio: "original",
  flipHorizontal: false,
  flipVertical: false,
  rotation: 0,
  zoom: 1.0,
  brightness: 100,
  contrast: 100,
  gamma: 1.0,
  saturation: 100,
  hue: 0,
};

export const DEFAULT_PLAYBACK_DECK_SETTINGS: PlaybackDeckSettings = {
  showWaveform: true,
  osdNotifications: true,
  sleepTimer: null,
  sleepTimerRemainingSecs: null,
};

export interface PlayerStore extends PlaybackState, OverlayState {
  // Current media & track metadata
  currentMedia: MediaItem | null;
  subtitles: SubtitleCue[];
  audioTracks: Track<"audio">[];
  subtitleTracks: Track<"subtitle">[];
  chapters: Chapter[];

  // Phase 3 Visual Subtitle Sync State
  isSubtitleSyncOpen: boolean;
  activeSubtitleName: string | null;

  // Phase 2 Deck Settings
  subtitleSettings: SubtitleSettings;
  audioSettings: AudioSettings;
  videoSettings: VideoSettings;
  playbackDeckSettings: PlaybackDeckSettings;

  // OSD message notification state
  osdMessage: string | null;

  // Playback updater actions
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setIsLooping: (isLooping: boolean) => void;
  toggleLoop: () => void;
  setIsScrubbing: (isScrubbing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (isMuted: boolean) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  setBufferedTime: (time: number) => void;

  seekRequest: number | null;
  seekTo: (time: number) => void;
  clearSeek: () => void;
  skipTime: (deltaSeconds: number) => void;

  // Overlay updater actions
  setActiveDeckTab: (tab: RightDeckTab) => void;
  toggleDeckTab: (tab: NonNullable<RightDeckTab>) => void;
  setIsLibraryOpen: (isOpen: boolean) => void;
  toggleLibrary: () => void;
  setIsQueueOpen: (isOpen: boolean) => void;
  toggleQueue: () => void;
  setIsChaptersOpen: (isOpen: boolean) => void;
  toggleChapters: () => void;
  setChapters: (chapters: Chapter[]) => void;
  setShowControls: (show: boolean) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  toggleFullscreen: () => void;

  // Media actions
  setCurrentMedia: (media: MediaItem | null) => void;
  updateCurrentMedia: (patch: Partial<MediaItem>) => void;
  setSubtitles: (cues: SubtitleCue[]) => void;
  setAudioTracks: (tracks: Track<"audio">[]) => void;
  setSubtitleTracks: (tracks: Track<"subtitle">[]) => void;

  // Phase 3 Subtitle Engine & Visual Sync Actions
  setIsSubtitleSyncOpen: (isOpen: boolean) => void;
  toggleSubtitleSync: () => void;
  setSubtitleDelay: (delay: number) => void;
  shiftSubtitleDelay: (deltaMs: number) => void;
  alignNearestCueToTime: (targetTime: number) => void;
  selectSubtitleTrack: (trackId: string) => Promise<void>;
  addSubtitleTrack: (track: Track<"subtitle">, cues: SubtitleCue[], autoSelect?: boolean) => void;
  autoDiscoverSubtitles: (mediaSrc: string, mediaTitle: string) => Promise<void>;
  exportCurrentSubtitles: (format?: "srt" | "vtt") => void;

  // Phase 2 Inspector Deck actions
  setSubtitleSettings: (settings: Partial<SubtitleSettings>) => void;
  resetSubtitleSettings: () => void;
  setAudioSettings: (settings: Partial<AudioSettings>) => void;
  setEqualizerBand: (bandIndex: number, gainDb: number) => void;
  setEqualizerPreset: (preset: EqualizerPresetId) => void;
  resetAudioSettings: () => void;
  setVideoSettings: (settings: Partial<VideoSettings>) => void;
  resetVideoSettings: () => void;
  setPlaybackDeckSettings: (settings: Partial<PlaybackDeckSettings>) => void;
  setSleepTimer: (minutes: SleepTimerOption) => void;
  decrementSleepTimer: () => void;

  // Phase 4 Queue & Playlist State
  queue: MediaItem[];
  currentQueueIndex: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;

  // Phase 4 Continue Watching Prompt State
  continueWatching: ContinueWatchingPrompt | null;

  // Phase 4 Network Stream Dialog State
  isStreamModalOpen: boolean;
  setIsStreamModalOpen: (isOpen: boolean) => void;
  toggleStreamModal: () => void;

  // Phase 4 Queue Actions
  addToQueue: (items: MediaItem | MediaItem[], playNow?: boolean) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (sourceIndex: number, destinationIndex: number) => void;
  playQueueIndex: (index: number) => void;
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  toggleRepeatMode: () => void;
  toggleShuffle: () => void;

  // Phase 4 Continue Watching Actions
  resumeContinueWatching: () => void;
  dismissContinueWatching: () => void;
  recordMediaProgress: (mediaId: string, currentTime: number, duration: number) => void;

  // OSD actions
  showOsd: (message: string) => void;
  clearOsd: () => void;
}

const QUEUE_STORAGE_KEY = "vlc_reborn_persistent_queue";
const QUEUE_INDEX_STORAGE_KEY = "vlc_reborn_persistent_queue_index";

const DUMMY_MEDIA_IDS = new Set([
  "demo-sample",
  "vid-1",
  "vid-2",
  "vid-3",
  "mus-1",
  "mus-2",
  "mus-3",
  "stream-nasa",
  "stream-somafm",
  "stream-mux-test",
]);

const loadPersistedQueue = (): { queue: MediaItem[]; currentQueueIndex: number } => {
  if (typeof window === "undefined") {
    return { queue: [], currentQueueIndex: -1 };
  }
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    const rawIndex = localStorage.getItem(QUEUE_INDEX_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleanQueue = parsed.filter(
          (item: MediaItem) =>
            item &&
            !DUMMY_MEDIA_IDS.has(item.id) &&
            !item.src?.includes("demo-sample") &&
            !item.src?.includes("commondatastorage.googleapis.com")
        );
        if (cleanQueue.length > 0) {
          const index = rawIndex !== null ? parseInt(rawIndex, 10) : 0;
          return {
            queue: cleanQueue,
            currentQueueIndex: isNaN(index) || index < 0 || index >= cleanQueue.length ? 0 : index,
          };
        }
      }
    }
  } catch (err) {
    console.warn("Failed loading persisted queue:", err);
  }
  return { queue: [], currentQueueIndex: -1 };
};

const savePersistedQueue = (queue: MediaItem[], currentQueueIndex?: number) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    if (currentQueueIndex !== undefined) {
      localStorage.setItem(QUEUE_INDEX_STORAGE_KEY, currentQueueIndex.toString());
    }
  } catch (err) {
    console.warn("Failed saving persisted queue:", err);
  }
};

const initialQueueState = loadPersistedQueue();

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // Playback state defaults
  isPlaying: false,
  isLooping: false,
  isScrubbing: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  playbackRate: 1.0,
  bufferedTime: 0,
  seekRequest: null,

  // Overlay state defaults
  activeDeckTab: null,
  isLibraryOpen: false,
  isQueueOpen: false,
  isChaptersOpen: false,
  isStreamModalOpen: false,
  showControls: true,
  isFullscreen: false,

  // Phase 4 Queue & Playlist State (Persistent across reloads)
  queue: initialQueueState.queue,
  currentQueueIndex: initialQueueState.currentQueueIndex,
  repeatMode: "off",
  isShuffled: false,
  continueWatching: null,

  // Media & tracks
  currentMedia: null,
  subtitles: [],
  audioTracks: [],
  subtitleTracks: [],
  chapters: [],

  // Phase 3 Subtitle Sync State
  isSubtitleSyncOpen: false,
  activeSubtitleName: null,

  // Phase 2 Deck Settings defaults
  subtitleSettings: DEFAULT_SUBTITLE_SETTINGS,
  audioSettings: DEFAULT_AUDIO_SETTINGS,
  videoSettings: DEFAULT_VIDEO_SETTINGS,
  playbackDeckSettings: DEFAULT_PLAYBACK_DECK_SETTINGS,
  osdMessage: null,

  // Playback actions
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsLooping: (isLooping) => set({ isLooping }),
  toggleLoop: () => set((state) => ({ isLooping: !state.isLooping })),
  setIsScrubbing: (isScrubbing) => set({ isScrubbing }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => {
    const maxBoost = (useSettingsStore.getState()?.audio?.maxVolumeBoost || 125) / 100;
    const clamped = Math.max(0, Math.min(maxBoost, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
  },
  setIsMuted: (isMuted) => set({ isMuted }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setBufferedTime: (bufferedTime) => set({ bufferedTime }),
  seekTo: (time) => set({ seekRequest: Math.max(0, time), currentTime: Math.max(0, time) }),
  clearSeek: () => set({ seekRequest: null }),
  skipTime: (deltaSeconds) =>
    set((state) => {
      const maxTime = state.duration > 0 ? state.duration : Infinity;
      const target = Math.max(0, Math.min(maxTime, state.currentTime + deltaSeconds));
      return { seekRequest: target, currentTime: target };
    }),

  // Overlay actions
  setActiveDeckTab: (activeDeckTab) =>
    set({ activeDeckTab, isChaptersOpen: activeDeckTab ? false : false }),
  toggleDeckTab: (tab) =>
    set((state) => ({
      activeDeckTab: state.activeDeckTab === tab ? null : tab,
      isChaptersOpen: false,
    })),
  setIsLibraryOpen: (isLibraryOpen) => set({ isLibraryOpen }),
  toggleLibrary: () => set((state) => ({ isLibraryOpen: !state.isLibraryOpen })),
  setIsQueueOpen: (isQueueOpen) => set({ isQueueOpen }),
  toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),
  setIsChaptersOpen: (isChaptersOpen) =>
    set((state) => ({
      isChaptersOpen,
      activeDeckTab: isChaptersOpen ? null : state.activeDeckTab,
    })),
  toggleChapters: () =>
    set((state) => ({
      isChaptersOpen: !state.isChaptersOpen,
      activeDeckTab: !state.isChaptersOpen ? null : state.activeDeckTab,
    })),
  setChapters: (chapters) => set({ chapters }),
  setIsStreamModalOpen: (isStreamModalOpen) => set({ isStreamModalOpen }),
  toggleStreamModal: () => set((state) => ({ isStreamModalOpen: !state.isStreamModalOpen })),
  setShowControls: (showControls) => set({ showControls }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  // Media actions
  setCurrentMedia: (currentMedia) => {
    if (!currentMedia) {
      set({
        currentMedia: null,
        continueWatching: null,
        chapters: [],
        subtitles: [],
        subtitleTracks: [],
        audioTracks: [],
        activeSubtitleName: null,
      });
      return;
    }

    const state = get();
    const isSameMedia = state.currentMedia && (
      state.currentMedia.id === currentMedia.id ||
      state.currentMedia.src === currentMedia.src
    );

    const settings = useSettingsStore.getState?.();
    const promptAllowed = settings?.general?.resumePlaybackPrompt ?? true;
    const defaultRate = settings?.playback?.defaultPlaybackRate || 1.0;
    const defaultRatio = settings?.video?.defaultAspectRatio;

    const saved = getSavedProgress(currentMedia.id || currentMedia.title || currentMedia.src);
    const continueWatching = (saved && promptAllowed && !isSameMedia)
      ? {
          mediaId: currentMedia.id,
          title: currentMedia.title,
          positionSecs: saved.position,
          durationSecs: saved.duration,
        }
      : (isSameMedia ? state.continueWatching : null);

    const currentQueue = state.queue;
    const existingIndex = currentQueue.findIndex(
      (item) => item.id === currentMedia.id || item.src === currentMedia.src
    );

    let nextQueue = currentQueue;
    let nextIndex = existingIndex;
    if (existingIndex === -1) {
      nextQueue = [...currentQueue, currentMedia];
      nextIndex = nextQueue.length - 1;
    }

    const resolvedChapters =
      (currentMedia.chapters && currentMedia.chapters.length > 0)
        ? currentMedia.chapters
        : (isSameMedia && state.currentMedia?.chapters && state.currentMedia.chapters.length > 0)
        ? state.currentMedia.chapters
        : [];

    const resolvedDuration = currentMedia.duration || (isSameMedia ? state.duration : 0);

    set({
      currentMedia: {
        ...currentMedia,
        chapters: resolvedChapters,
      },
      queue: nextQueue,
      currentQueueIndex: nextIndex,
      continueWatching,
      currentTime: isSameMedia ? state.currentTime : 0,
      duration: resolvedDuration,
      chapters: resolvedChapters,
      subtitles: isSameMedia ? state.subtitles : [],
      subtitleTracks: isSameMedia ? state.subtitleTracks : [],
      audioTracks: isSameMedia ? state.audioTracks : [],
      activeSubtitleName: isSameMedia ? state.activeSubtitleName : null,
      playbackRate: isSameMedia ? state.playbackRate : defaultRate,
      videoSettings: (defaultRatio && defaultRatio !== "original" && !isSameMedia)
        ? { ...state.videoSettings, aspectRatio: defaultRatio }
        : state.videoSettings,
    });
  },

  updateCurrentMedia: (patch) => {
    set((state) => {
      if (!state.currentMedia) return state;
      const updated = { ...state.currentMedia, ...patch };
      const updatedQueue = state.queue.map((item) =>
        item.id === updated.id || item.src === updated.src ? { ...item, ...patch } : item
      );
      return { currentMedia: updated, queue: updatedQueue };
    });
  },
  setSubtitles: (subtitles) => set({ subtitles }),
  setAudioTracks: (audioTracks) => set({ audioTracks }),
  setSubtitleTracks: (subtitleTracks) => set({ subtitleTracks }),

  // Phase 3 Subtitle Engine & Visual Sync Actions
  setIsSubtitleSyncOpen: (isSubtitleSyncOpen) => set({ isSubtitleSyncOpen }),
  toggleSubtitleSync: () =>
    set((state) => ({
      isSubtitleSyncOpen: !state.isSubtitleSyncOpen,
    })),

  setSubtitleDelay: (delay) => {
    const clamped = Math.max(-5000, Math.min(5000, Math.round(delay)));
    set((state) => ({
      subtitleSettings: { ...state.subtitleSettings, delay: clamped },
    }));
  },

  shiftSubtitleDelay: (deltaMs) => {
    const current = get().subtitleSettings.delay;
    const clamped = Math.max(-5000, Math.min(5000, current + deltaMs));
    get().setSubtitleDelay(clamped);
    get().showOsd(`Subtitle Sync: ${clamped > 0 ? "+" : ""}${clamped}ms`);
  },

  alignNearestCueToTime: (targetTime) => {
    const cues = get().subtitles;
    if (!cues || cues.length === 0) {
      get().showOsd("No subtitle cues loaded to align");
      return;
    }

    // Find cue whose start time is closest to playhead
    let closestCue: SubtitleCue = cues[0];
    let minDiff = Math.abs(cues[0].startTime - targetTime);

    for (let i = 1; i < cues.length; i++) {
      const diff = Math.abs(cues[i].startTime - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestCue = cues[i];
      }
    }

    // Required shift so that closestCue.startTime coincides with targetTime
    // targetTime = cue.startTime + (delay / 1000)
    // delay = (targetTime - cue.startTime) * 1000
    const offsetMs = Math.round((targetTime - closestCue.startTime) * 1000);
    const clamped = Math.max(-5000, Math.min(5000, offsetMs));
    get().setSubtitleDelay(clamped);
    get().showOsd(
      `Aligned “${closestCue.text.slice(0, 24)}...” to playhead (${clamped > 0 ? "+" : ""}${clamped}ms)`
    );
  },

  selectSubtitleTrack: async (trackId) => {
    if (!trackId) {
      set((state) => ({
        subtitleSettings: { ...state.subtitleSettings, selectedTrackId: "" },
        subtitles: [],
        activeSubtitleName: null,
      }));
      get().showOsd("Subtitles Disabled");
      return;
    }

    const tracks = get().subtitleTracks;
    const target = tracks.find((t) => t.id === trackId);
    if (!target) return;

    const updatedTracks = tracks.map((t) => ({ ...t, selected: t.id === trackId }));
    set((state) => ({
      subtitleTracks: updatedTracks,
      subtitleSettings: { ...state.subtitleSettings, selectedTrackId: trackId },
      activeSubtitleName: target.filename || target.label,
    }));

    try {
      const cues = await loadSubtitleTrackContent(target as DiscoveredSubtitleTrack);
      if (cues && cues.length > 0) {
        set({ subtitles: cues });
        get().showOsd(`Loaded Subtitles: ${target.label} (${cues.length} cues)`);
      } else if (target.cues && target.cues.length > 0) {
        set({ subtitles: target.cues });
        get().showOsd(`Subtitles: ${target.label}`);
      }
    } catch (err) {
      console.warn("Failed loading subtitle cues:", err);
    }
  },

  addSubtitleTrack: (track, cues, autoSelect = true) => {
    const existing = get().subtitleTracks;
    const filtered = existing.filter((t) => t.id !== track.id);
    const newTrack = { ...track, cues, selected: autoSelect };
    const nextTracks = autoSelect
      ? [...filtered.map((t) => ({ ...t, selected: false })), newTrack]
      : [...filtered, newTrack];

    set((state) => ({
      subtitleTracks: nextTracks,
      ...(autoSelect
        ? {
            subtitles: cues,
            activeSubtitleName: track.filename || track.label,
            subtitleSettings: { ...state.subtitleSettings, selectedTrackId: track.id },
          }
        : {}),
    }));

    if (autoSelect) {
      get().showOsd(`Loaded Subtitle: ${track.label} (${cues.length} cues)`);
    }
  },

  autoDiscoverSubtitles: async (mediaSrc, mediaTitle) => {
    try {
      const discovered = await scanSubtitlesForMedia(mediaSrc, mediaTitle);
      if (discovered && discovered.length > 0) {
        set({ subtitleTracks: discovered });
        const first = discovered[0];
        if (first) {
          await get().selectSubtitleTrack(first.id);
        }
      }
    } catch (err) {
      console.warn("Auto-discovery failed:", err);
    }
  },

  exportCurrentSubtitles: (format = "srt") => {
    const cues = get().subtitles;
    if (!cues || cues.length === 0) {
      get().showOsd("No subtitles loaded to export");
      return;
    }
    const delay = get().subtitleSettings.delay;
    const baseName = get().activeSubtitleName || get().currentMedia?.title || "subtitles";
    triggerSubtitleDownload(cues, baseName, delay, format);
    get().showOsd(`Exported synced subtitles (${delay > 0 ? "+" : ""}${delay}ms offset)`);
  },

  // Phase 2 Deck Actions
  setSubtitleSettings: (settings) =>
    set((state) => {
      const updated = { ...state.subtitleSettings, ...settings };
      if (updated.saveForSeries) {
        try {
          localStorage.setItem("vlcreborn_subtitle_settings", JSON.stringify(updated));
        } catch {}
      }
      return { subtitleSettings: updated };
    }),

  resetSubtitleSettings: () =>
    set({ subtitleSettings: DEFAULT_SUBTITLE_SETTINGS }),

  setAudioSettings: (settings) =>
    set((state) => ({
      audioSettings: { ...state.audioSettings, ...settings },
    })),

  setEqualizerBand: (bandIndex, gainDb) =>
    set((state) => {
      const newBands = [...state.audioSettings.equalizerBands];
      newBands[bandIndex] = Math.max(-12, Math.min(12, gainDb));
      return {
        audioSettings: {
          ...state.audioSettings,
          equalizerPreset: "custom",
          equalizerBands: newBands,
        },
      };
    }),

  setEqualizerPreset: (preset) =>
    set((state) => ({
      audioSettings: {
        ...state.audioSettings,
        equalizerPreset: preset,
        equalizerBands: [...EQUALIZER_PRESETS[preset]],
      },
    })),

  resetAudioSettings: () =>
    set({ audioSettings: DEFAULT_AUDIO_SETTINGS }),

  setVideoSettings: (settings) =>
    set((state) => ({
      videoSettings: { ...state.videoSettings, ...settings },
    })),

  resetVideoSettings: () =>
    set({ videoSettings: DEFAULT_VIDEO_SETTINGS }),

  setPlaybackDeckSettings: (settings) =>
    set((state) => ({
      playbackDeckSettings: { ...state.playbackDeckSettings, ...settings },
    })),

  setSleepTimer: (minutes) =>
    set((state) => {
      let remainingSecs: number | null = null;
      if (minutes && minutes > 0) {
        remainingSecs = minutes * 60;
      } else if (minutes === -1) {
        // end of video
        remainingSecs = Math.max(0, Math.floor(state.duration - state.currentTime));
      }
      return {
        playbackDeckSettings: {
          ...state.playbackDeckSettings,
          sleepTimer: minutes,
          sleepTimerRemainingSecs: remainingSecs,
        },
      };
    }),

  decrementSleepTimer: () => {
    const current = get().playbackDeckSettings.sleepTimerRemainingSecs;
    if (current === null) return;
    if (current <= 1) {
      set((state) => ({
        isPlaying: false,
        playbackDeckSettings: {
          ...state.playbackDeckSettings,
          sleepTimer: null,
          sleepTimerRemainingSecs: null,
        },
      }));
      get().showOsd("Sleep Timer Expired: Playback Paused");
    } else {
      set((state) => ({
        playbackDeckSettings: {
          ...state.playbackDeckSettings,
          sleepTimerRemainingSecs: current - 1,
        },
      }));
    }
  },

  // Phase 4 Queue Actions
  addToQueue: (items, playNow = false) => {
    const arr = Array.isArray(items) ? items : [items];
    if (arr.length === 0) return;
    const prevQueue = get().queue;
    const nextQueue = [...prevQueue, ...arr];
    set({ queue: nextQueue });

    if (playNow || !get().currentMedia) {
      const targetIndex = nextQueue.length - arr.length;
      get().playQueueIndex(targetIndex);
    } else {
      get().showOsd(`Added ${arr.length} item${arr.length > 1 ? "s" : ""} to Queue`);
    }
  },

  removeFromQueue: (index) => {
    set((state) => {
      const nextQueue = state.queue.filter((_, i) => i !== index);
      let nextIndex = state.currentQueueIndex;
      if (index < state.currentQueueIndex) {
        nextIndex = Math.max(0, state.currentQueueIndex - 1);
      } else if (index === state.currentQueueIndex) {
        nextIndex = Math.min(nextIndex, Math.max(0, nextQueue.length - 1));
      }
      return {
        queue: nextQueue,
        currentQueueIndex: nextIndex,
      };
    });
  },

  clearQueue: () => {
    set({ queue: [], currentQueueIndex: -1 });
    get().showOsd("Queue Cleared");
  },

  reorderQueue: (sourceIndex, destinationIndex) => {
    set((state) => {
      if (
        sourceIndex < 0 ||
        sourceIndex >= state.queue.length ||
        destinationIndex < 0 ||
        destinationIndex >= state.queue.length
      ) {
        return state;
      }
      const newQueue = [...state.queue];
      const [removed] = newQueue.splice(sourceIndex, 1);
      newQueue.splice(destinationIndex, 0, removed);

      let nextQueueIndex = state.currentQueueIndex;
      if (state.currentQueueIndex === sourceIndex) {
        nextQueueIndex = destinationIndex;
      } else if (
        sourceIndex < state.currentQueueIndex &&
        destinationIndex >= state.currentQueueIndex
      ) {
        nextQueueIndex -= 1;
      } else if (
        sourceIndex > state.currentQueueIndex &&
        destinationIndex <= state.currentQueueIndex
      ) {
        nextQueueIndex += 1;
      }

      return { queue: newQueue, currentQueueIndex: nextQueueIndex };
    });
  },

  playQueueIndex: (index) => {
    const queue = get().queue;
    if (index < 0 || index >= queue.length) return;
    const item = queue[index];
    const resolvedChapters =
      (item.chapters && item.chapters.length > 0) ? item.chapters : [];

    set({
      currentQueueIndex: index,
      currentMedia: {
        ...item,
        chapters: resolvedChapters,
      },
      isPlaying: true,
      currentTime: 0,
      duration: item.duration || get().duration || 0,
      seekRequest: 0,
      chapters: resolvedChapters,
      subtitles: [],
      subtitleTracks: [],
      audioTracks: [],
      activeSubtitleName: null,
    });

    const saved = getSavedProgress(item.id || item.title || item.src);
    if (saved) {
      set({
        continueWatching: {
          mediaId: item.id,
          title: item.title,
          positionSecs: saved.position,
          durationSecs: saved.duration,
        },
      });
    } else {
      set({ continueWatching: null });
    }

    if (item.type !== "music") {
      get().autoDiscoverSubtitles(item.src, item.title);
    }
    get().showOsd(`Playing: ${item.title}`);
  },

  playNextTrack: () => {
    const { queue, currentQueueIndex, repeatMode, isShuffled } = get();
    if (queue.length === 0) return;

    if (repeatMode === "one") {
      get().seekTo(0);
      get().setIsPlaying(true);
      return;
    }

    if (isShuffled && queue.length > 1) {
      let rand = Math.floor(Math.random() * queue.length);
      while (rand === currentQueueIndex && queue.length > 1) {
        rand = Math.floor(Math.random() * queue.length);
      }
      get().playQueueIndex(rand);
      return;
    }

    // Cycle through videos in the queue
    const nextIndex = (currentQueueIndex + 1) % queue.length;
    get().playQueueIndex(nextIndex);
  },

  playPreviousTrack: () => {
    const { queue, currentQueueIndex } = get();
    if (queue.length === 0) return;

    // Cycle backward through videos in the queue
    const prevIndex = (currentQueueIndex - 1 + queue.length) % queue.length;
    get().playQueueIndex(prevIndex);
  },

  toggleRepeatMode: () => {
    set((state) => {
      const modes: RepeatMode[] = ["off", "all", "one"];
      const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length;
      const nextMode = modes[nextIndex];
      get().showOsd(
        `Repeat: ${nextMode === "off" ? "Off" : nextMode === "all" ? "Repeat All" : "Repeat One"}`
      );
      return { repeatMode: nextMode };
    });
  },

  toggleShuffle: () => {
    set((state) => {
      const nextShuffle = !state.isShuffled;
      get().showOsd(`Shuffle: ${nextShuffle ? "On" : "Off"}`);
      return { isShuffled: nextShuffle };
    });
  },

  resumeContinueWatching: () => {
    const cw = get().continueWatching;
    if (!cw) return;
    get().seekTo(cw.positionSecs);
    get().setIsPlaying(true);
    const m = Math.floor(cw.positionSecs / 60);
    const s = Math.floor(cw.positionSecs % 60);
    get().showOsd(`Resumed at ${m}:${s.toString().padStart(2, "0")}`);
    set({ continueWatching: null });
  },

  dismissContinueWatching: () => {
    set({ continueWatching: null });
  },

  recordMediaProgress: (mediaId, currentTime, duration) => {
    const settings = useSettingsStore.getState?.();
    if (
      settings?.privacy?.savePlaybackHistory === false ||
      settings?.general?.saveRecentMedia === false
    ) {
      return;
    }
    saveWatchProgress(mediaId, currentTime, duration);
  },

  // OSD feedback
  showOsd: (message) => {
    set({ osdMessage: message });
  },
  clearOsd: () => set({ osdMessage: null }),
}));

// Automatic persistence for Queue & Index updates
if (typeof window !== "undefined") {
  usePlayerStore.subscribe((state, prevState) => {
    if (
      state.queue !== prevState.queue ||
      state.currentQueueIndex !== prevState.currentQueueIndex
    ) {
      savePersistedQueue(state.queue, state.currentQueueIndex);
    }
  });
}

