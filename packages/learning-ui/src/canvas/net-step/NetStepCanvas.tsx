"use client";

import { useId, useMemo, useRef, useState, type RefObject } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { FOCUS_RING, NEUTRAL, TONES } from "../primitives/tones";
import { ControlButton, useReducedMotion } from "../net-m2-address-bits/bit-parts";
import {
  MARGIN,
  awaitingPick,
  canNext,
  choose,
  currentIndex,
  isLast,
  liveSummary,
  next,
  packetTitle,
  parseNetStep,
  pickResult,
  stageOf,
  startOver,
  startState,
  stepWord,
  type NetPick,
  type NetStepData,
  type NetStepSpec,
  type NetStepState,
} from "../models/net-step";
import { PICK_PLACEHOLDER, LINE_H, captionLinesOf, flowChips, layoutNetStep, markerAt, type NetStepLayout } from "./layout";
import { DeviceCard, FieldChip, LinkLine, PacketMarker, TableView, Tray } from "./parts";
import { useRide } from "./use-ride";

export type NetStepCanvasProps = {
  title: string;
  purpose: string;
  limits: string;
  /** Plain data, checked by the schema in models/net-step.ts. */
  data: NetStepData;
};

const FADE_IN = "animate-in fade-in duration-700 motion-reduce:animate-none";

const OPTION_BASE = "min-h-11 rounded-lg border px-3 py-2 text-left text-[13px] font-semibold leading-5 transition-colors motion-reduce:transition-none";
const OPTION_IDLE = "border-border bg-card text-foreground hover:bg-muted";
const OPTION_RIGHT = cn("border-emerald-600 dark:border-emerald-400", TONES.good.chip, "disabled:opacity-100");
const OPTION_WRONG = cn("border-red-600 dark:border-red-400", TONES.bad.chip, "disabled:opacity-100");
const OPTION_REST = "border-border bg-muted/40 text-muted-foreground disabled:opacity-100";

type PickPanelProps = { pick: NetPick; choice: number | null; onPick: (option: number) => void };

