const STORAGE_KEY = "vlcreborn_watch_history";

export interface WatchHistoryEntry {
  mediaId: string;
  position: number;
  duration: number;
  updatedAt: number;
}

export function getWatchHistory(): Record<string, WatchHistoryEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveWatchProgress(mediaId: string, position: number, duration: number): void {
  if (!mediaId || isNaN(position) || isNaN(duration)) return;
  // Only save meaningful progress (>10s and not within final 10s of media)
  if (position < 10 || position > duration - 10) {
    if (position > duration - 10) {
      // Completed, remove from history so it doesn't prompt resume
      clearWatchProgress(mediaId);
    }
    return;
  }

  try {
    const history = getWatchHistory();
    history[mediaId] = {
      mediaId,
      position: Math.floor(position),
      duration: Math.floor(duration),
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export function getSavedProgress(mediaId: string): WatchHistoryEntry | null {
  if (!mediaId) return null;
  const history = getWatchHistory();
  const entry = history[mediaId];
  if (!entry) return null;

  // Validate that position is still valid (>10s and < 95% of duration)
  if (entry.position > 10 && (!entry.duration || entry.position < entry.duration * 0.95)) {
    return entry;
  }
  return null;
}

export function clearWatchProgress(mediaId: string): void {
  try {
    const history = getWatchHistory();
    delete history[mediaId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}
