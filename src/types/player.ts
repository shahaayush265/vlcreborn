export type TrackType = "audio" | "video" | "subtitle";

export interface Track<T extends TrackType = TrackType> {
  id: string;
  label: string;
  language?: string;
  selected: boolean;
  type?: T;
  filename?: string;
  format?: string;
  path?: string;
  cues?: SubtitleCue[];
}

export interface SubtitleCue {
  id: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
}

export type RightDeckTab = "subtitles" | "audio" | "video" | "playback" | null;

export interface PlaybackState {
  isPlaying: boolean;
  isLooping: boolean;
  isScrubbing: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  isMuted: boolean;
  playbackRate: number;
  bufferedTime: number;
}

export type MediaType = "video" | "music" | "stream";

export type RepeatMode = "off" | "all" | "one";

export interface ContinueWatchingPrompt {
  mediaId: string;
  title: string;
  positionSecs: number;
  durationSecs: number;
}

export interface Chapter {
  id: string;
  title: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  thumbnail?: string;
  description?: string;
}

export interface OverlayState {
  activeDeckTab: RightDeckTab;
  isLibraryOpen: boolean;
  isQueueOpen: boolean;
  isChaptersOpen: boolean;
  isStreamModalOpen: boolean;
  showControls: boolean;
  isFullscreen: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  src: string;
  duration?: number;
  artist?: string;
  album?: string;
  thumbnail?: string;
  type?: MediaType;
  resolution?: string;
  codec?: string;
  category?: string;
  path?: string;
  waveform?: number[];
  chapters?: Chapter[];
}

// Subtitle Deck types
export interface SubtitleSettings {
  delay: number; // in milliseconds (-5000 to +5000, step 50)
  fontFamily: string;
  sizeMode: "relative" | "precise";
  relativeSize: number; // in % (75 to 200)
  preciseSize: number; // in pt (12 to 48)
  outlineWidth: number; // in px (0 to 8)
  verticalPosition: number; // % from bottom (2 to 40)
  textColor: string;
  backgroundColor: string;
  saveForSeries: boolean;
  selectedTrackId: string | null;
}

// Audio Deck types
export type AudioChannelRouting = "stereo" | "5.1" | "mono" | "left" | "right";
export type EqualizerPresetId =
  | "flat"
  | "bass_boost"
  | "vocal_clarity"
  | "rock"
  | "electronic"
  | "movie"
  | "custom";

export interface AudioSettings {
  selectedTrackId: string | null;
  channelRouting: AudioChannelRouting;
  delay: number; // in milliseconds (-5000 to +5000, step 50)
  equalizerEnabled: boolean;
  equalizerPreset: EqualizerPresetId;
  equalizerBands: number[]; // 10 bands (-12 to +12 dB)
}

// Video Deck types
export type AspectRatioOption = "original" | "16:9" | "4:3" | "21:9" | "1:1" | "fill";

export interface VideoSettings {
  aspectRatio: AspectRatioOption;
  flipHorizontal: boolean;
  flipVertical: boolean;
  rotation: number; // 0, 90, 180, 270 degrees
  zoom: number; // 1.0 to 3.0
  brightness: number; // 50 to 150%
  contrast: number; // 50 to 150%
  gamma: number; // 0.5 to 2.0
  saturation: number; // 0 to 200%
  hue: number; // 0 to 360 deg
}

// Playback Deck types
export type SleepTimerOption = null | 15 | 30 | 45 | 60 | 90 | -1; // -1 = end of video

export interface PlaybackDeckSettings {
  showWaveform: boolean;
  osdNotifications: boolean;
  sleepTimer: SleepTimerOption;
  sleepTimerRemainingSecs: number | null;
}

