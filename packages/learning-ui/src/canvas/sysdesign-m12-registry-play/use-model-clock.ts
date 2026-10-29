"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { MOTION_PACE } from "../primitives/motion-pace";

// A model clock for a picture that runs on its own: `rate` model seconds pass
// per real second while the picture is on screen, the tab is visible and the
// learner has not paused it. With reduced motion the clock moves in whole
// seconds instead of sliding, so the strip jumps once per model second.

export function useModelClock(target: RefObject<Element | null>, rate: number) {
  const [t, setT] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPausedState] = useState(false);
  const time = useRef(0);
  const pausedRef = useRef(false);
  const sync = useRef<() => void>(() => {});

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let raf = 0;
    let timer = 0;
    let last: number | null = null;
    const playing = () => visible && !document.hidden && !pausedRef.current;
    const loop = (now: number) => {
      if (!playing() || query.matches) return;
      if (last !== null) {
        time.current += ((now - last) / 1000) * rate * MOTION_PACE;
        setT(time.current);
      }
      last = now;
      raf = requestAnimationFrame(loop);
    };
    const synchronize = () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      last = null;
      setReduced(query.matches);
      if (!playing()) return;
      if (query.matches) {
        time.current = Math.floor(time.current);
        setT(time.current);
        timer = window.setInterval(() => {
          time.current += 1;
          setT(time.current);
        }, 1000 / rate);
      } else {
        raf = requestAnimationFrame(loop);
      }
    };
    sync.current = synchronize;
    synchronize();
    query.addEventListener("change", synchronize);
    document.addEventListener("visibilitychange", synchronize);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      synchronize();
    }, { threshold: 0.25 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", synchronize);
      document.removeEventListener("visibilitychange", synchronize);
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      sync.current = () => {};
    };
  }, [target, rate]);

  const setPaused = useCallback((value: boolean) => {
    pausedRef.current = value;
    setPausedState(value);
    sync.current();
  }, []);
  const restart = useCallback(() => {
    time.current = 0;
    setT(0);
    sync.current();
  }, []);
  /** The model time right now, even between renders. */
  const now = useCallback(() => time.current, []);

  return { t, reduced, paused, setPaused, restart, now };
}
