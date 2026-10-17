import { useEffect, useRef } from "react";
import { usePlayerStore } from "../stores/usePlayerStore";

const FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export function useAudioEngine(videoElement: HTMLVideoElement | null) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const boostGainRef = useRef<GainNode | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  const { audioSettings, volume } = usePlayerStore();
  const { delay, equalizerEnabled, equalizerBands } = audioSettings;

  // Initialize Web Audio graph
  useEffect(() => {
    if (!videoElement || isInitializedRef.current) return;

    const setupAudio = () => {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaElementSource(videoElement);
        sourceRef.current = source;

        // Delay node (max 5.0s)
        const delayNode = ctx.createDelay(5.0);
        delayNode.delayTime.value = Math.max(0, delay / 1000);
        delayNodeRef.current = delayNode;

        // 10 Biquad Filters for Equalizer
        const filters = FREQUENCIES.map((freq, i) => {
          const filter = ctx.createBiquadFilter();
          if (i === 0) {
            filter.type = "lowshelf";
          } else if (i === FREQUENCIES.length - 1) {
            filter.type = "highshelf";
          } else {
            filter.type = "peaking";
            filter.Q.value = 1.4;
          }
          filter.frequency.value = freq;
          filter.gain.value = equalizerEnabled ? equalizerBands[i] || 0 : 0;
          return filter;
        });
        filtersRef.current = filters;

        // Boost gain node for volume > 100%
        const boostGain = ctx.createGain();
        boostGain.gain.value = volume > 1.0 ? volume : 1.0;
        boostGainRef.current = boostGain;

        // Chain nodes: source -> delay -> filters[0..9] -> boostGain -> destination
        let lastNode: AudioNode = source;
        lastNode.connect(delayNode);
        lastNode = delayNode;

        filters.forEach((f) => {
          lastNode.connect(f);
          lastNode = f;
        });

        lastNode.connect(boostGain);
        boostGain.connect(ctx.destination);

        isInitializedRef.current = true;
      } catch (err) {
        // Fallback for CORS or autoplay policies without halting playback
        console.info("Web Audio Engine initialized in fallback mode:", err);
      }
    };

    const handleUserInteraction = () => {
      if (!isInitializedRef.current) {
        setupAudio();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
    };

    videoElement.addEventListener("play", handleUserInteraction);
    window.addEventListener("click", handleUserInteraction, { once: true });

    return () => {
      videoElement.removeEventListener("play", handleUserInteraction);
      window.removeEventListener("click", handleUserInteraction);
    };
  }, [videoElement, delay, equalizerBands, equalizerEnabled, volume]);

  // Update audio delay
  useEffect(() => {
    if (delayNodeRef.current && audioCtxRef.current) {
      const targetSeconds = Math.max(0, delay / 1000);
      delayNodeRef.current.delayTime.setTargetAtTime(
        targetSeconds,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [delay]);

  // Update equalizer band gains
  useEffect(() => {
    if (filtersRef.current.length === 10 && audioCtxRef.current) {
      filtersRef.current.forEach((filter, i) => {
        const targetGain = equalizerEnabled ? equalizerBands[i] || 0 : 0;
        filter.gain.setTargetAtTime(
          targetGain,
          audioCtxRef.current!.currentTime,
          0.05
        );
      });
    }
  }, [equalizerEnabled, equalizerBands]);

  // Update volume boost node
  useEffect(() => {
    if (boostGainRef.current && audioCtxRef.current) {
      const targetGain = volume > 1.0 ? volume : 1.0;
      boostGainRef.current.gain.setTargetAtTime(
        targetGain,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [volume]);
}
