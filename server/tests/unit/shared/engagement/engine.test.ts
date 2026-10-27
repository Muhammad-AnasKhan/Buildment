import { describe, expect, it, vi } from "vitest";
import type { RecordedEngagementEvent, TrackEventRequest, TrackEventResult } from "../../../../src/shared/api/engagement.js";
import { createEngagementEngine, memoryStore, type MascotReaction } from "../../../../src/shared/engagement/engine.js";
import { MASCOTS } from "../../../../src/shared/engagement/mascots.js";
import { messageEventFor } from "../../../../src/shared/engagement/messages.js";

const recorded = (partial: Partial<RecordedEngagementEvent> & Pick<RecordedEngagementEvent, "type">) =>
  ({ id: "evt", courseId: null, chapterId: "chapter", isNew: true, createdAt: "", payload: {}, ...partial }) as RecordedEngagementEvent;

function setup(events: RecordedEngagementEvent[] | (() => RecordedEngagementEvent[]), overrides: { reading?: boolean } = {}) {
  let clock = 1_000_000;
  const presented: MascotReaction[] = [];
  const requests: TrackEventRequest[] = [];
  const onError = vi.fn();
  const engine = createEngagementEngine({
    platform: "web",
    transport: async (request): Promise<TrackEventResult> => {
      requests.push(request);
      return { events: typeof events === "function" ? events() : events };
    },
    present: (reaction) => presented.push(reaction),
    storage: memoryStore(),
    now: () => clock,
    isReading: () => overrides.reading ?? false,
    onError,
  });
  return { engine, presented, requests, onError, advance: (ms: number) => (clock += ms) };
}

