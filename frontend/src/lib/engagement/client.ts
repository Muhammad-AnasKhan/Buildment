import { apiFetch } from "@/lib/api-client";
import type { TrackEventResult } from "@/shared/api/engagement";
import {
  createEngagementEngine,
  type EngagementEngine,
  type EngagementStore,
  type EngagementTrackInput,
  type MascotReaction,
} from "@/shared/engagement/engine";
import { messageEventFor, messageKindFor } from "@/shared/engagement/messages";
import type { NotificationItem } from "@/shared/api/notifications";
import {
  PENDING_ENGAGEMENT_COOKIE,
  isReadingPath,
  pageAreaFor,
  readPendingEngagementCookie,
} from "@/lib/engagement/pending-event";
import { lingeringThresholdMs, startAttentionClock, watchEngagedTime } from "@/lib/engagement/attention";
import { onNotificationToast } from "@/lib/notifications/notification-store";

// The web side of the engagement engine (shared/engagement/engine.ts): the API transport, a
// localStorage-backed cooldown store, and a tiny pub/sub that the one MascotPlayer listens to.
// Components call trackEngagement() after their own action succeeded and never wait on it.

type Listener = (reaction: MascotReaction) => void;

const SESSION_KEY = "buildment:engagement:session";
/** The learning log autosaves while the learner types; one note event a minute per chapter is plenty. */
const NOTES_THROTTLE_MS = 60_000;
const listeners = new Set<Listener>();
const lastNotesSent = new Map<string, number>();
let engine: EngagementEngine | null = null;
/** How many mascot players are announcing live messages (the learn layout mounts one). */
let messengers = 0;

const browserStore: EngagementStore = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Private mode or a full quota: the cooldown just lasts for this page instead.
    }
  },
};

function getEngine(): EngagementEngine {
  engine ??= createEngagementEngine({
    platform: "web",
    transport: (request) => apiFetch<TrackEventResult>("/api/v1/events", { method: "POST", json: request }),
    present: (reaction) => {
      for (const listener of listeners) listener(reaction);
    },
    storage: browserStore,
    isReading: () => isReadingPath(window.location.pathname),
    area: () => pageAreaFor(window.location.pathname),
    onError: (error) => {
      if (process.env.NODE_ENV !== "production") console.debug("[engagement] event not tracked", error);
    },
  });
  return engine;
}

/** Reports a learning moment. Fire-and-forget: it never throws and nothing should await it. */
export function trackEngagement(input: EngagementTrackInput): void {
  if (typeof window === "undefined") return;
  try {
    if (input.type === "notes_saved" && input.chapterId) {
      const now = Date.now();
      if (now - (lastNotesSent.get(input.chapterId) ?? 0) < NOTES_THROTTLE_MS) return;
      lastNotesSent.set(input.chapterId, now);
    }
    void getEngine().track(input);
  } catch {
    // The engine already swallows its own failures; this only guards its construction.
  }
}

export function subscribeToMascotReactions(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * While a mascot player is mounted, the messenger announces the live notifications it has words
 * for (a mentor's reply, review feedback, a resolved question) instead of a toast.
 */
export function announceMessages(): () => void {
  messengers += 1;
  const stop = onNotificationToast((item) => {
    const event = messageEventFor(item);
    if (event) getEngine().react([event]);
  });
  return () => {
    messengers -= 1;
    stop();
  };
}

/** True when the messenger mascot shows this notification, so the toast can stand down. */
export function mascotAnnounces(item: NotificationItem): boolean {
  return messengers > 0 && messageKindFor(item) !== null;
}

/** Counts engaged time for the break suggestion after a long study stretch. */
export function startStudyStretchClock(): () => void {
  return startAttentionClock(() => trackEngagement({ type: "long_session" }));
}

/**
 * Offers a mentor once the learner has spent a long while on this unfinished chapter (see
 * lingeringThresholdMs). Returns a release function for when the chapter unmounts.
 */
export function watchChapterLingering(chapterId: string, estimatedMinutes: number | null | undefined): () => void {
  if (typeof window === "undefined") return () => undefined;
  return watchEngagedTime(lingeringThresholdMs(estimatedMinutes), () => trackEngagement({ type: "chapter_lingering", chapterId }));
}

/** Once per browser tab: reports the session start. */
export function startEngagementSession(): void {
  if (typeof window === "undefined") return;
  try {
    if (!window.sessionStorage.getItem(SESSION_KEY)) {
      window.sessionStorage.setItem(SESSION_KEY, "1");
      trackEngagement({ type: "session_start" });
    }
  } catch {
    // Storage blocked: skip the session event rather than sending one per page.
  }
}

/**
 * Reports a moment a server redirect left behind (see pending-event.ts). Call it on every
 * navigation: a server action's redirect is a client-side navigation, so the mascot player that
 * reads the cookie stays mounted and would otherwise never see it.
 */
export function reportPendingEngagement(): void {
  if (typeof window === "undefined") return;
  const pending = readPendingEngagementCookie(document.cookie);
  if (pending) {
    document.cookie = `${PENDING_ENGAGEMENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
    trackEngagement(pending);
  }
}
