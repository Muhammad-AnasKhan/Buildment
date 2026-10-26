"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

/** How long the packet takes to ride one link: slow enough to read the chips as they move (learner feedback, 2026-10-26). */
export const RIDE_MS = 1400;

type Ride = { key: string | null; t: number };

const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

/**
 * How far along its link the packet is, 0 to 1, for the step named by `playKey`
 * (null: no packet to move). It starts at the settled frame (1), so the server
 * render and a reduced-motion reader see the packet at the far end at once. A
 * new key plays once; the trip stops and settles when the picture leaves the
 * screen or the tab is hidden.
 */
export function useRide(playKey: string | null, reduced: boolean, target: RefObject<Element | null>): number {
  const [ride, setRide] = useState<Ride>({ key: playKey, t: 1 });
  const t = playKey === null ? 1 : ride.key === playKey ? ride.t : 0;

  useLayoutEffect(() => {
    if (playKey === null) {
      setRide((r) => (r.key === null ? r : { key: null, t: 1 }));
      return;
    }
    const el = target.current;
    const settle = () => setRide({ key: playKey, t: 1 });
    const box = el?.getBoundingClientRect();
    const offscreen = box ? box.bottom < 0 || box.top > window.innerHeight : false;
    if (reduced || document.hidden || offscreen) {
      settle();
      return;
    }
    let raf = 0;
    let start = 0;
    const frame = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / RIDE_MS);
      setRide({ key: playKey, t: ease(p) });
      if (p < 1) raf = requestAnimationFrame(frame);
    };
    setRide({ key: playKey, t: 0 });
    raf = requestAnimationFrame(frame);
    let observer: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(([entry]) => {
        if (entry && !entry.isIntersecting) {
          cancelAnimationFrame(raf);
          settle();
        }
      });
      observer.observe(el);
    }
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [playKey, reduced, target]);

  return t;
}
