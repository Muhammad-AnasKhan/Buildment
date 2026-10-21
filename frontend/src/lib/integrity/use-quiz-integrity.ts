"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import {
  INTEGRITY_LIMITS,
  type IntegrityAttemptSession,
  type IntegrityCameraStatus,
  type IntegrityEventType,
  type IntegrityEventsResult,
} from "@/shared/api/integrity";
import { IntegrityQueue, countWords, isFastAnswer, screenshotCombo } from "./signals";

// Quiz integrity signals in the browser. Everything here is best effort and
// never blocks the quiz: a failed request, a missing camera or an unsupported
// API just means fewer notes for the mentor. Events wait in localStorage until
// the server confirms them, so a power cut or a dropped connection loses nothing.

const FLUSH_MS = 10_000;
const REOPEN_MS = 15_000;
const NOTICE_MS = 6_000;
/** Same signal again within this window is one action (key repeat, double events). */
const REPEAT_MS = 1_500;
const MIN_BLUR_MS = 1_000;
const MIN_MOUSE_OUT_MS = 2_000;
const FIRST_SNAPSHOT_MS = 5_000;
/** "Not now" this many times and the full-screen banner stays away for the attempt. */
const FULLSCREEN_DISMISS_LIMIT = 2;

const NOTICE_TEXT: Partial<Record<IntegrityEventType, string>> = {
  TAB_HIDDEN: "You left the quiz tab. Your mentor will see this.",
  WINDOW_BLUR: "You switched to another window. Your mentor will see this.",
  COPY_BLOCKED: "Copy is turned off during this quiz.",
  PASTE_BLOCKED: "Paste is turned off during this quiz. Please type your answer.",
  CONTEXT_MENU_BLOCKED: "Right-click is turned off during this quiz.",
  SCREENSHOT_KEY: "Screenshot keys were noticed. Your mentor will see this.",
  MOUSE_LEFT: "Your mouse left the quiz page.",
  SECOND_SCREEN: "A second screen is connected. Your mentor will see this.",
  FAST_ANSWER: "You answered very fast. Take your time to read each question.",
};

export type IntegrityNotice = { id: number; text: string };

type Pending = { attemptId: string; at: number };

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readPending(key: string): Pending | null {
  try {
    const raw = storage()?.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && typeof (parsed as Pending).attemptId === "string" && typeof (parsed as Pending).at === "number") {
      return parsed as Pending;
    }
  } catch {
    // Treat unreadable storage as nothing pending.
  }
  return null;
}

function writePending(key: string, value: Pending | null) {
  try {
    if (value) storage()?.setItem(key, JSON.stringify(value));
    else storage()?.removeItem(key);
  } catch {
    // Storage is optional.
  }
}

function fullscreenSupported(): boolean {
  return typeof document !== "undefined" && document.fullscreenEnabled === true && typeof document.documentElement.requestFullscreen === "function";
}

/** The reader shell owns focus mode; asking it keeps the layout and full screen in step. */
export function requestQuizFullscreen() {
  window.dispatchEvent(new Event("buildment:quiz-focus"));
}

