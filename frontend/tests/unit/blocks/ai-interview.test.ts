import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";

// The speech hook reads the browser. Tests decide whether it is supported.
vi.mock("@/lib/use-speech-input", () => ({
  useSpeechInput: () => ({ supported: false, listening: false, error: null, toggle: () => {} }),
}));
import { renderToStaticMarkup } from "react-dom/server";
import { AiInterviewView, type AiInterviewViewProps } from "@buildment/learning-ui/blocks/ai-interview/AiInterviewView";
import {
  AI_SETTINGS_HREF,
  checkAnswer,
  checkContext,
  contextReady,
  friendlyError,
  interviewStage,
  turnCounter,
} from "@buildment/learning-ui/blocks/ai-interview/interview-model";
import type { AiInterviewSessionView } from "@/shared/api/ai";
import type { SanitizedAiInterviewConfig } from "@/shared/blocks/ai-interview/schema";

const config: SanitizedAiInterviewConfig = {
  title: "Payments interview",
  opening: "Tell me about a payment feature you built.",
  focus: ["ownership", "impact"],
  context: "none",
  maxTurns: 10,
  whyDepth: 5,
};

const at = "2026-01-01T00:00:00.000Z";
const session = (patch: Partial<AiInterviewSessionView> = {}): AiInterviewSessionView => ({
  id: "s1",
  status: "ACTIVE",
  context: null,
  contextWork: null,
  transcript: [
    { role: "interviewer", content: "Tell me about a payment feature you built.", focus: "ownership", depth: 0, at },
    { role: "candidate", content: "I built the retry service.", at },
    { role: "interviewer", content: "Why did you choose retries?", focus: "ownership", depth: 1, at },
  ],
  turnCount: 1,
  maxTurns: 10,
  limitReached: false,
  canFinish: true,
  feedback: null,
  startedAt: at,
  finishedAt: null,
  ...patch,
});

const noop = () => {};
function render(patch: Partial<AiInterviewViewProps> = {}) {
  return renderToStaticMarkup(
    createElement(AiInterviewView, {
      config,
      configured: true,
      hasKey: true,
      session: null,
      contextDrafts: { context: "", contextWork: "" },
      answerDraft: "",
      busy: null,
      error: null,
      onContextChange: noop,
      onAnswerChange: noop,
      onStart: noop,
      onSend: noop,
      onFinish: noop,
      onStartOver: noop,
      onPracticeAgain: noop,
      ...patch,
    })
  );
}

describe("interview stage", () => {
  const finished = session({ status: "FINISHED", canFinish: false });
  it("picks the screen from the key state and the latest session", () => {
    expect(interviewStage({ configured: false, hasKey: false, session: null })).toBe("unavailable");
    expect(interviewStage({ configured: true, hasKey: false, session: null })).toBe("no-key");
    expect(interviewStage({ configured: true, hasKey: true, session: null })).toBe("intro");
    expect(interviewStage({ configured: true, hasKey: true, session: session() })).toBe("chat");
    expect(interviewStage({ configured: true, hasKey: true, session: { ...finished, feedback: null } })).toBe("intro");
  });

  it("keeps an active interview visible even if the key was deleted, so nothing is lost on reload", () => {
    expect(interviewStage({ configured: true, hasKey: false, session: session() })).toBe("chat");
  });
});

describe("interview helpers", () => {
  it("counts answers and checks length", () => {
    expect(turnCounter({ turnCount: 3, maxTurns: 10 })).toBe("3 of 10 answers");
    expect(turnCounter({ turnCount: 12, maxTurns: 10 })).toBe("10 of 10 answers");
    expect(checkAnswer("")).toMatchObject({ empty: true, canSend: false });
    expect(checkAnswer("  hi  ")).toMatchObject({ canSend: true });
    expect(checkAnswer("x".repeat(2001))).toMatchObject({ tooLong: true, canSend: false, remaining: -1 });
    expect(checkContext("short").ok).toBe(false);
    expect(checkContext("a".repeat(60)).ok).toBe(true);
    expect(checkContext("a".repeat(4001), 40, 4000).tooLong).toBe(true);
    expect(contextReady("resume-and-project", { context: "a".repeat(60), contextWork: "" })).toBe(false);
    expect(contextReady("resume-and-project", { context: "a".repeat(60), contextWork: "b".repeat(60) })).toBe(true);
    expect(contextReady("none", { context: "", contextWork: "" })).toBe(true);
    expect(checkContext("a".repeat(6001)).tooLong).toBe(true);
  });

  it("shows API messages and hides low level network errors", () => {
    expect(friendlyError(new Error("Your OpenRouter key is out of credit."))).toBe("Your OpenRouter key is out of credit.");
    expect(friendlyError(new TypeError("Failed to fetch"))).toMatch(/could not reach the server/);
    expect(friendlyError("odd")).toMatch(/could not reach the server/);
  });
});

