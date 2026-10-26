"use client";

import { useEffect, useState, type PointerEvent } from "react";

// Small motion helpers shared by the tap-and-answer primitives (phrase fixer,
// budget stack, slot card): the reduced-motion preference, a short tween
// clock, and a pointer position in SVG units.

/** True when the learner asked the system for less motion. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** Ticks once a frame while `until` (a performance.now() time) is in the future, so a short tween can draw itself. */
export function useTween(until: number, reduced: boolean) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (reduced || until <= 0) return;
    let raf = 0;
    const loop = (t: number) => {
      setNow(t);
      if (t < until) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [until, reduced]);
  return now;
}

/** Progress from 0 to 1 of a tween that started at `at` and lasts `ms`; 1 when motion is reduced or nothing runs. */
export function tweenProgress(now: number, at: number | null, ms: number, reduced: boolean) {
  if (at === null || reduced) return 1;
  return Math.max(0, Math.min(1, (now - at) / ms));
}

/** The pointer's position in the SVG's own units, or null before layout. */
export function svgPoint(svg: SVGSVGElement | null, e: PointerEvent) {
  const m = svg?.getScreenCTM();
  if (!svg || !m) return null;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const q = pt.matrixTransform(m.inverse());
  return { x: q.x, y: q.y };
}
