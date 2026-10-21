import { INTEGRITY_LIMITS, isIntegrityFlag, type IntegrityEventInput, type IntegrityEventType } from "@/shared/api/integrity";

// Pure pieces of the quiz integrity hook, kept free of the DOM so they can be
// unit tested: key combos, the reading-time check and the offline-safe queue.

type KeyLike = { key: string; code?: string; metaKey: boolean; shiftKey: boolean; ctrlKey?: boolean };

/**
 * Names the screenshot shortcut a key event belongs to, or null. The web can only
 * notice these keys (and often not even that: the OS may swallow them first). It
 * can never block a screenshot.
 */
export function screenshotCombo(event: KeyLike): string | null {
  if (event.key === "PrintScreen" || event.code === "PrintScreen") return "PrintScreen";
  if (!event.metaKey || !event.shiftKey) return null;
  const key = event.key.toLowerCase();
  if (key === "s" || event.code === "KeyS") return "Win+Shift+S";
  for (const digit of ["3", "4", "5"]) {
    if (key === digit || event.code === `Digit${digit}`) return `Cmd+Shift+${digit}`;
  }
  return null;
}

/** ESL readers on phones: assume a slow, careful pace so honest learners are never flagged. */
const WORDS_PER_MINUTE = 180;
const MS_PER_QUESTION = 2_000;
/** Flag only when answers came in under this share of the expected time. */
const FAST_SHARE = 0.35;

export function expectedReadingMs(words: number, questions: number): number {
  return Math.round((words / WORDS_PER_MINUTE) * 60_000 + questions * MS_PER_QUESTION);
}

export function isFastAnswer(elapsedMs: number, words: number, questions: number): boolean {
  if (questions <= 0 || words <= 0) return false;
  return elapsedMs < expectedReadingMs(words, questions) * FAST_SHARE;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function newEventId(): string {
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export type QueuedEvent = IntegrityEventInput & { attemptId: string };

type Storage = Pick<globalThis.Storage, "getItem" | "setItem" | "removeItem">;

/** Events wait here until the server confirms them, and survive reloads and power cuts. */
export class IntegrityQueue {
  private items: QueuedEvent[] = [];
  private static readonly MAX_ITEMS = INTEGRITY_LIMITS.eventsPerAttempt + 100;

  constructor(
    private readonly storageKey: string,
    private readonly storage: Storage | null,
  ) {
    try {
      const saved = storage?.getItem(storageKey);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) this.items = parsed.filter(isQueuedEvent);
    } catch {
      this.items = [];
    }
  }

  get size(): number {
    return this.items.length;
  }

  pendingFlags(attemptId: string): number {
    return this.items.filter((item) => item.attemptId === attemptId && isIntegrityFlag(item.type)).length;
  }

  add(attemptId: string, type: IntegrityEventType, extra: Pick<IntegrityEventInput, "blockId" | "meta"> = {}, at = new Date()): QueuedEvent {
    const event: QueuedEvent = { attemptId, id: newEventId(), type, at: at.toISOString(), ...extra };
    this.items.push(event);
    if (this.items.length > IntegrityQueue.MAX_ITEMS) this.items.splice(0, this.items.length - IntegrityQueue.MAX_ITEMS);
    this.save();
    return event;
  }

  /** The oldest events of one attempt, at most one batch. */
  nextBatch(): { attemptId: string; events: IntegrityEventInput[] } | null {
    const first = this.items[0];
    if (!first) return null;
    const events = this.items
      .filter((item) => item.attemptId === first.attemptId)
      .slice(0, INTEGRITY_LIMITS.eventsPerBatch)
      .map(({ attemptId: _attemptId, ...event }) => event);
    return { attemptId: first.attemptId, events };
  }

  /** Removes events the server stored (or refused for good). */
  ack(ids: Iterable<string>): void {
    const done = new Set(ids);
    this.items = this.items.filter((item) => !done.has(item.id));
    this.save();
  }

  dropAttempt(attemptId: string): void {
    this.items = this.items.filter((item) => item.attemptId !== attemptId);
    this.save();
  }

  private save(): void {
    try {
      if (this.items.length) this.storage?.setItem(this.storageKey, JSON.stringify(this.items));
      else this.storage?.removeItem(this.storageKey);
    } catch {
      // Storage can be full or blocked; the in-memory queue still works.
    }
  }
}

function isQueuedEvent(value: unknown): value is QueuedEvent {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.attemptId === "string" && typeof item.id === "string" && typeof item.type === "string" && typeof item.at === "string";
}
