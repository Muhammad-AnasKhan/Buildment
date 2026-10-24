"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { advance, settle, type Cluster } from "../models/raft-cluster";
import { useBeatClock } from "./use-beat-clock";

// Runs a Raft cluster model against the beat clock: the model moves while the
// picture is on screen, stands still while it is off screen or pressed, and
// under reduced motion each action jumps straight to the settled picture.
// Both Raft playables (elections and logs) use it.

export type Speed = 1 | 0.5;
/** Real milliseconds for one model millisecond: model time is slowed so a 10 ms message can be seen. */
const REAL_MS_PER_MODEL_MS: Record<Speed, number> = { 1: 12, 0.5: 24 };

export type SettleSpec = { done: (c: Cluster) => boolean; cap: number; extra?: number };

export function useRaftRun<Ctx extends string>(box: RefObject<Element | null>, init: () => Cluster, startCtx: Ctx, speed: Speed) {
  const clock = useBeatClock(box);
  const [c, setC] = useState<Cluster>(init);
  const [ctx, setCtx] = useState<Ctx>(startCtx);
  const last = useRef(clock.seconds);
  const { seconds, reduced } = clock;

  useEffect(() => {
    const dt = seconds - last.current;
    last.current = seconds;
    if (reduced || dt <= 0 || dt > 0.25) return;
    setC((prev) => advance(prev, prev.now + (dt * 1000) / REAL_MS_PER_MODEL_MS[speed]));
  }, [seconds, reduced, speed]);

  const act = useCallback(
    (fn: (c: Cluster) => Cluster, next: Ctx, until?: SettleSpec) => {
      setC((prev) => {
        // Snap to a whole millisecond so a press always starts from the same kind of instant.
        const n = fn(advance(prev, Math.ceil(prev.now)));
        return reduced && until ? settle(n, until.done, until.cap, until.extra) : n;
      });
      setCtx(next);
    },
    [reduced]
  );

  const reset = useCallback(() => {
    setC(init());
    setCtx(startCtx);
    last.current = seconds;
  }, [init, startCtx, seconds]);

  return { c, ctx, act, reset, reduced };
}
