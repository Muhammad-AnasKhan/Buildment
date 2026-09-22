"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StudyClockStatus = "idle" | "running" | "paused";

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
    const res = await fetch("/api/progress/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterId,
        action,
        ...(deltaSeconds && deltaSeconds > 0 ? { deltaSeconds: Math.min(deltaSeconds, 20) } : {}),
      }),
      keepalive,
    });
    if (!res.ok) {
      console.error("Study timer request failed", res.status);
      return null;
    }
    return (await res.json()) as SessionPayload;
  } catch {
    return null;
  }
}

export function useStudySession(chapterId: string) {
  const [status, setStatus] = useState<StudyClockStatus>("idle");
  const [syncedSession, setSyncedSession] = useState(0);
  const [syncedChapter, setSyncedChapter] = useState(0);
  const [pendingSeconds, setPendingSeconds] = useState(0);
  const [busy, setBusy] = useState(false);

  const statusRef = useRef<StudyClockStatus>("idle");
  const pendingRef = useRef(0);
  const chapterRef = useRef(chapterId);
  const requestEpoch = useRef(0);

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
    setStatus("idle");
    setSyncedSession(0);
    setSyncedChapter(0);
    pendingRef.current = 0;
    setPendingSeconds(0);

    void (async () => {
      try {
        const res = await fetch(`/api/progress/session?chapterId=${encodeURIComponent(chapterId)}`);
        if (!res.ok || requestEpoch.current !== epoch) return;
        apply((await res.json()) as SessionPayload);
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
        const res = await fetch("/api/progress/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chapterId: chapterRef.current, deltaSeconds: Math.min(sent, 20) }),
        });
        if (!res.ok) {
          pendingRef.current += sent;
          setPendingSeconds(pendingRef.current);
          return;
        }
        const data = (await res.json()) as SessionPayload;
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
      const sent = pendingRef.current;
      if (sent <= 0) return;
      pendingRef.current = 0;
      setPendingSeconds(0);
      void fetch("/api/progress/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: chapterRef.current,
          deltaSeconds: Math.min(sent, 20),
        }),
        keepalive: true,
      });
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  const run = useCallback(
    async (action: "start" | "pause" | "resume" | "end") => {
      setBusy(true);
      requestEpoch.current += 1;
      const delta = action === "pause" || action === "end" ? flushDelta() : 0;
      const data = await postSession(chapterRef.current, action, delta);
      apply(data);
      setBusy(false);
    },
    [apply, flushDelta]
  );

  return {
    status,
    busy,
    sessionSeconds: syncedSession + pendingSeconds,
    chapterTotalSeconds: syncedChapter + pendingSeconds,
    start: () => void run("start"),
    pause: () => void run("pause"),
    resume: () => void run("resume"),
    stop: () => void run("end"),
  };
}
