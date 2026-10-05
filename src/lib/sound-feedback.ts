"use client";

export type FeedbackSound = "success" | "failure" | "completion" | "partypop";

/**
 * A synthesized acknowledgement triggered from a learner gesture.
 * Synthesizes crisp party-pop snaps, cheerful celebration chimes, and gentle
 * downward failure cues using the native Web Audio API — zero external audio files.
 * Learners can toggle or opt out via localStorage `buildment:sound=off`.
 */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("buildment:sound") !== "off";
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("buildment:sound", enabled ? "on" : "off");
}

const STORED_AUDIO_FILES: Record<FeedbackSound, string> = {
  success: "/sounds/correct.mp3",
  partypop: "/sounds/correct.mp3",
  failure: "/sounds/wrong.mp3",
  completion: "/sounds/correct.mp3",
};

export function playFeedbackSound(effect: FeedbackSound) {
  if (typeof window === "undefined" || !isSoundEnabled()) return;

  // 1. Play stored audio file from public/sounds/
  const fileUrl = STORED_AUDIO_FILES[effect];
  if (fileUrl) {
    try {
      const audio = new Audio(fileUrl);
      audio.volume = effect === "failure" ? 0.7 : 0.85;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser restricts HTML5 Audio, fall back to synthesized AudioContext
          playSynthesizedSound(effect);
        });
        return;
      }
    } catch {
      // Fallback
    }
  }

  playSynthesizedSound(effect);
}

function playSynthesizedSound(effect: FeedbackSound) {
  try {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    void context.resume();
    const now = context.currentTime;
    const master = context.createGain();
    master.gain.value = 0.75;
    master.connect(context.destination);

    // Party-pop physical snap: realistic acoustic "pop" transient
    if (effect === "success" || effect === "partypop") {
      // 1. Fast transient pitch-drop pop
      const popOsc = context.createOscillator();
      const popGain = context.createGain();
      popOsc.type = "triangle";
      popOsc.frequency.setValueAtTime(360, now);
      popOsc.frequency.exponentialRampToValueAtTime(55, now + 0.055);
      popGain.gain.setValueAtTime(0.35, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
      popOsc.connect(popGain).connect(master);
      popOsc.start(now);
      popOsc.stop(now + 0.06);

      // 2. High snap click
      const snapOsc = context.createOscillator();
      const snapGain = context.createGain();
      snapOsc.type = "sine";
      snapOsc.frequency.setValueAtTime(1400, now);
      snapOsc.frequency.exponentialRampToValueAtTime(200, now + 0.025);
      snapGain.gain.setValueAtTime(0.2, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      snapOsc.connect(snapGain).connect(master);
      snapOsc.start(now);
      snapOsc.stop(now + 0.03);
    }

    const melody =
      effect === "success" || effect === "partypop"
        // Upbeat bright celebration arpeggio with high celebratory chime
        ? [
            { hz: 523.25, at: 0.04, length: 0.14 }, // C5
            { hz: 659.25, at: 0.11, length: 0.16 }, // E5
            { hz: 783.99, at: 0.18, length: 0.22 }, // G5
            { hz: 1046.5, at: 0.26, length: 0.38 }, // C6 (high triumphant note)
          ]
        : effect === "completion"
          ? [
              { hz: 392.0, at: 0, length: 0.18 },
              { hz: 523.25, at: 0.08, length: 0.2 },
              { hz: 659.25, at: 0.16, length: 0.25 },
              { hz: 783.99, at: 0.25, length: 0.48 },
              { hz: 1046.5, at: 0.36, length: 0.6 },
            ]
          // Friendly gentle downward cue: soft boop, encouraging another try
          : [
              { hz: 349.23, at: 0, length: 0.14 }, // F4
              { hz: 261.63, at: 0.11, length: 0.22 }, // C4
            ];

    melody.forEach(({ hz, at, length }, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + at;

      oscillator.type = effect === "failure" ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(hz, start);

      if (effect === "failure") {
        // Gentle downward pitch glide for the failure boop
        oscillator.frequency.exponentialRampToValueAtTime(hz * 0.92, start + length);
      }

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(
        effect === "failure" ? 0.045 : effect === "completion" ? 0.055 : 0.045,
        start + 0.015
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
      oscillator.connect(gain).connect(master);
      oscillator.start(start);
      oscillator.stop(start + length + 0.02);

      // Warm octave shimmer on high triumphant notes
      if (effect !== "failure" && index >= melody.length - 2) {
        const shimmer = context.createOscillator();
        const shimmerGain = context.createGain();
        shimmer.type = "sine";
        shimmer.frequency.setValueAtTime(hz * 2, start + 0.02);
        shimmerGain.gain.setValueAtTime(0.0001, start + 0.02);
        shimmerGain.gain.exponentialRampToValueAtTime(0.015, start + 0.05);
        shimmerGain.gain.exponentialRampToValueAtTime(0.0001, start + length);
        shimmer.connect(shimmerGain).connect(master);
        shimmer.start(start + 0.02);
        shimmer.stop(start + length + 0.02);
      }
    });

    window.setTimeout(() => void context.close(), 1_500);
  } catch {
    // Sound is enhancement only.
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