describe("interview block", () => {
  it("says so when the server has no encryption key", () => {
    const html = render({ configured: false, hasKey: false });
    expect(html).toContain("AI interviews are not set up on this server.");
    expect(html).not.toContain("<textarea");
  });

  it("invites the learner to add a key and links to settings when none is saved", () => {
    const html = render({ hasKey: false });
    expect(html).toContain("Add your own OpenRouter key");
    expect(html).toContain(`href="${AI_SETTINGS_HREF}"`);
    expect(html).toContain("Go to settings");
    expect(html).not.toContain("Start interview");
  });

  it("starts without a context box when the block needs none", () => {
    const html = render();
    expect(html).toContain("Start interview");
    expect(html).not.toContain("ai-interview-context");
    expect(html).toContain("up to 10 answers");
  });

  it("shows a context box for a resume and keeps Start disabled until enough is pasted", () => {
    const resume = { ...config, context: "resume" as const };
    const empty = render({ config: resume });
    expect(empty).toContain("Your resume");
    expect(empty).toContain('id="ai-interview-context"');
    expect(empty).toMatch(/<button[^>]*disabled=""[^>]*>[^<]*Start interview/);
    expect(empty).toContain("At least 40 characters");

    const filled = render({ config: resume, contextDrafts: { context: "I built the payment retry service at Acme and cut failed payments.", contextWork: "" } });
    expect(filled).not.toMatch(/<button[^>]*disabled=""[^>]*>[^<]*Start interview/);

    expect(render({ config: { ...config, context: "project" } })).toContain("Your project");
  });

  it("shows the chat with a turn counter, the answer box and Finish and get feedback", () => {
    const html = render({ session: session(), answerDraft: "Because" });
    expect(html).toContain("1 of 10 answers");
    expect(html).toContain("Interviewer");
    expect(html).toContain("Why did you choose retries?");
    expect(html).toContain("I built the retry service.");
    expect(html).toContain("<textarea");
    expect(html).toContain("7 / 2,000");
    expect(html).toContain("Finish and get feedback");
    expect(html).toContain('role="log"');
  });

  it("holds Finish back until the first answer is in", () => {
    const html = render({ session: session({ turnCount: 0, canFinish: false, transcript: session().transcript.slice(0, 1) }) });
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[^<]*Finish and get feedback/);
    expect(html).toContain("Answer at least one question first.");
  });

  it("shows progress while the interviewer is thinking and while feedback is written", () => {
    expect(render({ session: session(), busy: "answering" })).toContain("The interviewer is thinking");
    expect(render({ session: session(), busy: "finishing" })).toContain("Writing your feedback...");
  });

  it("swaps the answer box for a closing note after the last allowed answer", () => {
    const html = render({ session: session({ turnCount: 10, limitReached: true }) });
    expect(html).toContain("That was your last answer.");
    expect(html).not.toContain("<textarea");
    expect(html).toContain("10 of 10 answers");
  });

  it("warns when an answer is over the limit", () => {
    const html = render({ session: session(), answerDraft: "x".repeat(2001) });
    expect(html).toContain("2,001 / 2,000");
    expect(html).toContain('aria-invalid="true"');
  });

  it("shows an error without losing the conversation", () => {
    const html = render({ session: session(), error: "OpenRouter took too long to answer. Please try again." });
    expect(html).toContain('role="alert"');
    expect(html).toContain("OpenRouter took too long");
    expect(html).toContain("Why did you choose retries?");
  });

  it("shows the feedback card with fixes, notes and three next steps", () => {
    const html = render({
      session: session({
        status: "FINISHED",
        canFinish: false,
        feedback: {
          strengths: ["You told a clear story."],
          weaknesses: [{ point: "No numbers.", fix: "Say how many payments you saved." }],
          focusNotes: [{ focus: "ownership", note: "Clear about your own part." }],
          nextSteps: ["Write one impact sentence.", "Practise out loud.", "Ask a friend to ask why."],
          flags: [],
        },
      }),
    });
    expect(html).toContain("Interview finished");
    expect(html).toContain("Strengths to build on");
    expect(html).toContain("What to do better");
    expect(html).not.toContain("Things to watch");
    expect(html).toContain("You told a clear story.");
    expect(html).toContain("Say how many payments you saved.");
    expect(html).toContain("Ownership");
    expect(html).toContain("Clear about your own part.");
    expect(html).toContain("Your next three steps");
    expect(html).toContain("Practise again");
    expect(html).toContain("Read the full conversation");
  });

  it("works at phone width and in both themes by using only fluid layout and theme tokens", () => {
    const html = render({ session: session() });
    expect(html).not.toMatch(/\bw-\[\d+px\]|\bmin-w-\[\d+px\]/);
    expect(html).toContain("bg-card");
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    expect(html).not.toMatch(/\bbg-white\b|\btext-black\b|\bbg-gray-/);
  });

  it("never renders a rubric, whatever is in the config it was given", () => {
    const html = render({ config: { ...config, rubric: "SECRET RUBRIC" } as SanitizedAiInterviewConfig, session: session() });
    expect(html).not.toContain("SECRET RUBRIC");
  });
});
