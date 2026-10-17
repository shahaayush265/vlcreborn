import { SubtitleCue } from "../types/player";

/**
 * Robust, millisecond-accurate Subtitle Parser & Serializer
 * Supports SubRip (.srt) and WebVTT (.vtt) formats.
 */

/**
 * Parses timestamp string into floating-point seconds.
 * Supports:
 * - 00:01:23,456 (SRT)
 * - 00:01:23.456 (VTT)
 * - 01:23.456 (VTT short)
 * - 1:23:45.678
 */
export function parseTimestamp(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace(",", ".");
  const parts = clean.split(":");

  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  } else if (parts.length === 1) {
    return parseFloat(parts[0]) || 0;
  }
  return 0;
}

/**
 * Formats seconds into SRT timestamp string (HH:MM:SS,mmm)
 */
export function formatSrtTimestamp(seconds: number): string {
  const safeSec = Math.max(0, seconds);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const millis = Math.floor((safeSec % 1) * 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${millis
    .toString()
    .padStart(3, "0")}`;
}

/**
 * Formats seconds into WebVTT timestamp string (HH:MM:SS.mmm)
 */
export function formatVttTimestamp(seconds: number): string {
  const safeSec = Math.max(0, seconds);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const millis = Math.floor((safeSec % 1) * 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${millis
    .toString()
    .padStart(3, "0")}`;
}

/**
 * Strips unsupported or heavy HTML tags while preserving text formatting.
 */
function cleanSubtitleText(raw: string): string {
  return raw
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/<(?!\/?(i|b|u)\b)[^>]+>/gi, "") // preserve <i>, <b>, <u>
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

/**
 * Native parser for SubRip (.srt) files
 */
export function parseSrt(content: string): SubtitleCue[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/^\uFEFF/, "");
  // Split cues by double (or more) newlines
  const blocks = normalized.split(/\n\s*\n/);
  const cues: SubtitleCue[] = [];

  const timestampRegex = /(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3}|\d{1,2}:\d{2}[,\.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3}|\d{1,2}:\d{2}[,\.]\d{1,3})/;

  for (let i = 0; i < blocks.length; i++) {
    const lines = blocks[i].trim().split("\n");
    if (lines.length < 2) continue;

    let timeLineIndex = -1;
    let match: RegExpMatchArray | null = null;

    for (let l = 0; l < lines.length; l++) {
      match = lines[l].match(timestampRegex);
      if (match) {
        timeLineIndex = l;
        break;
      }
    }

    if (timeLineIndex === -1 || !match) continue;

    const startTime = parseTimestamp(match[1]);
    const endTime = parseTimestamp(match[2]);

    const textLines = lines.slice(timeLineIndex + 1);
    const text = cleanSubtitleText(textLines.join("\n"));

    if (text.length > 0 && endTime >= startTime) {
      cues.push({
        id: `srt-${i + 1}`,
        startTime,
        endTime,
        text,
      });
    }
  }

  return cues;
}

/**
 * Native parser for WebVTT (.vtt) files
 */
export function parseVtt(content: string): SubtitleCue[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/^\uFEFF/, "");
  const blocks = normalized.split(/\n\s*\n/);
  const cues: SubtitleCue[] = [];

  const timestampRegex = /(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3}|\d{1,2}:\d{2}[,\.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3}|\d{1,2}:\d{2}[,\.]\d{1,3})/;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;
    if (block.startsWith("WEBVTT") || block.startsWith("NOTE") || block.startsWith("STYLE")) {
      continue;
    }

    const lines = block.split("\n");
    let timeLineIndex = -1;
    let match: RegExpMatchArray | null = null;

    for (let l = 0; l < lines.length; l++) {
      match = lines[l].match(timestampRegex);
      if (match) {
        timeLineIndex = l;
        break;
      }
    }

    if (timeLineIndex === -1 || !match) continue;

    const startTime = parseTimestamp(match[1]);
    const endTime = parseTimestamp(match[2]);

    const textLines = lines.slice(timeLineIndex + 1);
    const text = cleanSubtitleText(textLines.join("\n"));

    if (text.length > 0 && endTime >= startTime) {
      cues.push({
        id: `vtt-${cues.length + 1}`,
        startTime,
        endTime,
        text,
      });
    }
  }

  return cues;
}