export function useQuizIntegrity({
  chapterId,
  enabled,
  rootRef,
  currentBlockId,
}: {
  chapterId: string;
  /** False once the quiz is complete: nothing is watched or recorded then. */
  enabled: boolean;
  rootRef: React.RefObject<HTMLElement | null>;
  currentBlockId: string | null;
}) {
  const [session, setSession] = useState<IntegrityAttemptSession | null>(null);
  const [serverFlags, setServerFlags] = useState(0);
  const [pendingFlags, setPendingFlags] = useState(0);
  const [notice, setNotice] = useState<IntegrityNotice | null>(null);
  const [fullscreenPrompt, setFullscreenPrompt] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<IntegrityCameraStatus>("NOT_REQUESTED");
  /** "intro" is the start-of-attempt notice and camera choice; "info" reopens it from the badge. */
  const [dialog, setDialog] = useState<"intro" | "info" | null>(null);

  const queueRef = useRef<IntegrityQueue | null>(null);
  const attemptIdRef = useRef<string | null>(null);
  const finishedRef = useRef(!enabled);
  const blockRef = useRef<string | null>(currentBlockId);
  const lastByType = useRef(new Map<IntegrityEventType, number>());
  const suppressUntil = useRef(0);
  const flushing = useRef(false);
  const blurStart = useRef<number | null>(null);
  const mouseOutStart = useRef<number | null>(null);
  const wasFullscreen = useRef(false);
  const fullscreenDismissals = useRef(0);
  const secondScreenFlagged = useRef(false);
  /** Set from the attempt's start time once it opens. */
  const paceStart = useRef(0);
  const noticeSeq = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const snapshotTimer = useRef<number | null>(null);
  const snapshotInterval = useRef<number | null>(null);
  const cameraStatusRef = useRef<IntegrityCameraStatus>("NOT_REQUESTED");

  const hiddenKey = `buildment:integrity-hidden:${chapterId}`;
  const introKey = (attemptId: string) => `buildment:integrity-started:${attemptId}`;

  useEffect(() => {
    blockRef.current = currentBlockId;
  }, [currentBlockId]);

  const showNotice = useCallback((text: string) => {
    noticeSeq.current += 1;
    setNotice({ id: noticeSeq.current, text });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice((current) => (current?.id === notice.id ? null : current)), NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const refreshPending = useCallback(() => {
    const attemptId = attemptIdRef.current;
    setPendingFlags(attemptId && queueRef.current ? queueRef.current.pendingFlags(attemptId) : 0);
  }, []);

  const flush = useCallback(async (keepalive = false) => {
    const queue = queueRef.current;
    if (!queue || (flushing.current && !keepalive)) return;
    if (!keepalive && typeof navigator !== "undefined" && navigator.onLine === false) return;
    if (!keepalive) flushing.current = true;
    try {
      for (let round = 0; round < 5; round += 1) {
        const batch = queue.nextBatch();
        if (!batch) break;
        const ids = batch.events.map((event) => event.id);
        let response: Response;
        try {
          response = await fetch(`/api/v1/integrity/attempts/${encodeURIComponent(batch.attemptId)}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ events: batch.events }),
            credentials: "same-origin",
            keepalive,
          });
        } catch {
          break; // Offline or the request was cut: try again on the next tick.
        }
        if (response.ok) {
          const body = (await response.json().catch(() => null)) as { data?: IntegrityEventsResult } | null;
          queue.ack(ids);
          if (batch.attemptId === attemptIdRef.current && typeof body?.data?.flagCount === "number") setServerFlags(body.data.flagCount);
        } else if ([400, 403, 404].includes(response.status)) {
          queue.ack(ids); // The server will never take these; do not retry forever.
        } else {
          break; // 429 or 5xx: keep them for later.
        }
        if (keepalive) break;
      }
    } finally {
      if (!keepalive) flushing.current = false;
      refreshPending();
    }
  }, [refreshPending]);

  const record = useCallback(
    (type: IntegrityEventType, meta?: Record<string, string | number | boolean>, options: { at?: Date; attemptId?: string; quiet?: boolean } = {}) => {
      const attemptId = options.attemptId ?? attemptIdRef.current;
      const queue = queueRef.current;
      if (!queue || !attemptId) return;
      if (!options.attemptId && finishedRef.current) return;
      const now = Date.now();
      const last = lastByType.current.get(type);
      if (last && now - last < REPEAT_MS && !options.at) return;
      lastByType.current.set(type, now);
      queue.add(attemptId, type, { blockId: blockRef.current, ...(meta ? { meta } : {}) }, options.at ?? new Date(now));
      refreshPending();
      const text = NOTICE_TEXT[type];
      if (text && !options.quiet) showNotice(text);
    },
    [refreshPending, showNotice],
  );

  // --- Opening the attempt ------------------------------------------------------------------

  const applySession = useCallback((next: IntegrityAttemptSession) => {
    attemptIdRef.current = next.attemptId;
    // A second screen is a state, not an action: note it once per attempt, even across reloads.
    try {
      secondScreenFlagged.current = storage()?.getItem(`buildment:integrity-screen:${next.attemptId}`) === "1";
    } catch {
      secondScreenFlagged.current = false;
    }
    fullscreenDismissals.current = 0;
    paceStart.current = Math.min(Date.parse(next.startedAt) || Date.now(), Date.now());
    setSession(next);
    setServerFlags(next.flagCount);
    refreshPending();
  }, [refreshPending]);

  const openAttempt = useCallback(async () => {
    try {
      return await apiFetch<IntegrityAttemptSession>(`/api/v1/chapters/${encodeURIComponent(chapterId)}/integrity`, { method: "POST" });
    } catch {
      return null;
    }
  }, [chapterId]);

  useEffect(() => {
    if (!enabled) return;
    finishedRef.current = false;
    queueRef.current ??= new IntegrityQueue(`buildment:integrity-queue:${chapterId}`, storage());
    let cancelled = false;
    let retry: number | null = null;

    const open = async () => {
      const next = await openAttempt();
      if (cancelled) return;
      if (!next) {
        retry = window.setTimeout(open, REOPEN_MS);
        return;
      }
      applySession(next);
      // A tab that was hidden when the page died (power cut, killed app) still counts.
      const stale = readPending(hiddenKey);
      if (stale) {
        record("TAB_HIDDEN", { closed: true }, { at: new Date(stale.at), attemptId: stale.attemptId, quiet: true });
        writePending(hiddenKey, null);
      }
      let started = false;
      try {
        started = storage()?.getItem(introKey(next.attemptId)) === "1";
      } catch {
        started = false;
      }
      cameraStatusRef.current = next.camera.status;
      setCameraStatus(next.camera.status);
      if (!started) setDialog("intro");
      void flush();
    };
    void open();
    return () => {
      cancelled = true;
      if (retry) window.clearTimeout(retry);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, chapterId]);

  // --- Camera -------------------------------------------------------------------------------

  const putCamera = useCallback(async (status: Exclude<IntegrityCameraStatus, "NOT_REQUESTED">) => {
    const attemptId = attemptIdRef.current;
    if (!attemptId) return;
    try {
      await apiFetch(`/api/v1/integrity/attempts/${encodeURIComponent(attemptId)}/camera`, { method: "PUT", json: { status } });
    } catch {
      // The status is advisory; the CAMERA_* events tell the same story.
    }
  }, []);

  const stopStream = useCallback(() => {
    if (snapshotTimer.current) window.clearTimeout(snapshotTimer.current);
    if (snapshotInterval.current) window.clearInterval(snapshotInterval.current);
    snapshotTimer.current = null;
    snapshotInterval.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  /** Callback ref for the preview element; snapshots are drawn from it. */
  const attachVideo = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current && element.srcObject !== streamRef.current) {
      element.srcObject = streamRef.current;
      void element.play().catch(() => undefined);
    }
  }, []);

  const setCamera = useCallback((status: IntegrityCameraStatus) => {
    cameraStatusRef.current = status;
    setCameraStatus(status);
  }, []);

  const cameraUnavailable = useCallback((reason: string) => {
    stopStream();
    if (cameraStatusRef.current === "UNAVAILABLE") return;
    setCamera("UNAVAILABLE");
    void putCamera("UNAVAILABLE");
    record("CAMERA_OFF", { reason }, { quiet: true });
    showNotice("Your camera is off. You can keep going with the quiz.");
  }, [putCamera, record, setCamera, showNotice, stopStream]);

  const uploadSnapshot = useCallback(async () => {
    const attemptId = attemptIdRef.current;
    const video = videoRef.current;
    const track = streamRef.current?.getVideoTracks()[0];
    if (!attemptId || !video || !track || track.readyState !== "live") return;
    if (document.visibilityState === "hidden" || navigator.onLine === false) return;
    if (video.readyState < 2 || !video.videoWidth) return;

    const { snapshotWidth: width, snapshotHeight: height, snapshotMaxBytes } = INTEGRITY_LIMITS;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;
    // Cover-crop to 4:3 so every still is the same small size.
    const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
    const drawWidth = video.videoWidth * scale;
    const drawHeight = video.videoHeight * scale;
    context.drawImage(video, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    const toJpeg = (quality: number) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    let blob = await toJpeg(0.55);
    if (blob && blob.size > snapshotMaxBytes) blob = await toJpeg(0.3);
    if (!blob || blob.size > snapshotMaxBytes) return;
    try {
      await fetch(`/api/v1/integrity/attempts/${encodeURIComponent(attemptId)}/snapshots`, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
        credentials: "same-origin",
      });
    } catch {
      // A missed still is fine; the next one is a minute away.
    }
  }, []);

  const scheduleSnapshots = useCallback(() => {
    if (snapshotTimer.current) window.clearTimeout(snapshotTimer.current);
    if (snapshotInterval.current) window.clearInterval(snapshotInterval.current);
    const intervalMs = (session?.camera.intervalSeconds ?? INTEGRITY_LIMITS.snapshotIntervalSeconds) * 1000;
    snapshotTimer.current = window.setTimeout(() => {
      void uploadSnapshot();
      snapshotInterval.current = window.setInterval(() => void uploadSnapshot(), intervalMs);
    }, FIRST_SNAPSHOT_MS);
  }, [session?.camera.intervalSeconds, uploadSnapshot]);

  const startCamera = useCallback(async () => {
    if (!session?.camera.enabled || finishedRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraUnavailable("unsupported");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 5, max: 10 }, facingMode: "user" },
        audio: false,
      });
    } catch (error) {
      const name = error instanceof Error ? error.name : "";
      cameraUnavailable(name === "NotAllowedError" ? "denied" : name === "NotFoundError" ? "no-camera" : "error");
      return;
    }
    stopStream();
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play().catch(() => undefined);
    }
    stream.getVideoTracks()[0]?.addEventListener("ended", () => cameraUnavailable("stopped"));
    setCamera("ON");
    void putCamera("ON");
    record("CAMERA_ON", undefined, { quiet: true });
    scheduleSnapshots();
  }, [cameraUnavailable, putCamera, record, scheduleSnapshots, session?.camera.enabled, setCamera, stopStream]);

  const declineCamera = useCallback((reason: "declined" | "learner") => {
    stopStream();
    if (!session?.camera.enabled) return;
    setCamera("DECLINED");
    void putCamera("DECLINED");
    record("CAMERA_OFF", { reason }, { quiet: true });
  }, [putCamera, record, session?.camera.enabled, setCamera, stopStream]);

  // Resume the camera after a reload when the learner had already said yes.
  useEffect(() => {
    if (!session || dialog === "intro" || streamRef.current || finishedRef.current) return;
    if (session.camera.enabled && cameraStatusRef.current === "ON") void startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.attemptId, dialog]);

  useEffect(() => () => stopStream(), [stopStream]);

  /** Closes the intro. `withCamera` is the learner's consent choice. */
  const begin = useCallback((withCamera: boolean) => {
    const attemptId = attemptIdRef.current;
    if (attemptId) {
      try {
        storage()?.setItem(introKey(attemptId), "1");
      } catch {
        // Then the intro shows again on reload, which is harmless.
      }
    }
    setDialog(null);
    if (fullscreenSupported() && !document.fullscreenElement) requestQuizFullscreen();
    if (!session?.camera.enabled) return;
    if (withCamera) void startCamera();
    else if (cameraStatusRef.current !== "DECLINED") declineCamera("declined");
  }, [declineCamera, session?.camera.enabled, startCamera]);

  // --- Browser signals ----------------------------------------------------------------------

  useEffect(() => {
    if (!enabled || !session) return;
    const root = rootRef.current;

    const flagHiddenReturn = () => {
      const pending = readPending(hiddenKey);
      if (!pending) return;
      writePending(hiddenKey, null);
      record("TAB_HIDDEN", { awayMs: Date.now() - pending.at }, { at: new Date(pending.at), attemptId: pending.attemptId });
    };

    const onVisibility = () => {
      if (finishedRef.current) return;
      if (document.visibilityState === "hidden") {
        blurStart.current = null;
        mouseOutStart.current = null;
        if (attemptIdRef.current) writePending(hiddenKey, { attemptId: attemptIdRef.current, at: Date.now() });
        void flush(true);
      } else {
        flagHiddenReturn();
        void flush();
      }
    };

    const onPageHide = () => {
      const pending = readPending(hiddenKey);
      if (pending) {
        writePending(hiddenKey, null);
        record("TAB_HIDDEN", { awayMs: Date.now() - pending.at, closed: true }, { at: new Date(pending.at), attemptId: pending.attemptId, quiet: true });
      }
      void flush(true);
    };

    const onBlur = () => {
      const at = Date.now();
      // Let visibilitychange land first: a hidden tab is already its own signal.
      window.setTimeout(() => {
        if (document.visibilityState === "hidden" || at < suppressUntil.current) return;
        if (document.activeElement instanceof HTMLIFrameElement) return; // Focus moved into an embed on the page.
        blurStart.current = at;
      }, 250);
    };

    const onFocus = () => {
      const start = blurStart.current;
      blurStart.current = null;
      if (start === null || document.visibilityState === "hidden") return;
      const awayMs = Date.now() - start;
      if (awayMs >= MIN_BLUR_MS && start >= suppressUntil.current) record("WINDOW_BLUR", { awayMs }, { at: new Date(start) });
    };

    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        wasFullscreen.current = true;
        setFullscreenPrompt(false);
        return;
      }
      if (!wasFullscreen.current || finishedRef.current) return;
      wasFullscreen.current = false;
      record("FULLSCREEN_EXIT", undefined, { quiet: true });
      if (fullscreenSupported() && fullscreenDismissals.current < FULLSCREEN_DISMISS_LIMIT) setFullscreenPrompt(true);
    };

    const block = (type: IntegrityEventType) => (event: Event) => {
      if (finishedRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      record(type);
    };
    const onCopy = block("COPY_BLOCKED");
    const onPaste = block("PASTE_BLOCKED");
    const onContextMenu = block("CONTEXT_MENU_BLOCKED");
    const onDrop = (event: DragEvent) => {
      if (finishedRef.current || !event.dataTransfer?.types.includes("text/plain")) return;
      event.preventDefault();
      event.stopPropagation();
      record("PASTE_BLOCKED", { via: "drop" });
    };

    const onKey = (event: KeyboardEvent) => {
      const combo = screenshotCombo(event);
      if (combo) record("SCREENSHOT_KEY", { combo });
    };

    const finePointer = window.matchMedia?.("(pointer: fine)").matches ?? false;
    const onMouseLeave = () => {
      if (document.visibilityState === "visible") mouseOutStart.current = Date.now();
    };
    const onMouseEnter = () => {
      const start = mouseOutStart.current;
      mouseOutStart.current = null;
      if (start === null || blurStart.current !== null) return;
      const outMs = Date.now() - start;
      if (outMs >= MIN_MOUSE_OUT_MS) record("MOUSE_LEFT", { outMs }, { at: new Date(start), quiet: true });
    };

    // Window Management API (Chromium): one bit, no permission prompt.
    const screenInfo = window.screen as Screen & {
      isExtended?: boolean;
      addEventListener?: (type: "change", listener: () => void) => void;
      removeEventListener?: (type: "change", listener: () => void) => void;
    };
    const checkScreens = () => {
      if (screenInfo.isExtended === true && !secondScreenFlagged.current) {
        secondScreenFlagged.current = true;
        try {
          if (attemptIdRef.current) storage()?.setItem(`buildment:integrity-screen:${attemptIdRef.current}`, "1");
        } catch {
          // Storage is optional.
        }
        record("SECOND_SCREEN", { extended: true });
      }
    };
    checkScreens();

    wasFullscreen.current = Boolean(document.fullscreenElement);
    flagHiddenReturn();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    root?.addEventListener("copy", onCopy, true);
    root?.addEventListener("cut", onCopy, true);
    root?.addEventListener("paste", onPaste, true);
    root?.addEventListener("contextmenu", onContextMenu, true);
    root?.addEventListener("drop", onDrop, true);
    if (finePointer) {
      document.documentElement.addEventListener("mouseleave", onMouseLeave);
      document.documentElement.addEventListener("mouseenter", onMouseEnter);
    }
    screenInfo.addEventListener?.("change", checkScreens);
    const flushTimer = window.setInterval(() => void flush(), FLUSH_MS);
    const onOnline = () => void flush();
    window.addEventListener("online", onOnline);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
      root?.removeEventListener("copy", onCopy, true);
      root?.removeEventListener("cut", onCopy, true);
      root?.removeEventListener("paste", onPaste, true);
      root?.removeEventListener("contextmenu", onContextMenu, true);
      root?.removeEventListener("drop", onDrop, true);
      if (finePointer) {
        document.documentElement.removeEventListener("mouseleave", onMouseLeave);
        document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      }
      screenInfo.removeEventListener?.("change", checkScreens);
      window.clearInterval(flushTimer);
      window.removeEventListener("online", onOnline);
      void flush(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, session?.attemptId]);

  // --- Calls from the quiz ------------------------------------------------------------------

  /** Runs `action` (for example a native confirm dialog) without counting the focus it steals. */
  const withoutFlags = useCallback(<T,>(action: () => T): T => {
    suppressUntil.current = Number.MAX_SAFE_INTEGER;
    try {
      return action();
    } finally {
      suppressUntil.current = Date.now() + 500;
      blurStart.current = null;
    }
  }, []);

  /** Notes answers that came in far faster than the questions can be read. */
  const checkPace = useCallback((blockIds: string[]) => {
    const root = rootRef.current;
    if (!root || blockIds.length === 0 || finishedRef.current) return;
    const words = blockIds.reduce((total, blockId) => {
      const step = root.querySelector<HTMLElement>(`[data-integrity-step="${CSS.escape(blockId)}"]`);
      return total + countWords(step?.textContent ?? "");
    }, 0);
    const elapsedMs = Date.now() - paceStart.current;
    if (isFastAnswer(elapsedMs, words, blockIds.length)) {
      record("FAST_ANSWER", { elapsedMs, words, questions: blockIds.length }, { at: new Date() });
    }
  }, [record, rootRef]);

  /** After a submit that was not perfect: the next try is a new attempt. */
  const nextAttempt = useCallback(async () => {
    if (finishedRef.current) return;
    await flush();
    const next = await openAttempt();
    if (!next || finishedRef.current) return;
    try {
      storage()?.setItem(introKey(next.attemptId), "1");
    } catch {
      // Harmless.
    }
    applySession(next);
    const status = cameraStatusRef.current;
    if (next.camera.enabled && status !== "NOT_REQUESTED" && status !== next.camera.status) void putCamera(status);
  }, [applySession, flush, openAttempt, putCamera]);

  /** The quiz is complete: stop watching (leaving full screen now is expected) and release the camera. */
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFullscreenPrompt(false);
    writePending(hiddenKey, null);
    stopStream();
    void flush(true);
  }, [flush, hiddenKey, stopStream]);

  const returnToFullscreen = useCallback(() => {
    setFullscreenPrompt(false);
    requestQuizFullscreen();
  }, []);

  const dismissFullscreenPrompt = useCallback(() => {
    fullscreenDismissals.current += 1;
    setFullscreenPrompt(false);
  }, []);

  return useMemo(
    () => ({
      active: Boolean(session) && enabled,
      session,
      flagCount: serverFlags + pendingFlags,
      notice,
      dismissNotice: () => setNotice(null),
      fullscreenPrompt,
      returnToFullscreen,
      dismissFullscreenPrompt,
      fullscreenSupported: fullscreenSupported(),
      camera: {
        enabled: Boolean(session?.camera.enabled),
        status: cameraStatus,
        attachVideo,
        start: startCamera,
        turnOff: () => declineCamera("learner"),
      },
      dialog,
      openInfo: () => setDialog("info"),
      closeInfo: () => setDialog((current) => (current === "info" ? null : current)),
      begin,
      withoutFlags,
      checkPace,
      nextAttempt,
      finish,
    }),
    [attachVideo, begin, cameraStatus, checkPace, declineCamera, dismissFullscreenPrompt, enabled, finish, fullscreenPrompt, dialog, nextAttempt, notice, pendingFlags, returnToFullscreen, serverFlags, session, startCamera, withoutFlags],
  );
}

export type QuizIntegrity = ReturnType<typeof useQuizIntegrity>;
