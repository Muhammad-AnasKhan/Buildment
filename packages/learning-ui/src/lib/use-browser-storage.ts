"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

const CHANGE_EVENT = "buildment:storage-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function useHydrated() {
  return useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
}

/** Read browser preferences after hydration and notify other controls on writes. */
export function useBrowserStorage(
  key: string | undefined,
  fallback: string,
  storage: "localStorage" | "sessionStorage" = "localStorage",
) {
  const [local, setLocal] = useState<{ key: string | undefined; value: string } | null>(null);
  const getSnapshot = useCallback(() => {
    try {
      return key ? window[storage].getItem(key) ?? fallback : fallback;
    } catch {
      return fallback;
    }
  }, [key, fallback, storage]);
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => fallback);
  const setValue = useCallback((value: string) => {
    setLocal({ key, value });
    if (!key) return;
    try {
      window[storage].setItem(key, value);
      setLocal(null);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      // Keep controls usable in memory when persistence is blocked.
    }
  }, [key, storage]);
  return [local && local.key === key ? local.value : stored, setValue] as const;
}
