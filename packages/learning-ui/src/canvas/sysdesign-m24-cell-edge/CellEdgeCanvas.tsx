"use client";

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RadioChipRow, chipRowWidth } from "../primitives/radio-chip-row";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import {
  BOX,
  cellEdge,
  clampPoint,
  costText,
  DEFAULT_LETTERS,
  DEFAULT_MODE,
  DEFAULT_RADIUS,
  distanceText,
  driverLabel,
  edgeVerdict,
  LETTER_STEPS,
  MODES,
  radiusText,
  RADIUS_STEPS,
  RIDER_START,
  STEP_METRES,
  viewFor,
  type DriverResult,
  type Mode,
  type Point,
} from "../models/cell-edge";
import { useSvgTouchDrag } from "../primitives/svg-touch-drag";

const W = 420;
const H = 428;
const MAP = { x: 12, y: 46, w: 396, h: 200 };
const PILL_Y = 282;
const PILL_W = 76;
const ROW_A = 346;
const ROW_B = 392;

const r1 = (v: number) => Math.round(v * 10) / 10;

const DOT = {
  found: { disc: "fill-emerald-600 dark:fill-emerald-400", digit: "fill-white dark:fill-emerald-950" },
  missed: { disc: "fill-red-600 dark:fill-red-400", digit: "fill-white dark:fill-red-950" },
  outside: { disc: cn(NEUTRAL.doneFill, "opacity-80"), digit: "fill-card" },
} as const;

