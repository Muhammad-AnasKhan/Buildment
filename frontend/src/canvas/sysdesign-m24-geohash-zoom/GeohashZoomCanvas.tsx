"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { BeatActionButton } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import {
  boxSizeText,
  cellIndexAt,
  cellOf,
  cellRect,
  gridFor,
  mapTransform,
  MAX_LETTERS,
  moveInGrid,
  nestedBoxes,
  pickKind,
  zoomVerdict,
  type PickKind,
  type Rect,
} from "../models/geohash-zoom";

const W = 420;
const H = 334;
const AREA: Rect = { x: 12, y: 110, w: 396, h: 216 };
const CHIP = { x0: 58, y: 60, w: 28, h: 26, gap: 5 };
const INSET = { x: 300, y: 46, w: 108, h: 56 };
const NEST = { x: 308, y: 52, w: 92, h: 32 };
const MS = 420;

/** One zoom in progress: the grid that is leaving, the sub-box the camera moves through, and the direction. */
type Move = { id: number; kind: "in" | "out"; cell: Rect; leaving: number; picked: number };

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 24.2 beat 2: tap a sub-box to zoom in and add a letter; a longer code names a smaller box inside the bigger one. */
export function GeohashZoomCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const cells = useRef<(SVGGElement | null)[]>([]);
  const titleId = useId();
  const descId = useId();
  const [path, setPath] = useState<string[]>([]);
  const [kind, setKind] = useState<PickKind>("start");
  const [popped, setPopped] = useState<{ position: number; letter: string } | null>(null);
  const [aim, setAim] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [move, setMove] = useState<Move | null>(null);
  const [settled, setSettled] = useState(true);
  // Changes with every zoom, so the new grid mounts fresh at its start position.
  const [epoch, setEpoch] = useState(0);
  const pressed = useRef(false);
  const viaKeyboard = useRef(false);

  const level = path.length;
  const done = level >= MAX_LETTERS;
  const position = level + 1;
  const grid = gridFor(done ? MAX_LETTERS : position);
  const code = path.join("");
  const verdict = zoomVerdict(kind);
  const size = boxSizeText(level);

  // Let the new grid sit at its start for a frame, then glide to its place.
  useEffect(() => {
    if (!move) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setSettled(true));
    });
    const gone = setTimeout(() => setMove(null), MS + 80);
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      clearTimeout(gone);
    };
  }, [move]);

  // A keyboard user keeps their place: after a zoom, focus lands on a box of the new grid.
  useEffect(() => {
    if (viaKeyboard.current) cells.current[focus]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epoch]);

  const zoomTo = (index: number) => {
    if (done) return;
    const letter = grid.letters[Math.floor(index / grid.cols)][index % grid.cols];
    const cell = cellRect(AREA, grid.cols, grid.rows, index % grid.cols, Math.floor(index / grid.cols));
    setKind(pickKind(popped, position, letter));
    setPopped(null);
    setPath([...path, letter]);
    setFocus(0);
    setAim(null);
    setSettled(false);
    setEpoch((n) => n + 1);
    setMove((m) => ({ id: (m?.id ?? 0) + 1, kind: "in", cell, leaving: position, picked: index }));
  };

  const back = () => {
    if (level === 0) return;
    const letter = path[level - 1];
    const parent = gridFor(level);
    const at = cellOf(level, letter);
    const cell = at ? cellRect(AREA, parent.cols, parent.rows, at.col, at.row) : AREA;
    setPopped({ position: level, letter });
    setKind(level - 1 === 0 ? "start" : "zoom");
    setPath(path.slice(0, -1));
    setFocus(at ? at.row * at.cols + at.col : 0);
    setAim(null);
    setSettled(false);
    setEpoch((n) => n + 1);
    // From seven letters the box that leaves is the big final box, not a grid: nothing glides away.
    setMove((m) => ({ id: (m?.id ?? 0) + 1, kind: "out", cell, leaving: level >= MAX_LETTERS ? 0 : level + 1, picked: at ? at.row * at.cols + at.col : 0 }));
  };

  const reset = () => {
    setPath([]);
    setKind("start");
    setPopped(null);
    setAim(null);
    setFocus(0);
    setMove(null);
    setSettled(true);
    setEpoch((n) => n + 1);
  };

  // Pointer: press to aim, slide to change the aim, let go to zoom into the box under the finger.
  const indexUnder = (e: PointerEvent): number | null => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return null;
    const p = el.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const s = p.matrixTransform(m.inverse());
    return cellIndexAt(AREA, grid.cols, grid.rows, s.x, s.y);
  };
  const onDown = (e: PointerEvent<SVGRectElement>) => {
    if (done) return;
    pressed.current = true;
    viaKeyboard.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    setAim(indexUnder(e));
  };
  const onMove = (e: PointerEvent<SVGRectElement>) => {
    if (done) return;
    if (pressed.current || e.pointerType === "mouse") setAim(indexUnder(e));
  };
  const onUp = (e: PointerEvent<SVGRectElement>) => {
    if (!pressed.current) return;
    pressed.current = false;
    const at = indexUnder(e);
    setAim(null);
    if (at !== null) zoomTo(at);
  };
  const onCancel = () => {
    pressed.current = false;
    setAim(null);
  };

  const onCellKey = (e: KeyboardEvent, index: number) => {
    viaKeyboard.current = true;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      zoomTo(index);
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      back();
      return;
    }
    const next = moveInGrid(index, grid.cols, grid.rows, e.key);
    if (next === null) return;
    e.preventDefault();
    setFocus(next);
    cells.current[next]?.focus();
  };

  const nests = nestedBoxes(path, NEST.w, NEST.h);
  const description = `A geohash zoom. Code so far: ${code || "none"}, ${level} ${level === 1 ? "letter" : "letters"}. Box: ${size}. ${done ? "This is the smallest box here." : "Thirty-two sub-boxes, each one a letter."} ${verdict.text}.`;

  // The leaving grid glides to fill (in) or shrink into (out) the box that was tapped.
  const entering = move && !settled ? (move.kind === "in" ? mapTransform(AREA, move.cell) : mapTransform(move.cell, AREA)) : undefined;
  const leaving = move && settled ? (move.kind === "in" ? mapTransform(move.cell, AREA) : mapTransform(AREA, move.cell)) : undefined;
  const glide = `transform ${MS}ms cubic-bezier(0.22, 0.8, 0.3, 1), opacity ${MS}ms ease`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={
        <>
          <BeatActionButton onClick={back} disabled={level === 0}>Back one letter</BeatActionButton>
          <BeatActionButton onClick={reset} disabled={level === 0}>Reset</BeatActionButton>
        </>
      }
      hint={<>Tap a box to zoom in, or drag over the boxes and let go.</>}
    >
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />

        {/* The code so far, one chip a letter; the last one is the newest. */}
        <text x={14} y={CHIP.y + 5} className={cn(NEUTRAL.mutedText, "text-[12.5px] font-semibold")}>code</text>
        {path.length === 0 ? (
          <g aria-hidden>
            <rect x={CHIP.x0} y={CHIP.y - CHIP.h / 2} width={CHIP.w * 2.2} height={CHIP.h} rx={9} strokeWidth={1.5} strokeDasharray="4 3" className={cn("fill-none", NEUTRAL.faintStroke)} />
            <text x={CHIP.x0 + CHIP.w * 1.1} y={CHIP.y + 4.6} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>world</text>
          </g>
        ) : (
          path.map((letter, i) => {
            const x = CHIP.x0 + i * (CHIP.w + CHIP.gap);
            const last = i === path.length - 1;
            return (
              <g key={`${i}-${letter}`} aria-hidden>
                <rect x={x} y={CHIP.y - CHIP.h / 2} width={CHIP.w} height={CHIP.h} rx={9} strokeWidth={1.75} className={last ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line)} />
                <text x={x + CHIP.w / 2} y={CHIP.y + 5.5} textAnchor="middle" className={cn(last ? TONES.accent.text : NEUTRAL.text, "font-mono text-[15px] font-bold")}>{letter}</text>
              </g>
            );
          })
        )}
        <text x={14} y={96} className={cn(NEUTRAL.text, "text-[13.5px] font-semibold tabular-nums")}>Box: {size}</text>

        {/* The chain of boxes: each smaller box sits inside the one before. */}
        <g aria-hidden>
          <rect x={INSET.x} y={INSET.y} width={INSET.w} height={INSET.h} rx={10} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          {nests.map((n, i) => (
            <rect
              key={i}
              x={r1(NEST.x + n.x)}
              y={r1(NEST.y + n.y)}
              width={r1(n.w)}
              height={r1(n.h)}
              rx={i === 0 ? 3 : 1.5}
              strokeWidth={i === 0 ? 1.25 : 1.5}
              className={cn(i === 0 ? cn("fill-none", NEUTRAL.faintStroke) : i === nests.length - 1 ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn("fill-none", TONES.accent.stroke), "transition-all duration-300 motion-reduce:transition-none")}
              opacity={i === 0 || i === nests.length - 1 ? 1 : 0.6}
            />
          ))}
          <text x={INSET.x + INSET.w / 2} y={INSET.y + INSET.h - 5} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>boxes inside boxes</text>
        </g>

        {/* The map: the current box, cut into 32 sub-boxes. */}
        <rect x={AREA.x} y={AREA.y} width={AREA.w} height={AREA.h} rx={6} className={NEUTRAL.surface} />
        <g role="group" aria-label={done ? `${code}: the smallest box` : `Next letter after ${code || "the world"}: pick one of 32 boxes`}>
          <g
            key={epoch}
            style={{ transform: entering, transformOrigin: "0 0", opacity: entering ? 0 : 1, transition: glide }}
            className="motion-reduce:!transition-none"
          >
            {done ? (
              <FinalBox code={code} size={size} />
            ) : (
              <GridCells position={position} aim={aim} focus={focus} cellRefs={cells} onKey={onCellKey} onPick={zoomTo} />
            )}
          </g>
        </g>
        {/* The grid that is leaving glides away and fades. */}
        {move && move.leaving > 0 ? (
          <g aria-hidden style={{ transform: leaving, transformOrigin: "0 0", opacity: leaving ? 0 : 1, transition: glide, pointerEvents: "none" }} className="motion-reduce:!transition-none">
            <GridCells position={move.leaving} aim={move.kind === "in" ? move.picked : null} focus={-1} decorative />
          </g>
        ) : null}
        <rect x={AREA.x} y={AREA.y} width={AREA.w} height={AREA.h} rx={6} strokeWidth={1.5} className={cn("fill-none", NEUTRAL.line)} aria-hidden />

        {/* Finger and mouse: one surface over the whole map. Keyboard and screen readers use the boxes below it. */}
        {!done ? (
          <rect
            x={AREA.x}
            y={AREA.y}
            width={AREA.w}
            height={AREA.h}
            rx={6}
            fill="transparent"
            pointerEvents="all"
            aria-hidden
            className="cursor-pointer touch-none"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onCancel}
            onPointerLeave={() => !pressed.current && setAim(null)}
          />
        ) : null}

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
      <p className="sr-only" aria-live="polite">{`Code ${code || "none"}. Box: ${size}.`}</p>
    </BeatFrame>
  );
}

