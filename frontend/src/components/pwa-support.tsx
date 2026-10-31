"use client";

import { useEffect } from "react";

/**
 * Registers the small, security-conscious service worker. Browsers can still
 * offer their own install control without adding a prompt to the product UI.
 */
export function PwaSupport() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js");
  }, []);

  return null;
}
