"use client";

import { useCallback, useEffect, useMemo, useReducer, type KeyboardEvent } from "react";
import { INITIAL_STEPPER, stepperActionForKey, stepperReducer } from "./stepper";

/** How long Play rests on each step. Long enough to read a short note. */
export const PLAY_INTERVAL_MS = 3500;

export type Stepper = ReturnType<typeof useStepper>;

/**
 * Step state plus Play and keyboard handling for one canvas. Keys are handled
 * on the canvas element itself, never on window, so two canvases on a page
 * do not both move when the learner presses an arrow key.
 */
export function useStepper(count: number) {
  const reducer = useMemo(() => stepperReducer(count), [count]);
  const [state, dispatch] = useReducer(reducer, INITIAL_STEPPER);
  const last = Math.max(count - 1, 0);

  useEffect(() => {
    if (!state.playing) return;
    const timer = window.setTimeout(() => dispatch({ type: "tick" }), PLAY_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [state.playing, state.active]);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    // Leave form controls inside the canvas to their own keys.
    const target = event.target as HTMLElement;
    if (target.closest("input, select, textarea")) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const action = stepperActionForKey(event.key);
    if (!action) return;
    event.preventDefault();
    dispatch(action);
  }, []);

  return {
    active: state.active,
    playing: state.playing,
    count,
    isFirst: state.active === 0,
    isLast: state.active >= last,
    next: useCallback(() => dispatch({ type: "next" }), []),
    prev: useCallback(() => dispatch({ type: "prev" }), []),
    go: useCallback((index: number) => dispatch({ type: "go", index }), []),
    reset: useCallback(() => dispatch({ type: "first" }), []),
    togglePlay: useCallback(() => dispatch({ type: "togglePlay" }), []),
    onKeyDown,
  };
}