type GridCellsProps = {
  position: number;
  aim: number | null;
  focus: number;
  cellRefs?: { current: (SVGGElement | null)[] };
  onKey?: (e: KeyboardEvent, index: number) => void;
  onPick?: (index: number) => void;
  decorative?: boolean;
};

/** The 32 sub-boxes of the current box, each with the letter it adds. */
function GridCells({ position, aim, focus, cellRefs, onKey, onPick, decorative }: GridCellsProps) {
  const g = gridFor(position);
  return (
    <g>
      {g.letters.flatMap((rowLetters, row) =>
        rowLetters.map((letter, col) => {
          const index = row * g.cols + col;
          const r = cellRect(AREA, g.cols, g.rows, col, row);
          const aimed = aim === index;
          const checker = (row + col) % 2 === 0;
          const body = (
            <>
              <rect
                x={r1(r.x)}
                y={r1(r.y)}
                width={r1(r.w)}
                height={r1(r.h)}
                strokeWidth={1}
                className={cn(aimed ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(checker ? "fill-muted/60" : NEUTRAL.surface, NEUTRAL.line), "transition-colors duration-150 motion-reduce:transition-none")}
              />
              <text x={r1(r.x + r.w / 2)} y={r1(r.y + r.h / 2 + 5.4)} textAnchor="middle" className={cn(aimed ? TONES.accent.text : NEUTRAL.text, "font-mono text-[15px] font-bold")}>{letter}</text>
            </>
          );
          if (decorative) return <g key={letter}>{body}</g>;
          return (
            <g
              key={letter}
              ref={(el) => {
                if (cellRefs) cellRefs.current[index] = el;
              }}
              role="button"
              tabIndex={index === focus ? 0 : -1}
              aria-label={`letter ${letter}, zoom in`}
              className="group outline-none"
              // A click with no pointer (a screen reader's activate) zooms; real taps are handled by the surface over the map.
              onClick={(e) => e.detail === 0 && onPick?.(index)}
              onKeyDown={(e) => onKey?.(e, index)}
            >
              {body}
              <rect x={r1(r.x + 2)} y={r1(r.y + 2)} width={r1(r.w - 4)} height={r1(r.h - 4)} rx={3} strokeWidth={2.5} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} />
            </g>
          );
        })
      )}
    </g>
  );
}

/** At seven letters the box is as small as this picture goes: one big box with its code. */
function FinalBox({ code, size }: { code: string; size: string }) {
  const cx = AREA.x + AREA.w / 2;
  const cy = AREA.y + AREA.h / 2;
  return (
    <g>
      <rect x={AREA.x + 18} y={AREA.y + 18} width={AREA.w - 36} height={AREA.h - 36} rx={14} strokeWidth={2.5} className={cn(TONES.accent.softFill, TONES.accent.stroke)} />
      <text x={cx} y={cy - 6} textAnchor="middle" className={cn(TONES.accent.text, "font-mono text-[30px] font-bold tracking-widest")}>{code}</text>
      <text x={cx} y={cy + 24} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13.5px] font-semibold")}>7 letters: a box {size}</text>
      <text x={cx} y={cy + 46} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px]")}>Go back a letter to try another box.</text>
    </g>
  );
}
