"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api-client";

export type StudyClockStatus = "idle" | "running" | "paused";
export type StudyPauseReason = "manual" | "inactive" | "hidden" | null;

const HEARTBEAT_MS = 15_000;
const INACTIVITY_MS = 2 * 60_000;

type SessionPayload = {
  status?: StudyClockStatus;
  activeSeconds?: number;
  chapterTimeSpentSeconds?: number;
  creditedSeconds?: number;
  sessionActiveSeconds?: number | null;
};

function tabIsVisible(): boolean {
  if (typeof document === "undefined") return false;
  return document.visibilityState === "visible";
}

async function postSession(
  chapterId: string,
  action: "start" | "pause" | "resume" | "end",
  deltaSeconds?: number,
  keepalive = false
): Promise<SessionPayload | null> {
  try {
    return await apiFetch<SessionPayload>("/api/v1/progress/session", {
      method: "POST",
      json: {
        chapterId,
        action,
        ...(deltaSeconds && deltaSeconds > 0 ? { deltaSeconds: Math.min(deltaSeconds, 20) } : {}),
      },
      keepalive,
    });
  } catch (error) {
    if (error instanceof ApiError) console.error("Study timer request failed", error.status);
    return null;
  }
}

export function useStudySession(chapterId: string) {
  const [status, setStatus] = useState<StudyClockStatus>("idle");
  const [syncedSession, setSyncedSession] = useState(0);
  const [syncedChapter, setSyncedChapter] = useState(0);
  const [pendingSeconds, setPendingSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [pauseReason, setPauseReason] = useState<StudyPauseReason>(null);

  const [previousChapterId, setPreviousChapterId] = useState(chapterId);
  if (chapterId !== previousChapterId) {
    setPreviousChapterId(chapterId);
    setStatus("idle");
    setSyncedSession(0);
    setSyncedChapter(0);
    setPendingSeconds(0);
    setPauseReason(null);
  }

  const statusRef = useRef<StudyClockStatus>("idle");
  const busyRef = useRef(false);
  const pendingRef = useRef(0);
  const chapterRef = useRef(chapterId);
  const requestEpoch = useRef(0);
  const lastActivityAt = useRef(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const apply = useCallback((data: SessionPayload | null, keepPending = false) => {
    if (!data) return;
    if (data.status) setStatus(data.status);
    if (typeof data.activeSeconds === "number") setSyncedSession(data.activeSeconds);
    if (typeof data.chapterTimeSpentSeconds === "number") {
      setSyncedChapter(data.chapterTimeSpentSeconds);
    }
    if (!keepPending) {
      pendingRef.current = 0;
      setPendingSeconds(0);
    }
  }, []);

  const flushDelta = useCallback(() => {
    const sent = pendingRef.current;
    pendingRef.current = 0;
    setPendingSeconds(0);
    return sent;
  }, []);

  useEffect(() => {
    chapterRef.current = chapterId;
    const epoch = ++requestEpoch.current;
    statusRef.current = "idle";
    pendingRef.current = 0;

    void (async () => {
      try {
        const data = await apiFetch<SessionPayload>(`/api/v1/progress/session?chapterId=${encodeURIComponent(chapterId)}`);
        if (requestEpoch.current !== epoch) return;
        apply(data);
        if ((data.status ?? "idle") === "idle" && tabIsVisible() && requestEpoch.current === epoch) {
          const started = await postSession(chapterId, "start");
          if (requestEpoch.current !== epoch) return;
          apply(started);
        }
      } catch {
        /* leave the clock idle */
      }
    })();

    return () => {
      const leaving = chapterRef.current;
      const current = statusRef.current;
      if (current === "idle") return;
      const delta = current === "running" ? pendingRef.current : 0;
      pendingRef.current = 0;
      void postSession(leaving, "end", delta, true);
    };
  }, [chapterId, apply]);

  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => {
      if (!tabIsVisible()) return;
      pendingRef.current += 1;
      setPendingSeconds(pendingRef.current);
    }, 1000);
    return () => window.clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== "running") return;

    const beat = async () => {
      if (!tabIsVisible()) return;
      const sent = flushDelta();
      if (sent <= 0) return;
      try {
        const data = await apiFetch<SessionPayload>("/api/v1/progress/heartbeat", {
          method: "POST",
          json: { chapterId: chapterRef.current, deltaSeconds: Math.min(sent, 20) },
        });
        if (typeof data.sessionActiveSeconds === "number") {
          setSyncedSession(data.sessionActiveSeconds);
        }
        if (typeof data.chapterTimeSpentSeconds === "number") {
          setSyncedChapter(data.chapterTimeSpentSeconds);
        }
      } catch {
        pendingRef.current += sent;
        setPendingSeconds(pendingRef.current);
      }
    };

    const id = window.setInterval(() => void beat(), 15_000);
    return () => window.clearInterval(id);
  }, [status, flushDelta]);

  useEffect(() => {
    const onHide = () => {
      if (statusRef.current !== "running") return;
      setPauseReason("hidden");
      const sent = pendingRef.current;
      pendingRef.current = 0;
      setPendingSeconds(0);
      setStatus("paused");
      statusRef.current = "paused";
      void postSession(chapterRef.current, "pause", sent, true);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onHide);
    };
  }, [apply]);

  const run = useCallback(
    async (action: "start" | "pause" | "resume" | "end", reason?: StudyPauseReason) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      requestEpoch.current += 1;
      const delta = action === "pause" || action === "end" ? flushDelta() : 0;
      const data = await postSession(chapterRef.current, action, delta);
      apply(data);
      if (action === "start" || action === "resume") {
        lastActivityAt.current = Date.now();
        setPauseReason(null);
      } else if (action === "pause") {
        setPauseReason(reason ?? "manual");
      } else if (action === "end") {
        setPauseReason(null);
      }
      busyRef.current = false;
      setBusy(false);
    },
    [apply, flushDelta]
  );

  useEffect(() => {
    if (status !== "running") return;
    lastActivityAt.current = Date.now();
    const onActivity = () => {
      if (document.visibilityState === "visible") lastActivityAt.current = Date.now();
    };
    const events: (keyof DocumentEventMap)[] = ["pointerdown", "keydown", "scroll", "input", "touchstart"];
    for (const event of events) document.addEventListener(event, onActivity, { capture: true, passive: true });
    const inactivityCheck = window.setInterval(() => {
      if (Date.now() - lastActivityAt.current >= INACTIVITY_MS) {
        void run("pause", "inactive");
      }
    }, HEARTBEAT_MS);
    return () => {
      window.clearInterval(inactivityCheck);
      for (const event of events) document.removeEventListener(event, onActivity, true);
    };
  }, [status, run]);

  return {
    status,
    busy,
    pauseReason,
    sessionSeconds: syncedSession + pendingSeconds,
    chapterTotalSeconds: syncedChapter + pendingSeconds,
    start: () => void run("start"),
    pause: () => void run("pause", "manual"),
    resume: () => void run("resume"),
    stop: () => void run("end"),
  };
}