/** 24.2 beat 3: drag the rider across a box edge and see which boxes must be read to find every driver in range. */
export function CellEdgeCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const touchRef = useSvgTouchDrag<SVGGElement>();
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clipId = useId().replace(/:/g, "");
  const [letters, setLetters] = useState<number>(DEFAULT_LETTERS);
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS);
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  const [rider, setRider] = useState<Point>(RIDER_START);
  const dragging = useRef(false);

  const view = viewFor(letters, radius, MAP.w, MAP.h);
  const at = clampPoint(rider, view);
  const result = cellEdge(at, letters, radius, mode);
  const verdict = edgeVerdict(result);
  const { w: bw, h: bh } = BOX[letters];

  const sx = (x: number) => r1(MAP.x + (x - view.x0) * view.scale);
  const sy = (y: number) => r1(MAP.y + (view.y1 - y) * view.scale);

  // Box edges inside the view. A line closer than 5 units to the next is dropped so a fine grid stays readable.
  const lines = (size: number, lo: number, hi: number) => {
    const out: number[] = [];
    for (let n = Math.floor(lo / size); n <= Math.ceil(hi / size); n++) out.push(n * size);
    return out;
  };
  const dense = Math.min(bw, bh) * view.scale < 5;
  const vLines = dense ? [0] : lines(bw, view.x0, view.x1);
  const hLines = dense ? [0] : lines(bh, view.y0, view.y1);

  // The boxes read are one block of columns and rows round the rider's box.
  const k = result.rings;
  const read = {
    x0: (result.rider.col - k) * bw,
    x1: (result.rider.col + k + 1) * bw,
    y0: (result.rider.row - k) * bh,
    y1: (result.rider.row + k + 1) * bh,
  };

  const toWorld = (e: PointerEvent): Point | null => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return null;
    const p = el.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const s = p.matrixTransform(m.inverse());
    return clampPoint({ x: view.x0 + (s.x - MAP.x) / view.scale, y: view.y1 - (s.y - MAP.y) / view.scale }, view);
  };
  const follow = (e: PointerEvent) => {
    const p = toWorld(e);
    if (p) setRider({ x: Math.round(p.x), y: Math.round(p.y) });
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if (e.key === "Home") {
      e.preventDefault();
      setRider(RIDER_START);
      return;
    }
    const step = d[e.key];
    if (!step) return;
    e.preventDefault();
    setRider(clampPoint({ x: at.x + step[0] * STEP_METRES, y: at.y + step[1] * STEP_METRES }, view));
  };

  const place = `${Math.abs(Math.round(at.x))} m ${at.x < 0 ? "west" : "east"} and ${Math.abs(Math.round(at.y))} m ${at.y < 0 ? "south" : "north"} of the origin`;
  const valueText = `Rider ${place}. ${costText(result)}. ${result.drivers.map(driverLabel).join("; ")}`;
  const tone = verdict.tone;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the <b>rider</b>, then change the box size, the radius and what is read.</>}
    >
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{`${letters} letter boxes, ${bw} m by ${bh} m. Search radius ${radiusText(radius)}. ${mode === "own" ? "Only the rider's own box is read" : mode === "nine" ? "Nine boxes are read" : "Rings of boxes are read until they reach the radius"}. ${costText(result)}. ${result.drivers.map(driverLabel).join(". ")}. ${verdict.text}.`}</desc>
        <DotGrid width={W} height={H} />
        <defs>
          <clipPath id={clipId}>
            <path d={`M${MAP.x} ${MAP.y} h${MAP.w} v${MAP.h} h${-MAP.w} Z`} />
          </clipPath>
        </defs>

        {/* The map. */}
        <path d={`M${MAP.x} ${MAP.y} h${MAP.w} v${MAP.h} h${-MAP.w} Z`} className={NEUTRAL.surface} />
        <g clipPath={`url(#${clipId})`}>
          {/* The boxes that are read. */}
          <rect
            x={sx(read.x0)}
            y={sy(read.y1)}
            width={r1((read.x1 - read.x0) * view.scale)}
            height={r1((read.y1 - read.y0) * view.scale)}
            strokeWidth={2}
            className={cn(TONES.accent.softFill, TONES.accent.stroke)}
            aria-hidden
          />
          {/* Box edges; the two through the origin (the 0 degree meridian and the equator) are edges at every size. */}
          <g aria-hidden>
            {vLines.map((x) => (
              <line key={`v${x}`} x1={sx(x)} x2={sx(x)} y1={MAP.y} y2={MAP.y + MAP.h} strokeWidth={x === 0 ? 2.25 : 1} className={x === 0 ? NEUTRAL.doneStroke : NEUTRAL.faintStroke} />
            ))}
            {hLines.map((y) => (
              <line key={`h${y}`} x1={MAP.x} x2={MAP.x + MAP.w} y1={sy(y)} y2={sy(y)} strokeWidth={y === 0 ? 2.25 : 1} className={y === 0 ? NEUTRAL.doneStroke : NEUTRAL.faintStroke} />
            ))}
          </g>
          {/* The search circle. */}
          <circle cx={sx(at.x)} cy={sy(at.y)} r={r1(radius * view.scale)} strokeWidth={2.5} strokeDasharray="7 5" className={cn("fill-none", TONES.accent.stroke)} aria-hidden />
          {/* The drivers. */}
          <g aria-hidden>
            {result.drivers.map((d) => (
              <Driver key={d.id} d={d} x={sx(d.at.x)} y={sy(d.at.y)} />
            ))}
          </g>
        </g>
        <path d={`M${MAP.x} ${MAP.y} h${MAP.w} v${MAP.h} h${-MAP.w} Z`} strokeWidth={1.5} className={cn("fill-none", NEUTRAL.line)} aria-hidden />

        {/* The rider is the slider: drag on the map, or use the arrow keys. */}
        <g ref={touchRef}
          role="slider"
          tabIndex={0}
          aria-label="Rider on the map"
          aria-valuemin={Math.round(view.x0)}
          aria-valuemax={Math.round(view.x1)}
          aria-valuenow={Math.round(at.x)}
          aria-valuetext={valueText}
          className="group cursor-grab touch-none outline-none"
          onKeyDown={onKeyDown}
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            follow(e);
          }}
          onPointerMove={(e) => dragging.current && follow(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          {/* A path, not a rect, so the picture's text check does not take the tap area for a card. */}
          <path d={`M${MAP.x} ${MAP.y} h${MAP.w} v${MAP.h} h${-MAP.w} Z`} fill="none" pointerEvents="all" />
          <g aria-hidden>
            {/* A ring and no fill, so a driver standing inside it stays readable. */}
            <circle cx={sx(at.x)} cy={sy(at.y)} r={15} strokeWidth={5} opacity={0.25} className={cn("fill-none", TONES.accent.stroke)} />
            <circle cx={sx(at.x)} cy={sy(at.y)} r={13} strokeWidth={3.5} className={cn("fill-none", TONES.accent.stroke)} />
          </g>
          <rect x={MAP.x + 1.5} y={MAP.y + 1.5} width={MAP.w - 3} height={MAP.h - 3} rx={4} strokeWidth={2.5} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} aria-hidden />
        </g>

        {/* The cost of the boxes read. */}
        <text x={W / 2} y={268} textAnchor="middle" className={cn(TONES[tone].text, "text-[14px] font-bold tabular-nums")}>{costText(result)}</text>

        {/* Where each driver stands. */}
        {result.drivers.map((d, i) => (
          <DriverPill key={d.id} d={d} x={12 + i * (PILL_W + 4)} y={PILL_Y} />
        ))}

        {/* Box size, radius, and what is read. */}
        <text x={14} y={ROW_A + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>letters</text>
        <RadioChipRow
          x={68}
          y={ROW_A}
          options={LETTER_STEPS.map((n) => ({ id: String(n), text: String(n), label: `${n} letters, boxes ${BOX[n].w} m by ${BOX[n].h} m` }))}
          value={String(letters)}
          onChange={(id) => setLetters(Number(id))}
          ariaLabel="Letters in the code"
        />
        <text x={196} y={ROW_A + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>radius, km</text>
        <RadioChipRow
          x={278}
          y={ROW_A}
          options={RADIUS_STEPS.map((n) => ({ id: String(n), text: String(n / 1000), label: `Search radius ${radiusText(n)}` }))}
          value={String(radius)}
          onChange={(id) => setRadius(Number(id))}
          ariaLabel="Search radius in kilometres"
        />
        <RadioChipRow
          x={(W - chipRowWidth(MODES.map((m) => m.text))) / 2}
          y={ROW_B}
          options={MODES.map((m) => ({ id: m.id, text: m.text, label: m.label }))}
          value={mode}
          onChange={setMode}
          ariaLabel="Which boxes are read"
        />

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
    </BeatFrame>
  );
}

/** A driver on the map: green found, red missed, grey outside the circle. */
function Driver({ d, x, y }: { d: DriverResult; x: number; y: number }) {
  const style = DOT[d.status];
  return (
    <g className="transition-opacity duration-200 motion-reduce:transition-none">
      {d.status === "missed" ? <circle cx={x} cy={y} r={14} strokeWidth={2.5} className={cn("fill-none", TONES.bad.stroke)} /> : null}
      <circle cx={x} cy={y} r={8.5} className={cn(style.disc, "stroke-card")} strokeWidth={2} />
      <text x={x} y={r1(y + 4.2)} textAnchor="middle" className={cn(style.digit, "text-[11.5px] font-bold")}>{d.id.slice(1)}</text>
    </g>
  );
}

/** A small card with the driver's name, how far it is, and whether the boxes found it. */
function DriverPill({ d, x, y }: { d: DriverResult; x: number; y: number }) {
  const tone = d.status === "found" ? "good" : d.status === "missed" ? "bad" : null;
  const word = d.status === "found" ? "found" : d.status === "missed" ? "missed" : "outside";
  return (
    <g role="img" aria-label={driverLabel(d)}>
      <rect x={x} y={y} width={PILL_W} height={38} rx={12} strokeWidth={tone ? 2 : 1.5} className={cn(tone ? TONES[tone].softFill : NEUTRAL.surface, tone ? TONES[tone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
      <text x={x + PILL_W / 2} y={y + 16} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>{d.id} {distanceText(d.metres)}</text>
      <text x={x + PILL_W / 2} y={y + 31} textAnchor="middle" className={cn(tone ? TONES[tone].text : NEUTRAL.mutedText, "text-[11.5px] font-bold")}>{word}</text>
    </g>
  );
}
