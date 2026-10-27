import {
  APP_HEARTBEAT_INTERVAL_MS,
  APP_HEARTBEAT_MAX_SECONDS,
  type AppHeartbeatResult,
} from "@/shared/api/activity";
import { ApiError, apiFetch } from "@/lib/api-client";

// Overall app activity — estimated active time anywhere in the signed-in app. Separate from the
// chapter study clock (use-study-session.ts), which it never talks to.
//
// Time counts while the tab is visible AND the person is engaged: they interacted in the last two
// minutes (same rule as the study clock), a native video/audio element is playing, or focus sits in
// an embedded player (YouTube/Vimeo iframes swallow events) and they interacted in the last 20.
// Seconds accumulate locally and go to the API about once a minute, and on hide/leave with
// `keepalive`. The server credits only wall-clock time not already credited, so several tabs or a
// retry cannot inflate the total — the client does not need to coordinate tabs.

export const APP_IDLE_MS = 2 * 60_000;
export const APP_EMBED_IDLE_MS = 20 * 60_000;
const TICK_MS = 1_000;
/** A tick later than this (sleep, throttled timers) only counts this much. */
const MAX_TICK_GAP_MS = 2 * TICK_MS;
const MAX_PENDING_MS = APP_HEARTBEAT_MAX_SECONDS * 1000;

export type SendOutcome = "ok" | "retry" | "drop";

export type TrackerEnvironment = {
  now(): number;
  isVisible(): boolean;
  /** "playing" for an audible/visible media element, "embed" when focus is inside an iframe. */
  media(): "playing" | "embed" | null;
  send(activeSeconds: number, beatId: string, keepalive: boolean): Promise<SendOutcome>;
  newBeatId(): string;
};

export class AppActivityTracker {
  private pendingMs = 0;
  private lastInteractionAt: number;
  private lastTickAt: number;

  constructor(private readonly env: TrackerEnvironment) {
    this.lastInteractionAt = env.now();
    this.lastTickAt = env.now();
  }

  get pendingSeconds() {
    return Math.floor(this.pendingMs / 1000);
  }

  /** A meaningful user action: pointer, key, scroll, touch, input, returning to the tab. */
  noteInteraction() {
    this.lastInteractionAt = this.env.now();
  }

  isEngaged(now = this.env.now()): boolean {
    if (!this.env.isVisible()) return false;
    const idleMs = now - this.lastInteractionAt;
    if (idleMs < APP_IDLE_MS) return true;
    const media = this.env.media();
    if (media === "playing") return true;
    return media === "embed" && idleMs < APP_EMBED_IDLE_MS;
  }

  /** Called every second; adds the elapsed slice when the person is engaged. */
  tick() {
    const now = this.env.now();
    const gap = Math.min(Math.max(now - this.lastTickAt, 0), MAX_TICK_GAP_MS);
    this.lastTickAt = now;
    if (this.isEngaged(now)) this.pendingMs = Math.min(this.pendingMs + gap, MAX_PENDING_MS);
  }

  /** Sends whole pending seconds; the remainder and failed sends stay for the next beat. */
  async flush(keepalive = false): Promise<void> {
    const seconds = Math.min(this.pendingSeconds, APP_HEARTBEAT_MAX_SECONDS);
    if (seconds < 1) return;
    this.pendingMs -= seconds * 1000;
    const outcome = await this.env.send(seconds, this.env.newBeatId(), keepalive);
    if (outcome === "retry") {
      this.pendingMs = Math.min(this.pendingMs + seconds * 1000, MAX_PENDING_MS);
    }
  }
}

// --- Browser wiring: one tracker per tab, shared by every layout that mounts it ----------------

const INTERACTION_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "scroll", "touchstart", "input"] as const;

function browserEnvironment(): TrackerEnvironment {
  return {
    now: () => Date.now(),
    isVisible: () => document.visibilityState === "visible",
    media: () => {
      const playing = Array.from(document.querySelectorAll("video, audio")).some(
        (el) => !(el as HTMLMediaElement).paused && !(el as HTMLMediaElement).ended
      );
      if (playing) return "playing";
      return document.activeElement?.tagName === "IFRAME" ? "embed" : null;
    },
    newBeatId: () =>
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`,
    send: async (activeSeconds, beatId, keepalive) => {
      try {
        await apiFetch<AppHeartbeatResult>("/api/v1/activity/heartbeat", {
          method: "POST",
          json: { activeSeconds, beatId },
          keepalive,
        });
        return "ok";
      } catch (error) {
        // Signed out or rejected: the time cannot be attributed. Anything else (network, 429, 5xx) retries.
        if (error instanceof ApiError && [400, 401, 403].includes(error.status)) return "drop";
        return "retry";
      }
    },
  };
}

let running: { stop: () => void } | null = null;
let holders = 0;
let stopTimer: number | undefined;

function start(): { stop: () => void } {
  const tracker = new AppActivityTracker(browserEnvironment());
  const onInteraction = () => tracker.noteInteraction();
  const onVisibility = () => {
    if (document.visibilityState === "visible") tracker.noteInteraction();
    else void tracker.flush(true);
  };
  const onPageHide = () => void tracker.flush(true);

  for (const event of INTERACTION_EVENTS) {
    document.addEventListener(event, onInteraction, { capture: true, passive: true });
  }
  window.addEventListener("focus", onInteraction);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide);
  const tickId = window.setInterval(() => tracker.tick(), TICK_MS);
  const beatId = window.setInterval(() => void tracker.flush(), APP_HEARTBEAT_INTERVAL_MS);

  return {
    stop: () => {
      window.clearInterval(tickId);
      window.clearInterval(beatId);
      for (const event of INTERACTION_EVENTS) document.removeEventListener(event, onInteraction, true);
      window.removeEventListener("focus", onInteraction);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      void tracker.flush(true);
    },
  };
}

/**
 * Starts the tab's tracker (or joins the running one) and returns a release function. Release is
 * deferred briefly so moving between layouts (learn ↔ teach) keeps one tracker and its pending time.
 */
export function acquireAppActivityTracker(): () => void {
  if (stopTimer !== undefined) {
    window.clearTimeout(stopTimer);
    stopTimer = undefined;
  }
  holders += 1;
  running ??= start();

  let released = false;
  return () => {
    if (released) return;
    released = true;
    holders -= 1;
    if (holders > 0) return;
    stopTimer = window.setTimeout(() => {
      stopTimer = undefined;
      running?.stop();
      running = null;
    }, 1_000);
  };
}
