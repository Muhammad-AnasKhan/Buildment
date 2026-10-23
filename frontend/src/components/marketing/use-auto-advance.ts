"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** True when the visitor asked the OS for less motion. Server snapshot is `false`. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(REDUCED_MOTION_QUERY);
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * Reports whether `ref` is on screen. `seen` flips to true the first time it is, and stays true,
 * so scenes can be (re)started the moment the visitor actually scrolls to them.
 */
export function useInView(ref: RefObject<Element | null>, threshold = 0.35) {
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return { inView, seen };
}

type TimerBarOptions = {
  /** Length of one tick in ms. */
  duration: number;
  /** Change this to restart the bar from zero (active slide / step / filter). */
  restartKey: string | number;
  /** When false no timer runs at all (reduced motion, single slide, off screen...). */
  enabled: boolean;
  /** Freeze the bar in place (hover, focus, manual pause). */
  paused: boolean;
  onDone: () => void;
};

/**
 * Drives a "progress bar that fills, then advances" timer on `ref` with the Web Animations API,
 * the same idea as the original design (a CSS animation whose end triggers the next slide), but
 * pausable and resumable without losing its place.
 */
export function useTimerBar(ref: RefObject<HTMLElement | null>, options: TimerBarOptions) {
  const { duration, restartKey, enabled, paused, onDone } = options;
  const animationRef = useRef<Animation | null>(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    const animation = node.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration, easing: "linear", fill: "forwards" },
    );
    animationRef.current = animation;
    animation.onfinish = () => onDoneRef.current();
    return () => {
      animation.cancel();
      if (animationRef.current === animation) animationRef.current = null;
    };
  }, [ref, duration, restartKey, enabled]);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (paused) animation.pause();
    else if (animation.playState === "paused") animation.play();
  }, [paused, restartKey, enabled]);
}
