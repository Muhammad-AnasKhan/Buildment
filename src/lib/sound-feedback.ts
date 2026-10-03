"use client";

export type FeedbackSound = "success" | "failure" | "completion";

/**
 * A tiny synthesized acknowledgement, triggered only from a learner gesture.
 * This avoids shipping audio files and silently degrades when browser audio is
 * unavailable. Learners can opt out with localStorage `buildment:sound=off`.
 */
export function playFeedbackSound(effect: FeedbackSound) {
  if (typeof window === "undefined" || localStorage.getItem("buildment:sound") === "off") return;
  try {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    void context.resume();
    const now = context.currentTime;
    const master = context.createGain();
    master.gain.value = 0.72;
    master.connect(context.destination);

    const melody = effect === "success"
      // A bright, restrained C-major acknowledgement.
      ? [{ hz: 523.25, at: 0, length: 0.16 }, { hz: 659.25, at: 0.075, length: 0.18 }, { hz: 783.99, at: 0.15, length: 0.3 }]
      // A fuller upward cadence for completing an entire chapter.
      : effect === "completion"
        ? [{ hz: 392, at: 0, length: 0.18 }, { hz: 523.25, at: 0.08, length: 0.2 }, { hz: 659.25, at: 0.16, length: 0.25 }, { hz: 783.99, at: 0.25, length: 0.48 }]
        // Gentle downward cue: not an alarm and not a punishment.
        : [{ hz: 392, at: 0, length: 0.16 }, { hz: 329.63, at: 0.105, length: 0.25 }];

    melody.forEach(({ hz, at, length }, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + at;
      oscillator.type = effect === "failure" ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(hz, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(effect === "completion" ? 0.048 : 0.04, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
      oscillator.connect(gain).connect(master);
      oscillator.start(start);
      oscillator.stop(start + length + 0.02);

      // A very quiet octave shimmer on the last upward note gives the chime
      // character without making it sharp or game-like.
      if (effect !== "failure" && index === melody.length - 1) {
        const shimmer = context.createOscillator();
        const shimmerGain = context.createGain();
        shimmer.type = "sine";
        shimmer.frequency.setValueAtTime(hz * 2, start + 0.025);
        shimmerGain.gain.setValueAtTime(0.0001, start + 0.025);
        shimmerGain.gain.exponentialRampToValueAtTime(0.012, start + 0.05);
        shimmerGain.gain.exponentialRampToValueAtTime(0.0001, start + length);
        shimmer.connect(shimmerGain).connect(master);
        shimmer.start(start + 0.025);
        shimmer.stop(start + length + 0.02);
      }
    });
    window.setTimeout(() => void context.close(), 1_200);
  } catch {
    // Sound is enhancement only.
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
