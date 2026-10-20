"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type SetStateAction } from "react";
import { useBrowserStorage, useHydrated } from "./use-browser-storage";

const MOBILE_QUERY = "(max-width: 767px)";
const READY_KEY = "buildment:reader:ready";

function sidebarStorageKey(courseSlug: string) {
  return `buildment:reader:sidebar:${courseSlug}`;
}

function subscribeMobile(callback: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
}

/** Below this width both side panels leave too little room for the text, so the outline starts closed. */
const ROOMY_QUERY = "(min-width: 1280px)";

function subscribeRoomy(callback: () => void) {
  const mq = window.matchMedia(ROOMY_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function useIsRoomy() {
  return useSyncExternalStore(
    subscribeRoomy,
    () => window.matchMedia(ROOMY_QUERY).matches,
    () => true
  );
}

function readerAlreadyReady() {
  try {
    return typeof window !== "undefined" && sessionStorage.getItem(READY_KEY) === "1";
  } catch {
    return false;
  }
}

/** Sidebar preferences are stored separately for each course. */
export function useReaderLayout(courseSlug: string) {
  const isMobile = useIsMobile();
  const isRoomy = useIsRoomy();
  const hydrated = useHydrated();
  const [raw, setRaw] = useBrowserStorage(sidebarStorageKey(courseSlug), "", "sessionStorage");
  let prefs: { left?: boolean; right?: boolean } = {};
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object") {
      const stored = parsed as Record<string, unknown>;
      prefs = {
        left: typeof stored.left === "boolean" ? stored.left : undefined,
        right: typeof stored.right === "boolean" ? stored.right : undefined,
      };
    }
  } catch { /* Use device defaults. */ }
  const leftCollapsed = prefs.left ?? (hydrated && isMobile);
  const rightCollapsed = prefs.right ?? (hydrated && (isMobile || !isRoomy));
  const [skipSkeleton] = useState(() => readerAlreadyReady());
  useEffect(() => {
    try { sessionStorage.setItem(READY_KEY, "1"); } catch { /* Optional preference. */ }
  }, []);
  const setLeftCollapsed = useCallback((next: SetStateAction<boolean>) => {
    setRaw(JSON.stringify({ left: typeof next === "function" ? next(leftCollapsed) : next, right: rightCollapsed }));
  }, [leftCollapsed, rightCollapsed, setRaw]);
  const setRightCollapsed = useCallback((next: SetStateAction<boolean>) => {
    setRaw(JSON.stringify({ left: leftCollapsed, right: typeof next === "function" ? next(rightCollapsed) : next }));
  }, [leftCollapsed, rightCollapsed, setRaw]);
  return { isMobile, leftCollapsed, setLeftCollapsed, rightCollapsed, setRightCollapsed, visible: true, skipSkeleton };
}
