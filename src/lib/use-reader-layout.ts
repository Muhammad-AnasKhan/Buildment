"use client";

import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";
const READY_KEY = "buildment:reader:ready";

function sidebarStorageKey(courseSlug: string) {
  return `buildment:reader:sidebar:${courseSlug}`;
}

function readSidebarPrefs(courseSlug: string, mobile: boolean) {
  try {
    const raw = sessionStorage.getItem(sidebarStorageKey(courseSlug));
    if (!raw) return { left: mobile, right: mobile };
    const parsed = JSON.parse(raw) as { left?: boolean; right?: boolean };
    return {
      left: parsed.left ?? mobile,
      right: parsed.right ?? mobile,
    };
  } catch {
    return { left: mobile, right: mobile };
  }
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

function readerAlreadyReady() {
  return typeof window !== "undefined" && sessionStorage.getItem(READY_KEY) === "1";
}

/** Sidebar + TOC state; persists across chapter navigations within a course. */
function initialPrefs(courseSlug: string) {
  if (typeof window === "undefined") {
    return { left: false, right: false };
  }
  const mobile = window.matchMedia(MOBILE_QUERY).matches;
  return readSidebarPrefs(courseSlug, mobile);
}

export function useReaderLayout(courseSlug: string) {
  const isMobile = useIsMobile();
  const [leftCollapsed, setLeftCollapsed] = useState(() => initialPrefs(courseSlug).left);
  const [rightCollapsed, setRightCollapsed] = useState(() => initialPrefs(courseSlug).right);
  // Content must stay visible on first paint — hiding until useLayoutEffect caused blank
  // screens when hydration failed or was slow ("Compiled" in terminal but empty page).
  const [visible] = useState(true);
  const [skipSkeleton] = useState(() => readerAlreadyReady());

  useLayoutEffect(() => {
    const mobile = window.matchMedia(MOBILE_QUERY).matches;
    const prefs = readSidebarPrefs(courseSlug, mobile);
    setLeftCollapsed((prev) => (prev === prefs.left ? prev : prefs.left));
    setRightCollapsed((prev) => (prev === prefs.right ? prev : prefs.right));
    sessionStorage.setItem(READY_KEY, "1");
  }, [courseSlug]);

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem(
        sidebarStorageKey(courseSlug),
        JSON.stringify({ left: leftCollapsed, right: rightCollapsed })
      );
    } catch {
      /* ignore */
    }
  }, [courseSlug, leftCollapsed, rightCollapsed, visible]);

  return {
    isMobile,
    leftCollapsed,
    setLeftCollapsed,
    rightCollapsed,
    setRightCollapsed,
    visible,
    skipSkeleton,
  };
}
