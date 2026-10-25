"use client";

import { useState } from "react";
import type { AiInterviewInitialState, AiInterviewSessionView } from "../../shared/api/ai";
import type { SanitizedAiInterviewConfig } from "../../shared/blocks/ai-interview/schema";
import { AiInterviewView, type InterviewBusy } from "./AiInterviewView";
import { friendlyError } from "./interview-model";

// Owns the network calls and the drafts for one interview block. Everything it
// shows comes from the API; the learner's key is never in the browser.

export function AiInterviewClient({
  config,
  initialState,
  request,
  onComplete,
}: {
  config: SanitizedAiInterviewConfig;
  initialState: AiInterviewInitialState;
  request: (action: "start" | "answer" | "finish" | "abandon", json: unknown) => Promise<AiInterviewSessionView>;
  onComplete?: () => void;
}) {
  const [session, setSession] = useState<AiInterviewSessionView | null>(initialState.session);
  const [hasKey, setHasKey] = useState(initialState.hasKey);
  const [contextDraft, setContextDraft] = useState(initialState.session?.context ?? "");
  const [answerDraft, setAnswerDraft] = useState("");
  const [busy, setBusy] = useState<InterviewBusy>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(kind: Exclude<InterviewBusy, null>, path: string, json: unknown): Promise<AiInterviewSessionView | null> {
    setBusy(kind);
    setError(null);
    try {
      return await request(path as "start" | "answer" | "finish" | "abandon", json);
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "AI_KEY_REQUIRED") setHasKey(false);
      setError(friendlyError(err));
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function start() {
    const next = await call("starting", "start", { context: config.context === "none" ? null : contextDraft });
    if (next) {
      setSession(next);
      setAnswerDraft("");
    }
  }

  async function send() {
    if (!session) return;
    const next = await call("answering", "answer", { sessionId: session.id, answer: answerDraft.trim() });
    if (next) {
      setSession(next);
      setAnswerDraft("");
    }
  }

  async function finish() {
    if (!session) return;
    const next = await call("finishing", "finish", { sessionId: session.id });
    if (next) {
      setSession(next);
      onComplete?.();
    }
  }

  async function startOver() {
    if (!session) return;
    if (typeof window !== "undefined" && !window.confirm("Start over? This conversation will be discarded.")) return;
    const next = await call("starting", "abandon", { sessionId: session.id });
    if (next) {
      setSession(null);
      setAnswerDraft("");
    }
  }

  return (
    <AiInterviewView
      config={config}
      configured={initialState.configured}
      hasKey={hasKey}
      session={session}
      contextDraft={contextDraft}
      answerDraft={answerDraft}
      busy={busy}
      error={error}
      onContextChange={setContextDraft}
      onAnswerChange={setAnswerDraft}
      onStart={start}
      onSend={send}
      onFinish={finish}
      onStartOver={startOver}
      onPracticeAgain={() => {
        setSession(null);
        setError(null);
      }}
    />
  );
}
