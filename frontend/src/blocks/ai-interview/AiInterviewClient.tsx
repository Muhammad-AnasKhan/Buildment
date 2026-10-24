"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api-client";
import { playFeedback } from "@/lib/sound-feedback";
import type { AiInterviewInitialState, AiInterviewSessionResult, AiInterviewSessionView } from "@/shared/api/ai";
import type { SanitizedAiInterviewConfig } from "@/shared/blocks/ai-interview/schema";
import { AiInterviewView, type InterviewBusy } from "./AiInterviewView";
import { friendlyError } from "./interview-model";

// Owns the network calls and the drafts for one interview block. Everything it
// shows comes from the API; the learner's key is never in the browser.

export function AiInterviewClient({
  id,
  config,
  initialState,
}: {
  id: string;
  config: SanitizedAiInterviewConfig;
  initialState: AiInterviewInitialState;
}) {
  const router = useRouter();
  const [session, setSession] = useState<AiInterviewSessionView | null>(initialState.session);
  const [hasKey, setHasKey] = useState(initialState.hasKey);
  const [contextDraft, setContextDraft] = useState(initialState.session?.context ?? "");
  const [answerDraft, setAnswerDraft] = useState("");
  const [busy, setBusy] = useState<InterviewBusy>(null);
  const [error, setError] = useState<string | null>(null);

  const base = `/api/v1/blocks/${encodeURIComponent(id)}/ai-interview`;

  async function call(kind: Exclude<InterviewBusy, null>, path: string, json: unknown): Promise<AiInterviewSessionView | null> {
    setBusy(kind);
    setError(null);
    try {
      const result = await apiFetch<AiInterviewSessionResult>(`${base}/${path}`, { method: "POST", json });
      return result.session;
    } catch (err) {
      playFeedback("error");
      if (err instanceof ApiError && err.code === "AI_KEY_REQUIRED") setHasKey(false);
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
      playFeedback("success");
      router.refresh();
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
