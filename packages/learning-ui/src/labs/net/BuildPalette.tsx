"use client";

// The row of parts a learner can place. A part can be dragged onto the canvas
// with a mouse or a finger, or armed with a tap (or Enter) and then dropped
// with a tap on the canvas.

import type { RefObject } from "react";
import { useRef, useState } from "react";
import type { BuildPart, BuildState } from "./build-model";
import { placedCount } from "./build-model";
import { BUILD_TONE } from "./build-style";

interface Props {
  parts: BuildPart[];
  state: BuildState;
  armed: string | null;
  canvasRef: RefObject<HTMLDivElement | null>;
  onArm: (id: string | null) => void;
  onDrop: (id: string, x: number, y: number) => void;
  onNote: (message: string) => void;
}

interface Ghost {
  id: string;
  x: number;
  y: number;
}

const DRAG_START = 6;

export function BuildPalette({ parts, state, armed, canvasRef, onArm, onDrop, onNote }: Props) {
  const press = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const [ghost, setGhost] = useState<Ghost | null>(null);

  function down(e: React.PointerEvent<HTMLButtonElement>, id: string) {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    press.current = { id, x: e.clientX, y: e.clientY, moved: false };
  }

  function move(e: React.PointerEvent<HTMLButtonElement>) {
    const p = press.current;
    if (!p) return;
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) < DRAG_START) return;
    p.moved = true;
    setGhost({ id: p.id, x: e.clientX, y: e.clientY });
  }

  function up(e: React.PointerEvent<HTMLButtonElement>) {
    const p = press.current;
    press.current = null;
    setGhost(null);
    if (!p) return;
    if (!p.moved) {
      onArm(armed === p.id ? null : p.id);
      return;
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    const inside = rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (rect && inside) onDrop(p.id, e.clientX - rect.left, e.clientY - rect.top);
    else onNote("Dropped outside the canvas, so nothing was placed.");
  }

  const ghostPart = ghost ? parts.find((p) => p.id === ghost.id) : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Parts. Drag one onto the canvas, or select one and then select the canvas.">
      {parts.map((part) => {
        const placed = placedCount(state, part.id);
        const full = placed >= part.max;
        const tone = BUILD_TONE[part.kind];
        const isArmed = armed === part.id;
        return (
          <button
            key={part.id}
            type="button"
            disabled={full}
            aria-pressed={isArmed}
            aria-label={`${part.label}, ${part.kind}, ${placed} of ${part.max} placed${full ? ", none left" : ""}. Press Enter to pick it up, then press Enter on the canvas to place it.`}
            onPointerDown={(e) => down(e, part.id)}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => {
              press.current = null;
              setGhost(null);
            }}
            onClick={(e) => {
              // A real click from the keyboard has no pointer position; pointer
              // taps are handled on pointer up so they never fire twice.
              if (e.detail === 0) onArm(isArmed ? null : part.id);
            }}
            style={{ touchAction: "none" }}
            className={`flex min-h-11 cursor-grab select-none items-center gap-2 rounded-xl border px-3 py-1.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-45 ${
              isArmed ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500/40 dark:bg-violet-500/10" : "border-border bg-card hover:bg-muted"
            }`}
          >
            <span className={`size-2.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
            <span>
              <span className="block font-medium leading-tight">{part.label}</span>
              <span className="block text-[11px] leading-tight text-muted-foreground">
                {placed} of {part.max} placed
              </span>
            </span>
          </button>
        );
      })}
      {ghost && ghostPart && (
        <div
          aria-hidden="true"
          className={`pointer-events-none fixed z-50 grid place-items-center rounded-xl border-2 text-sm font-semibold opacity-80 ${BUILD_TONE[ghostPart.kind].box}`}
          style={{ left: ghost.x - 56, top: ghost.y - 28, width: 112, height: 56 }}
        >
          {ghostPart.label}
        </div>
      )}
    </div>
  );
}