describe("engagement engine", () => {
  it("reports the event with the platform and shows the reaction the rules pick", async () => {
    const { engine, presented, requests } = setup([recorded({ type: "chapter_completed" })]);
    const reaction = await engine.track({ type: "chapter_completed", chapterId: "chapter" });

    expect(requests).toEqual([{ type: "chapter_completed", chapterId: "chapter", platform: "web" }]);
    expect(reaction).toMatchObject({ ruleId: "chapter-completed", mascotId: "zip", state: "celebrate" });
    expect(reaction?.asset.image).toBe("/mascots/zip/celebrate.svg");
    expect(presented).toEqual([reaction]);
  });

  it("varies its line and never says the same one twice in a row", async () => {
    const engine = createEngagementEngine({
      platform: "web",
      transport: async () => ({ events: [recorded({ type: "chapter_completed" })] }),
      present: () => undefined,
      random: () => 0,
    });
    const lines = [];
    for (let i = 0; i < 4; i += 1) lines.push((await engine.track({ type: "chapter_completed", chapterId: "c" }))?.message);
    expect(lines[0]).toBe("Chapter complete. Nice work!");
    for (let i = 1; i < lines.length; i += 1) expect(lines[i]).not.toBe(lines[i - 1]);
  });

  it("names the recorded clip of the exact line it picked", async () => {
    const engine = createEngagementEngine({
      platform: "web",
      transport: async () => ({ events: [recorded({ type: "chapter_completed" })] }),
      present: () => undefined,
      random: () => 0.5,
    });
    const reaction = await engine.track({ type: "chapter_completed", chapterId: "c" });
    expect(reaction).toMatchObject({ message: "Another chapter done. You're on a roll!", voice: "zip/chapter-completed-1" });
  });

  it("leaves the voice out for a mascot without recorded clips", async () => {
    const { voiced: _voiced, ...silent } = MASCOTS.bimo!;
    const engine = createEngagementEngine({
      platform: "web",
      transport: async () => ({ events: [recorded({ type: "chapter_completed" })] }),
      present: () => undefined,
      registry: { bimo: silent },
      roleMap: { guide: "bimo", celebrator: "bimo", helper: "bimo", supporter: "bimo", messenger: "bimo" },
    });
    const reaction = await engine.track({ type: "chapter_completed", chapterId: "c" });
    expect(reaction?.message).toBeTruthy();
    expect(reaction).not.toHaveProperty("voice");
  });

  it("tells the player which live rig and expression to draw", async () => {
    const { engine } = setup([recorded({ type: "quiz_submitted", payload: { passed: false, attempt: 2, score: 0 } })]);
    const reaction = await engine.track({ type: "quiz_submitted", chapterId: "chapter" });
    expect(reaction).toMatchObject({
      rig: "pip",
      state: "help",
      asset: { expression: { arms: "point", prop: "bulb", opening: { eyes: "look-up", mouth: "hmm" } } },
    });
  });

  it("casts by the page area the client reports, then by the rule's own mascot", async () => {
    const owl = { id: "owl", name: "Owl", states: { idle: { image: "/mascots/owl/idle.svg", alt: "Owl" }, celebrate: { image: "/mascots/owl/celebrate.svg", alt: "Owl cheering" } } };
    const engine = (area: "chapter" | "checkout", mascot?: string) =>
      createEngagementEngine({
        platform: "web",
        transport: async () => ({ events: [recorded({ type: "chapter_completed" })] }),
        present: () => undefined,
        area: () => area,
        registry: { bimo: { id: "bimo", name: "Bimo", states: { idle: owl.states.idle, celebrate: owl.states.celebrate } }, owl },
        areaMap: { checkout: "owl" },
        rules: [{ id: "chapter-completed", priority: 1, role: "celebrator", state: "celebrate", messages: ["Done!"], mascot, matches: () => true }],
      });

    expect(await engine("checkout").track({ type: "chapter_completed" })).toMatchObject({ mascotId: "owl", mascotName: "Owl" });
    expect(await engine("chapter").track({ type: "chapter_completed" })).toMatchObject({ mascotId: "bimo" });
    expect(await engine("chapter", "owl").track({ type: "chapter_completed" })).toMatchObject({ mascotId: "owl" });
  });

  it("carries the XP a moment earned, and celebrates a new level above the chapter", async () => {
    const engine = createEngagementEngine({
      platform: "web",
      transport: async () => ({
        events: [recorded({ type: "chapter_completed" }), recorded({ type: "level_up", payload: { level: 3 } })],
        rewards: { xp: 20 },
      }),
      present: () => undefined,
    });
    expect(await engine.track({ type: "chapter_completed", chapterId: "chapter" })).toMatchObject({ ruleId: "level-up", xp: 20, state: "level_up" });

    const noXp = createEngagementEngine({
      platform: "web",
      transport: async () => ({ events: [recorded({ type: "chapter_completed" })] }),
      present: () => undefined,
    });
    expect(await noXp.track({ type: "chapter_completed", chapterId: "chapter" })).not.toHaveProperty("xp");
  });

  it("congratulates a met weekly goal, mentioning the freeze only when one was earned", async () => {
    const goal = (freezeEarned: boolean) =>
      createEngagementEngine({
        platform: "web",
        transport: async () => ({ events: [recorded({ type: "weekly_goal_met", payload: { freezeEarned } })] }),
        present: () => undefined,
      }).track({ type: "session_start" });
    expect(await goal(true)).toMatchObject({ ruleId: "weekly-goal-met-with-freeze" });
    expect(await goal(false)).toMatchObject({ ruleId: "weekly-goal-met" });
  });

  it("hands the bubble the action of the event that matched", async () => {
    const { engine } = setup([recorded({ type: "chapter_lingering" })]);
    expect(await engine.track({ type: "chapter_lingering", chapterId: "chapter" })).toMatchObject({
      mascotId: "pip",
      state: "stuck",
      action: { label: "Ask a mentor", intent: "ask-help" },
    });
  });

  it("reacts to a live message locally, without reporting it", () => {
    const { engine, presented, requests } = setup([]);
    const item = {
      id: "n1",
      type: "review.feedback",
      category: "activity",
      title: "Your mentor approved your submission",
      body: "",
      url: "/courses/c/ch",
      courseId: "c",
      readAt: null,
      createdAt: "",
      verdict: "APPROVED",
    } as const;
    const reaction = engine.react([messageEventFor(item)!]);
    expect(reaction).toMatchObject({
      ruleId: "message-approved",
      mascotId: "dot",
      state: "message_good",
      action: { label: "Open", href: "/courses/c/ch" },
      voice: expect.stringMatching(/^dot\/message-approved-\d$/),
    });
    expect(presented).toEqual([reaction]);
    expect(requests).toEqual([]);
    expect(messageEventFor({ ...item, type: "study.reminder" })).toBeNull();
    expect(messageEventFor({ ...item, verdict: undefined })?.payload).toEqual({ kind: "feedback", url: "/courses/c/ch" });
  });

  it("shows nothing for a moment the server had already recorded", async () => {
    const { engine, presented } = setup([recorded({ type: "enrolled", isNew: false })]);
    expect(await engine.track({ type: "enrolled", courseId: "course" })).toBeNull();
    expect(presented).toEqual([]);
  });

  it("holds the note reaction for ten minutes", async () => {
    const { engine, presented, advance } = setup([recorded({ type: "notes_saved" })]);
    await engine.track({ type: "notes_saved", chapterId: "chapter" });
    advance(9 * 60_000);
    await engine.track({ type: "notes_saved", chapterId: "chapter" });
    advance(2 * 60_000);
    await engine.track({ type: "notes_saved", chapterId: "chapter" });
    expect(presented.map((reaction) => reaction.ruleId)).toEqual(["notes-saved", "notes-saved"]);
  });

  it("keeps ambient reactions off reading pages but still shows ones the learner caused", async () => {
    const welcome = setup([recorded({ type: "session_start", payload: { daysAway: 4 } })], { reading: true });
    expect(await welcome.engine.track({ type: "session_start" })).toBeNull();

    const quiz = setup([recorded({ type: "quiz_submitted", payload: { passed: false, attempt: 1, score: 40 } })], { reading: true });
    expect(await quiz.engine.track({ type: "quiz_submitted", chapterId: "chapter" })).toMatchObject({ state: "retry" });
  });

  it("never throws when the transport, the rules data or the presenter fail", async () => {
    const offline = createEngagementEngine({
      platform: "web",
      transport: () => Promise.reject(new Error("offline")),
      present: () => undefined,
      onError: () => {
        throw new Error("reporter broke too");
      },
    });
    await expect(offline.track({ type: "session_start" })).resolves.toBeNull();

    const garbage = setup(() => {
      throw new Error("bad payload");
    });
    await expect(garbage.engine.track({ type: "session_start" })).resolves.toBeNull();
    expect(garbage.onError).toHaveBeenCalledOnce();

    const brokenUi = createEngagementEngine({
      platform: "web",
      transport: async () => ({ events: [recorded({ type: "enrolled" })] }),
      present: () => {
        throw new Error("render failed");
      },
    });
    await expect(brokenUi.track({ type: "enrolled", courseId: "course" })).resolves.toBeNull();
  });
});
