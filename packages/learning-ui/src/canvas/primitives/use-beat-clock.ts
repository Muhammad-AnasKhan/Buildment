"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** Reduced motion shows a settled frame without scheduling animation. */
export const FINAL_FRAME = 1e6;

/** Accumulate only time spent playing, including across visibility changes. */
export function createBeatTimer() {
  let elapsed = 0;
  let last: number | null = null;
  return {
    sample(now: number) {
      if (last !== null) elapsed += Math.max(0, now - last);
      last = now;
      return elapsed / 1000;
    },
    pause() { last = null; },
    restart() { elapsed = 0; last = null; },
  };
}

/** Runs only on screen, pauses while pressed, and resumes without jumping. */
export function useBeatClock(target: RefObject<Element | null>) {
  const [seconds, setSeconds] = useState(0);
  const [reduced, setReduced] = useState(false);
  const timer = useRef(createBeatTimer());
  const frozen = useRef(false);
  const sync = useRef<() => void>(() => {});

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let raf = 0;
    const playing = () => visible && !document.hidden && !query.matches && !frozen.current;
    const loop = (now: number) => {
      if (!playing()) return;
      setSeconds(timer.current.sample(now));
      raf = requestAnimationFrame(loop);
    };
    const synchronize = () => {
      cancelAnimationFrame(raf);
      timer.current.pause();
      if (playing()) raf = requestAnimationFrame(loop);
    };
    sync.current = synchronize;
    const preference = () => { setReduced(query.matches); synchronize(); };
    preference();
    query.addEventListener("change", preference);
    document.addEventListener("visibilitychange", synchronize);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      synchronize();
    }, { threshold: 0.25 });
    observer.observe(el);
    const activeTimer = timer.current;
    return () => {
      observer.disconnect();
      query.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", synchronize);
      cancelAnimationFrame(raf);
      activeTimer.pause();
      sync.current = () => {};
    };
  }, [target]);

  const freeze = useCallback(() => {
    if (frozen.current) return;
    frozen.current = true;
    sync.current();
  }, []);
  const unfreeze = useCallback(() => {
    if (!frozen.current) return;
    frozen.current = false;
    sync.current();
  }, []);
  const restart = useCallback(() => {
    timer.current.restart();
    setSeconds(0);
    sync.current();
  }, []);

  return { seconds: reduced ? FINAL_FRAME : seconds, reduced, freeze, unfreeze, restart };
}
