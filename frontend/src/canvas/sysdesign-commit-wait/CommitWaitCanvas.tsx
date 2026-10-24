"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { FOCUS_RING } from "../primitives/tones";
import { buildTrueTimeScene } from "../models/truetime-scene";
import { ScenePlayer } from "../renderers/scene/ScenePlayer";

const EPS_MIN = 1;
const EPS_MAX = 10;
const clampEps = (v: number) => Math.max(EPS_MIN, Math.min(EPS_MAX, Math.round(v)));

/** Beat 5 of 10.6: commit wait on or off, and drag epsilon to see the wait shrink or grow. */
export function CommitWaitCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [eps, setEps] = useState(4);
  const [wait, setWait] = useState(true);
  const drag = useRef<{ x: number; eps: number } | null>(null);
  const scene = buildTrueTimeScene(eps, wait);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") setEps((v) => clampEps(v + 1));
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") setEps((v) => clampEps(v - 1));
    else return;
    e.preventDefault();
  };

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the <b>epsilon</b> pill. Better clocks mean a shorter wait.</>}
      controls={
        <>
          <BeatButton pressed={wait} onClick={() => setWait((w) => !w)}>
            Commit wait: {wait ? "on" : "off"}
          </BeatButton>
          <span
            role="slider"
            tabIndex={0}
            aria-label="Clock uncertainty, epsilon"
            aria-valuemin={EPS_MIN}
            aria-valuemax={EPS_MAX}
            aria-valuenow={eps}
            aria-valuetext={`epsilon ${eps} milliseconds`}
            onKeyDown={onKeyDown}
            onPointerDown={(e) => {
              drag.current = { x: e.clientX, eps };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (drag.current) setEps(clampEps(drag.current.eps + (e.clientX - drag.current.x) / 16));
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            className={cn(
              "inline-flex h-11 cursor-ew-resize touch-none select-none items-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white sm:h-10 dark:bg-blue-400 dark:text-blue-950",
              FOCUS_RING
            )}
          >
            ε {eps} ms <span aria-hidden>⇆</span>
          </span>
        </>
      }
    >
      <ScenePlayer scene={scene} title={title} replayKey={`${eps}-${wait}`} />
    </BeatFrame>
  );
}
