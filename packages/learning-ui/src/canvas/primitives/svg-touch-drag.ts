"use client";

import { useCallback, useRef } from "react";

// Phone browsers ignore touch-action (Tailwind's touch-none) on elements inside an SVG: only the
// <svg> itself counts. A drag that starts on an SVG group therefore scrolls the page, the browser
// cancels the pointer, and the slider never moves, while a tap still works. Cancelling touchstart
// keeps the touch for the drag; it needs a non-passive listener, which React's onTouchStart is not.
// Pointer events still arrive, so the targets' own pointer handlers keep working.
export function useSvgTouchDrag<T extends Element>() {
  const cleanup = useRef<(() => void) | null>(null);
  return useCallback((node: T | null) => {
    cleanup.current?.();
    cleanup.current = null;
    if (!node) return;
    const keep = (event: Event) => {
      if (event.cancelable) event.preventDefault();
    };
    node.addEventListener("touchstart", keep, { passive: false });
    cleanup.current = () => node.removeEventListener("touchstart", keep);
  }, []);
}
