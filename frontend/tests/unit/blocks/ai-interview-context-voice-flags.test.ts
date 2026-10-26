import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AiInterviewView, type AiInterviewViewProps } from "@buildment/learning-ui/blocks/ai-interview/AiInterviewView";
import type { AiInterviewSessionView } from "@/shared/api/ai";
import type { SanitizedAiInterviewConfig } from "@/shared/blocks/ai-interview/schema";

// The speech hook reads the browser; each test decides whether it is "supported".
const speech = vi.hoisted(() => ({ supported: false, listening: false }));
vi.mock("@/lib/use-speech-input", () => ({
  useSpeechInput: () => ({ supported: speech.supported, listening: speech.listening, error: null, toggle: () => {} }),
}));

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

const RESUME = "Five years at Acme Payments leading the retry service and the checkout API.";
const WORK = "My best project: a payment retry service. I wrote the queue and the backoff rules.";
const START_DISABLED = /<button[^>]*disabled=""[^>]*>[^<]*Start interview/;

describe("resume and important work", () => {
  const both = { ...config, context: "resume-and-project" as const };

  it("shows two labelled boxes, each with its own cap", () => {
    const html = render({ config: both });
    expect(html).toContain("Your resume");
    expect(html).toContain("Your important work");
    expect(html).toContain('id="ai-interview-context"');
    expect(html).toContain('id="ai-interview-contextWork"');
    expect(html).toContain("0 / 6,000");
    expect(html).toContain("0 / 4,000");
  });

  it("keeps Start disabled until both boxes are filled", () => {
    expect(render({ config: both, contextDrafts: { context: RESUME, contextWork: "" } })).toMatch(START_DISABLED);
    expect(render({ config: both, contextDrafts: { context: "", contextWork: WORK } })).toMatch(START_DISABLED);
    expect(render({ config: both, contextDrafts: { context: RESUME, contextWork: WORK } })).not.toMatch(START_DISABLED);
  });

  it("warns when the work box goes over its own cap", () => {
    const html = render({ config: both, contextDrafts: { context: RESUME, contextWork: "w".repeat(4001) } });
    expect(html).toContain("4,001 / 4,000");
    expect(html).toMatch(START_DISABLED);
  });

  it("still shows one box for resume or project, and none for none", () => {
    const resume = render({ config: { ...config, context: "resume" } });
    expect(resume).toContain("Your resume");
    expect(resume).not.toContain("Your important work");
    expect(render({ config: { ...config, context: "project" } })).toContain("Your project");
    expect(render({ config })).not.toContain("ai-interview-context");
  });
});

describe("speech input in the answer box", () => {
  it("offers a microphone when the browser supports speech, and typing still works", () => {
    speech.supported = true;
    try {
      const html = render({ session: session() });
      expect(html).toContain('aria-label="Dictate answer with microphone"');
      expect(html).toContain("<textarea");
      expect(html).toContain('aria-label="Your answer"');
      expect(html).toContain("Finish and get feedback");
    } finally {
      speech.supported = false;
    }
  });

  it("tells the learner to type when speech is not available, and still shows the box", () => {
    const html = render({ session: session() });
    expect(html).not.toContain("Dictate answer with microphone");
    expect(html).toContain("Speech input is not available in this browser. Type your answer.");
    expect(html).toContain("<textarea");
  });

  it("shows that it is listening", () => {
    speech.supported = true;
    speech.listening = true;
    try {
      expect(render({ session: session() })).toContain("Listening");
    } finally {
      speech.supported = false;
      speech.listening = false;
    }
  });

  it("does not add a microphone to the pasted boxes", () => {
    speech.supported = true;
    try {
      expect(render({ config: { ...config, context: "resume-and-project" } })).not.toContain("Dictate answer with microphone");
    } finally {
      speech.supported = false;
    }
  });

  it("keeps the transcript as plain text turns", () => {
    const html = render({ session: session() });
    expect(html).toContain("I built the retry service.");
    expect(html).not.toContain("<audio");
  });
});

describe("named flags in the feedback card", () => {
  const finishedWith = (flags: NonNullable<AiInterviewSessionView["feedback"]>["flags"]) =>
    session({
      status: "FINISHED",
      canFinish: false,
      feedback: {
        strengths: ["You told a clear story."],
        weaknesses: [{ point: "Show where the number came from.", fix: "Say how you counted." }],
        focusNotes: [],
        nextSteps: ["a", "b", "c"],
        flags,
      },
    });

  it("shows each flag with its human label and the learner's own words", () => {
    const html = render({
      session: finishedWith([
        { name: "vague-ownership", quote: "We did a lot of it." },
        { name: "unsupported-number", quote: "It got 90 percent faster." },
        { name: "pseudo-story", quote: "It was a journey." },
        { name: "invented-reason-risk", quote: "Because the CEO liked it." },
        { name: "jargon-without-explanation", quote: "We used CQRS." },
      ]),
    });
    expect(html).toContain("Things to watch");
    for (const label of ["Vague ownership", "Unsupported number", "Pseudo-story", "Invented reason risk", "Jargon without explanation"]) {
      expect(html).toContain(label);
    }
    for (const quote of ["We did a lot of it.", "It got 90 percent faster.", "It was a journey.", "Because the CEO liked it.", "We used CQRS."]) {
      expect(html).toContain(quote);
    }
    expect(html).not.toContain("vague-ownership");
  });

  it("leaves the section out when there are no flags", () => {
    expect(render({ session: finishedWith([]) })).not.toContain("Things to watch");
  });

  it("shows strengths first, then what to do better, then flags, then the next steps", () => {
    const html = render({ session: finishedWith([{ name: "pseudo-story", quote: "It was a journey." }]) });
    expect(html.indexOf("Strengths to build on")).toBeLessThan(html.indexOf("What to do better"));
    expect(html.indexOf("What to do better")).toBeLessThan(html.indexOf("Things to watch"));
    expect(html.indexOf("Things to watch")).toBeLessThan(html.indexOf("Your next three steps"));
  });

  it("escapes the learner's quote", () => {
    const html = render({ session: finishedWith([{ name: "pseudo-story", quote: "<img src=x onerror=alert(1)>" }]) });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
  });
});
