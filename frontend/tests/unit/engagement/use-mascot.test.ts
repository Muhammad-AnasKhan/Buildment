import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MascotReaction } from "@/shared/engagement/engine";

// No DOM renderer in this suite: React's hooks are stubbed so each effect runs at once and its
// cleanup is kept, which is enough to check what the hooks start and that they stop it again.
const cleanups: Array<() => void> = [];

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useEffect: (effect: () => void | (() => void)) => {
    const cleanup = effect();
    if (typeof cleanup === "function") cleanups.push(cleanup);
  },
  useEffectEvent: <T extends (...args: never[]) => unknown>(callback: T) => callback,
  useRef: <T>(initial: T) => ({ current: initial }),
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

const client = vi.hoisted(() => {
  const stops = { lingering: vi.fn(), messages: vi.fn(), stretch: vi.fn(), unsubscribe: vi.fn() };
  let listener: ((reaction: unknown) => void) | null = null;
  return {
    stops,
    emit: (reaction: unknown) => listener?.(reaction),
    trackEngagement: vi.fn(),
    watchChapterLingering: vi.fn(() => stops.lingering),
    subscribeToMascotReactions: vi.fn((next: (reaction: unknown) => void) => {
      listener = next;
      return stops.unsubscribe;
    }),
    startEngagementSession: vi.fn(),
    announceMessages: vi.fn(() => stops.messages),
    startStudyStretchClock: vi.fn(() => stops.stretch),
    reportPendingEngagement: vi.fn(),
  };
});

vi.mock("@/lib/engagement/client", () => client);

import { useMascot, useMascotReactions } from "@/lib/engagement/use-mascot";
import { requestAskHelp } from "@/lib/engagement/ask-help";

function unmount() {
  while (cleanups.length) cleanups.pop()!();
}

const reaction = { ruleId: "chapter-completed" } as unknown as MascotReaction;

beforeEach(() => {
  vi.stubGlobal("window", new EventTarget());
});

afterEach(() => {
  unmount();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("useMascot", () => {
  it("reports moments through the engagement client", () => {
    const { track } = useMascot();
    track({ type: "notes_saved", chapterId: "ch1" });
    expect(client.trackEngagement).toHaveBeenCalledWith({ type: "notes_saved", chapterId: "ch1" });
  });

  it("returns the same track function on every render", () => {
    expect(useMascot().track).toBe(useMascot().track);
  });

  it("watches a chapter while asked to and stops on unmount", () => {
    useMascot({ watchChapter: { chapterId: "ch1", estimatedMinutes: 12 } });
    expect(client.watchChapterLingering).toHaveBeenCalledWith("ch1", 12);
    unmount();
    expect(client.stops.lingering).toHaveBeenCalledOnce();
  });

  it("watches nothing without a chapter, e.g. once it is complete", () => {
    useMascot({ watchChapter: null });
    useMascot();
    expect(client.watchChapterLingering).not.toHaveBeenCalled();
  });

  it("answers the mascot's ask-help button until unmounted", () => {
    const onAskHelp = vi.fn();
    useMascot({ onAskHelp });
    requestAskHelp();
    expect(onAskHelp).toHaveBeenCalledOnce();
    unmount();
    requestAskHelp();
    expect(onAskHelp).toHaveBeenCalledOnce();
  });

  it("does not listen for ask-help without a handler", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    useMascot();
    expect(addEventListener).not.toHaveBeenCalled();
  });
});

describe("useMascotReactions", () => {
  it("starts the session, messages and study clock, and reports a pending moment", () => {
    useMascotReactions(vi.fn());
    expect(client.subscribeToMascotReactions).toHaveBeenCalledOnce();
    expect(client.startEngagementSession).toHaveBeenCalledOnce();
    expect(client.announceMessages).toHaveBeenCalledOnce();
    expect(client.startStudyStretchClock).toHaveBeenCalledOnce();
    expect(client.reportPendingEngagement).toHaveBeenCalledOnce();
  });

  it("delivers each reaction with an increasing sequence number", () => {
    const onReaction = vi.fn();
    useMascotReactions(onReaction);
    client.emit(reaction);
    client.emit(reaction);
    expect(onReaction.mock.calls).toEqual([
      [reaction, 1],
      [reaction, 2],
    ]);
  });

  it("stops everything it started on unmount", () => {
    useMascotReactions(vi.fn());
    unmount();
    expect(client.stops.unsubscribe).toHaveBeenCalledOnce();
    expect(client.stops.messages).toHaveBeenCalledOnce();
    expect(client.stops.stretch).toHaveBeenCalledOnce();
  });
});
