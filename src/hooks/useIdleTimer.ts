import { useState, useEffect, useRef, useCallback } from "react";

interface UseIdleTimerOptions {
  timeoutMs?: number;
  initialIdle?: boolean;
}

export function useIdleTimer({
  timeoutMs = 2500,
  initialIdle = false,
}: UseIdleTimerOptions = {}) {
  const [isIdle, setIsIdle] = useState<boolean>(initialIdle);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    // Start initial timer
    timerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, timeoutMs);

    const handleActivity = () => {
      resetTimer();
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "pointermove",
      "wheel",
    ] as const;

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer, timeoutMs]);

  return { isIdle, resetTimer };
}