/** The prediction: option cards the learner taps before the step plays, then whether it was right and why. */
function PickPanel({ pick, choice, onPick }: PickPanelProps) {
  const answered = choice !== null;
  const result = answered ? pickResult(pick, choice) : null;
  return (
    <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
      <p className="m-0 text-sm font-semibold leading-snug text-foreground">
        <span className="mr-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground ring-1 ring-border">Predict</span>
        {pick.prompt}
      </p>
      <div role="group" aria-label="Pick what you expect" className="mt-2 grid gap-2 sm:grid-cols-3">
        {pick.options.map((option, o) => {
          const isPick = choice === o;
          const tag = !answered ? "" : option.correct ? (isPick ? "Your pick, right" : "Right answer") : isPick ? "Your pick, not right" : "";
          return (
            <button
              key={option.label}
              type="button"
              disabled={answered}
              aria-pressed={isPick}
              onClick={() => onPick(o)}
              className={cn(OPTION_BASE, FOCUS_RING, !answered ? OPTION_IDLE : option.correct ? OPTION_RIGHT : isPick ? OPTION_WRONG : OPTION_REST)}
            >
              {option.label}
              {tag ? <span className="block text-xs font-medium">{tag}</span> : null}
            </button>
          );
        })}
      </div>
      {result ? (
        <p className={cn("m-0 mt-2 text-sm font-semibold leading-snug", result.right ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300")}>{result.text}</p>
      ) : (
        <p className="m-0 mt-2 text-sm text-muted-foreground">The step plays after you pick.</p>
      )}
    </div>
  );
}

type PictureProps = {
  title: string;
  purpose: string;
  spec: NetStepSpec;
  layout: NetStepLayout;
  state: NetStepState;
  /** 0 to 1: how far the packet has travelled along its link. */
  ride: number;
  svgRef: RefObject<SVGSVGElement | null>;
};

/** The picture: caption, devices and links, the packet tray, tables and the verdict. */
function Picture({ title, purpose, spec, layout, state, ride, svgRef }: PictureProps) {
  const ids = useId().replace(/:/g, "");
  const stage = stageOf(spec, state);
  const step = spec.steps[currentIndex(state)];
  const waiting = awaitingPick(spec, state);
  const active = stage.active;
  const captionLines = waiting ? [PICK_PLACEHOLDER] : captionLinesOf(step.caption);

  const litLinks = new Set<number>(active?.highlight?.links ?? []);
  if (active?.packet) litLinks.add(active.packet.at);
  const litDevices = new Set<string>(active?.highlight?.devices ?? []);
  for (const c of stage.changed) {
    const device = spec.tables?.find((t) => t.id === c.table)?.device;
    if (device) litDevices.add(device);
  }
  const packet = active?.packet;
  const link = packet ? layout.links[packet.at] : undefined;
  const marker = packet && link ? markerAt(link, packet.reverse === true, ride) : null;
  const chips = packet && layout.tray ? flowChips(packet.fields, layout.tray.box.x + 8, layout.tray.chipsY, layout.tray.box.w - 16).chips : [];

  return (
    <svg ref={svgRef} viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
      <title id={`${ids}t`}>{title}</title>
      <desc id={`${ids}d`}>{`${purpose} ${liveSummary(spec, state)}`}</desc>
      <DotGrid width={layout.width} height={layout.height} />

      <text x={MARGIN} y={layout.stepLineY} className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold")}>
        {stepWord(spec, state)}
      </text>
      {captionLines.map((line, i) => (
        <text key={i} x={MARGIN} y={layout.captionY + i * LINE_H} className={cn(NEUTRAL.text, "text-[13px] font-medium")}>
          {line}
        </text>
      ))}

      {layout.links.map((l) => (
        <LinkLine key={l.index} link={l} lit={litLinks.has(l.index)} />
      ))}
      {layout.devices.map((d) => (
        <DeviceCard key={d.id} box={d} lit={litDevices.has(d.id)} />
      ))}
      {marker ? <PacketMarker x={marker.x} y={marker.y} /> : null}

      {layout.tray ? (
        <g>
          <Tray box={layout.tray.box} titleY={layout.tray.titleY} empty={!packet} title={packet ? packetTitle(spec, packet) : "No packet on a link in this step"} />
          {packet ? (
            <g key={`chips-${stage.activeIndex}`} className={FADE_IN}>
              {chips.map((c) => (
                <FieldChip key={c.index} box={c} field={packet.fields[c.index]} />
              ))}
            </g>
          ) : null}
        </g>
      ) : null}

      {layout.tables.map((geom) => {
        const table = spec.tables!.find((t) => t.id === geom.id)!;
        const lit = (active?.highlight?.rows ?? []).filter((r) => r.table === table.id).map((r) => r.row);
        return <TableView key={geom.id} geom={geom} table={table} rows={stage.tables[table.id] ?? []} changed={stage.changed} lit={lit} />;
      })}

      {layout.bannerY !== null && active?.verdict ? <VerdictBanner width={layout.width} y={layout.bannerY} text={active.verdict.text} tone={active.verdict.tone} /> : null}
    </svg>
  );
}

type ViewProps = Omit<NetStepCanvasProps, "data"> & {
  spec: NetStepSpec;
  state: NetStepState;
  ride?: number;
  svgRef?: RefObject<SVGSVGElement | null>;
  onNext: () => void;
  onStartOver: () => void;
  onPick: (option: number) => void;
};

/** The canvas as a picture of its state. NetStepCanvas holds the state; the tests render this directly. */
export function NetStepView({ title, purpose, limits, spec, state, ride = 1, svgRef, onNext, onStartOver, onPick }: ViewProps) {
  const fallbackRef = useRef<SVGSVGElement>(null);
  const layout = useMemo(() => layoutNetStep(spec), [spec]);
  const i = currentIndex(state);
  const step = spec.steps[i];
  const waiting = awaitingPick(spec, state);
  const hint = waiting
    ? "Pick what you expect. The step plays after you pick."
    : isLast(spec, state)
      ? "That was the last step. Start over to play it again."
      : "Press Next to play the next step.";

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={hint}
      controls={
        <>
          <ControlButton onClick={onNext} disabled={!canNext(spec, state)}>
            Next
          </ControlButton>
          <ControlButton onClick={onStartOver}>Start over</ControlButton>
        </>
      }
    >
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveSummary(spec, state)}
      </div>
      <Picture title={title} purpose={purpose} spec={spec} layout={layout} state={state} ride={ride} svgRef={svgRef ?? fallbackRef} />
      {step.pick ? <PickPanel pick={step.pick} choice={state.choices[i]} onPick={onPick} /> : null}
    </BeatFrame>
  );
}

function Player({ title, purpose, limits, spec }: Omit<NetStepCanvasProps, "data"> & { spec: NetStepSpec }) {
  const [state, setState] = useState<NetStepState>(() => startState(spec));
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const stage = stageOf(spec, state);
  const playKey = stage.active?.packet ? String(stage.activeIndex) : null;
  const ride = useRide(playKey, reduced, svgRef);
  return (
    <NetStepView
      title={title}
      purpose={purpose}
      limits={limits}
      spec={spec}
      state={state}
      ride={ride}
      svgRef={svgRef}
      onNext={() => setState((s) => next(spec, s))}
      onStartOver={() => setState(startOver(spec))}
      onPick={(option) => setState((s) => choose(spec, s, option))}
    />
  );
}

/** The platform's quiet note for a canvas that cannot be shown. */
export function NetStepUnavailable() {
  return (
    <div role="note" className="not-prose my-8 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      This interactive part is not available right now. The text around it explains the same idea.
    </div>
  );
}

/**
 * The `[netstep]` beat renderer: a few devices on links, a packet that rides a
 * link with its header chips, tables that fill step by step, and a prediction
 * the learner makes before a step plays. The data is checked by the schema in
 * models/net-step.ts; invalid data renders the quiet note, never a crash.
 */
export function NetStepCanvas({ title, purpose, limits, data }: NetStepCanvasProps) {
  const parsed = useMemo(() => parseNetStep(data), [data]);
  if (!parsed.ok) return <NetStepUnavailable />;
  return <Player title={title} purpose={purpose} limits={limits} spec={parsed.spec} />;
}
