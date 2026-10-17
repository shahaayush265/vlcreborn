import { SubtitleCue, Track } from "../types/player";
import { parseSubtitle, guessLanguageFromFilename } from "./subtitleParser";

export interface DiscoveredSubtitleTrack extends Track<"subtitle"> {
  path?: string;
  filename: string;
  format: string;
  sizeBytes?: number;
  cues?: SubtitleCue[];
}

/**
 * Checks if the Tauri IPC runtime is available.
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
}

/**
 * Dynamically invokes Tauri command if running in Tauri, otherwise returns null.
 */
async function invokeTauri<T>(cmd: string, args: Record<string, unknown>): Promise<T | null> {
  if (!isTauriEnvironment()) return null;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(cmd, args);
  } catch (err) {
    console.warn(`[TauriBridge] Failed to invoke command "${cmd}":`, err);
    return null;
  }
}

/**
 * Scans the directory containing the media file for matching subtitles.
 * Falls back to demo/local presets if in browser environment.
 */
export async function scanSubtitlesForMedia(
  mediaSrc: string,
  mediaTitle: string
): Promise<DiscoveredSubtitleTrack[]> {
  // If Tauri desktop environment:
  if (isTauriEnvironment() && mediaSrc && !mediaSrc.startsWith("blob:") && !mediaSrc.startsWith("http")) {
    try {
      const results = await invokeTauri<
        Array<{
          id: string;
          path: string;
          filename: string;
          label: string;
          language?: string;
          format: string;
          size_bytes: number;
        }>
      >("scan_subtitles_for_file", { videoPath: mediaSrc });

      if (results && results.length > 0) {
        return results.map((r, i) => ({
          id: r.id || `sub-scanned-${i}`,
          label: r.label,
          language: r.language,
          selected: i === 0,
          type: "subtitle",
          path: r.path,
          filename: r.filename,
          format: r.format,
          sizeBytes: r.size_bytes,
        }));
      }
    } catch (e) {
      console.warn("Tauri subtitle scanning failed:", e);
    }
  }

  // If in browser or demo sample:
  if (mediaTitle.includes("demo-sample") || mediaSrc.includes("demo-sample")) {
    return [
      {
        id: "demo-en",
        label: "Track 1: English (.SRT)",
        language: "en",
        selected: true,
        type: "subtitle",
        path: "/demo-sample.en.srt",
        filename: "demo-sample.en.srt",
        format: "srt",
      },
      {
        id: "demo-es",
        label: "Track 2: Español (.SRT)",
        language: "es",
        selected: false,
        type: "subtitle",
        path: "/demo-sample.es.srt",
        filename: "demo-sample.es.srt",
        format: "srt",
      },
      {
        id: "demo-ja",
        label: "Track 3: 日本語 (.VTT)",
        language: "ja",
        selected: false,
        type: "subtitle",
        path: "/demo-sample.ja.vtt",
        filename: "demo-sample.ja.vtt",
        format: "vtt",
      },
    ];
  }

  return [];
}

/**
 * Loads and parses subtitle cues for a given discovered track.
 */
export async function loadSubtitleTrackContent(
  track: DiscoveredSubtitleTrack
): Promise<SubtitleCue[]> {
  // If track already cached its parsed cues:
  if (track.cues && track.cues.length > 0) {
    return track.cues;
  }

  // If Tauri path:
  if (isTauriEnvironment() && track.path && !track.path.startsWith("/")) {
    try {
      const content = await invokeTauri<string>("read_subtitle_file", { filePath: track.path });
      if (content) {
        const cues = parseSubtitle(content);
        track.cues = cues;
        return cues;
      }
    } catch (e) {
      console.warn("Failed reading subtitle file via Tauri:", e);
    }
  }

  // If public or web URL:
  if (track.path && (track.path.startsWith("/") || track.path.startsWith("http"))) {
    try {
      const res = await fetch(track.path);
      if (res.ok) {
        const text = await res.text();
        const cues = parseSubtitle(text);
        track.cues = cues;
        return cues;
      }
    } catch (e) {
      console.warn("Failed fetching subtitle URL:", e);
    }
  }

  return [];
}

/**
 * Imports a user-selected or dropped subtitle File into the player
 */
export async function importSubtitleFile(file: File): Promise<{
  track: DiscoveredSubtitleTrack;
  cues: SubtitleCue[];
}> {
  const content = await file.text();
  const cues = parseSubtitle(content);
  const { label, language } = guessLanguageFromFilename(file.name);
  const format = file.name.split(".").pop()?.toLowerCase() || "srt";

  const track: DiscoveredSubtitleTrack = {
    id: `custom-sub-${Date.now()}`,
    label: `${label} (${file.name})`,
    language,
    selected: true,
    type: "subtitle",
    filename: file.name,
    format,
    sizeBytes: file.size,
    cues,
  };

  return { track, cues };
}