/**
 * Auto-detects format and parses subtitle content.
 */
export function parseSubtitle(content: string): SubtitleCue[] {
  const trimmed = content.trim().replace(/^\uFEFF/, "");
  if (trimmed.startsWith("WEBVTT")) {
    return parseVtt(trimmed);
  }
  return parseSrt(trimmed);
}

/**
 * Serializes subtitle cues to SRT format, with an optional timing offset applied.
 */
export function exportToSrt(cues: SubtitleCue[], offsetMs = 0): string {
  const offsetSec = offsetMs / 1000;
  return cues
    .map((cue, index) => {
      const start = Math.max(0, cue.startTime + offsetSec);
      const end = Math.max(start + 0.1, cue.endTime + offsetSec);
      return `${index + 1}\n${formatSrtTimestamp(start)} --> ${formatSrtTimestamp(end)}\n${cue.text}\n`;
    })
    .join("\n");
}

/**
 * Serializes subtitle cues to WebVTT format, with an optional timing offset applied.
 */
export function exportToVtt(cues: SubtitleCue[], offsetMs = 0): string {
  const offsetSec = offsetMs / 1000;
  const header = "WEBVTT\n\n";
  const body = cues
    .map((cue, index) => {
      const start = Math.max(0, cue.startTime + offsetSec);
      const end = Math.max(start + 0.1, cue.endTime + offsetSec);
      return `${index + 1}\n${formatVttTimestamp(start)} --> ${formatVttTimestamp(end)}\n${cue.text}\n`;
    })
    .join("\n");
  return header + body;
}

/**
 * Triggers browser download of subtitle file
 */
export function triggerSubtitleDownload(
  cues: SubtitleCue[],
  filename: string,
  offsetMs = 0,
  format: "srt" | "vtt" = "srt"
): void {
  const content = format === "vtt" ? exportToVtt(cues, offsetMs) : exportToSrt(cues, offsetMs);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cleanName = filename.replace(/\.(srt|vtt|ass)$/i, "");
  a.download = `${cleanName}.synced.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Guesses human-readable language and label from a subtitle filename
 */
export function guessLanguageFromFilename(filename: string): { label: string; language: string } {
  const lower = filename.toLowerCase();

  const langMap: Record<string, { label: string; language: string }> = {
    en: { label: "English", language: "en" },
    eng: { label: "English", language: "en" },
    english: { label: "English", language: "en" },
    sdh: { label: "English [SDH]", language: "en" },
    es: { label: "Spanish", language: "es" },
    spa: { label: "Spanish", language: "es" },
    spanish: { label: "Spanish", language: "es" },
    fr: { label: "French", language: "fr" },
    fra: { label: "French", language: "fr" },
    french: { label: "French", language: "fr" },
    de: { label: "German", language: "de" },
    ger: { label: "German", language: "de" },
    german: { label: "German", language: "de" },
    it: { label: "Italian", language: "it" },
    ita: { label: "Italian", language: "it" },
    ja: { label: "Japanese", language: "ja" },
    jpn: { label: "Japanese", language: "ja" },
    japanese: { label: "Japanese", language: "ja" },
    zh: { label: "Chinese", language: "zh" },
    chi: { label: "Chinese", language: "zh" },
    ko: { label: "Korean", language: "ko" },
    kor: { label: "Korean", language: "ko" },
    pt: { label: "Portuguese", language: "pt" },
    por: { label: "Portuguese", language: "pt" },
    ru: { label: "Russian", language: "ru" },
    rus: { label: "Russian", language: "ru" },
    hi: { label: "Hindi", language: "hi" },
    hin: { label: "Hindi", language: "hi" },
  };

  // Check stem tokens (e.g. Movie.2024.en.forced.srt)
  const tokens = lower.split(/[._\-\s]+/);
  for (const token of tokens) {
    if (langMap[token]) {
      return langMap[token];
    }
  }

  // Fallback to filename without extension
  const baseName = filename.replace(/\.[^/.]+$/, "");
  return {
    label: baseName || "Subtitle Track",
    language: "und",
  };
}
