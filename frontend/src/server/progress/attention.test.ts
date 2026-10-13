import { describe, expect, it } from "vitest";
import { closedWrongCheckpoints, mentorReplyUnread } from "./attention";

describe("mentorReplyUnread", () => {
  const menteeId = "learner";
  const reply = { authorId: "mentor", createdAt: new Date("2026-10-05T10:00:00Z") };

  it("is unread when a mentor reply has not been opened", () => {
    expect(mentorReplyUnread({ menteeId, menteeLastReadAt: null, latestMessage: reply })).toBe(true);
  });

  it("stays read when the learner wrote the latest message", () => {
    expect(
      mentorReplyUnread({
        menteeId,
        menteeLastReadAt: null,
        latestMessage: { authorId: menteeId, createdAt: reply.createdAt },
      }),
    ).toBe(false);
  });

  it("becomes unread again when a reply arrives after the last open", () => {
    expect(
      mentorReplyUnread({
        menteeId,
        menteeLastReadAt: new Date("2026-10-05T09:00:00Z"),
        latestMessage: reply,
      }),
    ).toBe(true);
    expect(
      mentorReplyUnread({
        menteeId,
        menteeLastReadAt: new Date("2026-10-05T11:00:00Z"),
        latestMessage: reply,
      }),
    ).toBe(false);
  });
});

describe("closedWrongCheckpoints", () => {
  const chapter = { slug: "cart", title: "Cart", course: { slug: "market", title: "Market" } };

  it("keeps a wrong answer only when retry is off", () => {
    const rows = closedWrongCheckpoints([
      { blockId: "retry", attempt: 1, isCorrect: false, block: { type: "QUIZ", config: { allowRetry: true }, chapter } },
      { blockId: "closed", attempt: 1, isCorrect: false, block: { type: "PREDICT", config: { allowRetry: false }, chapter } },
      { blockId: "closed", attempt: 2, isCorrect: true, block: { type: "PREDICT", config: { allowRetry: false }, chapter } },
    ]);
    expect(rows.map((row) => row.blockId)).toEqual([]);
  });

  it("lists the latest no-retry miss", () => {
    const rows = closedWrongCheckpoints([
      { blockId: "closed", attempt: 2, isCorrect: false, block: { type: "CODE", config: { allowRetry: false }, chapter } },
      { blockId: "closed", attempt: 1, isCorrect: false, block: { type: "CODE", config: { allowRetry: false }, chapter } },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.attempt).toBe(2);
  });
});
