"use client";

import { useId, useState, type ComponentType, type SVGProps } from "react";
import { CreditCard, Mail, Package, RotateCw, Truck, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { RadioChipRow, chipRowWidth } from "../primitives/radio-chip-row";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import {
  DEFAULTS,
  FAIL_OPTIONS,
  STEPS,
  cardCounter,
  sagaState,
  sagaSummary,
  stockCounter,
  type Fail,
  type StepId,
} from "../models/saga-fail";

const W = 420;
const H = 376;
const CARD_W = 84;
const GAP = 18;
const LEFT = 15;
const CARD_H = 86;
const ROW1_Y = 54;
const UNDO_Y = 172;
const UNDO_H = 70;
const COUNT_Y = 274;
const CAPTION_Y = 322;
const CHIPS_Y = 350;
const STEP_MS = 190;

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>;
const ICONS: Record<StepId, Icon> = { 1: Package, 2: CreditCard, 3: Truck, 4: Mail };

const left = (id: StepId) => LEFT + (id - 1) * (CARD_W + GAP);

const SOLID_TEXT = {
  good: "fill-white dark:fill-emerald-950",
  bad: "fill-white dark:fill-red-950",
} as const;
const SOLID_ICON = {
  good: "stroke-white dark:stroke-emerald-950",
  bad: "stroke-white dark:stroke-red-950",
} as const;

/** One step card in the top row: green when it ran, red when it failed, dashed when it never started. */
function StepCard({ id, state, undone, pressed, onPress }: { id: StepId; state: "done" | "failed" | "skipped"; undone: boolean; pressed: boolean; onPress: () => void }) {
  const step = STEPS[id - 1];
  const IconCmp = ICONS[id];
  const x = left(id);
  const solid = state !== "skipped";
  const tone = state === "failed" ? "bad" : "good";
  const textClass = solid ? SOLID_TEXT[tone] : NEUTRAL.mutedText;
  const status = state === "failed" ? "failed" : state === "skipped" ? "not run" : undone ? "undone" : "done";
  return (
    <SvgButton x={x} y={ROW1_Y} width={CARD_W} height={CARD_H} label={`Step ${id}, ${step.action}: ${status}. Press to make this step fail.`} pressed={pressed} onPress={onPress}>
      <rect x={x} y={ROW1_Y + 3} width={CARD_W} height={CARD_H} rx={14} className="fill-foreground/[0.06]" />
      <rect
        x={x}
        y={ROW1_Y}
        width={CARD_W}
        height={CARD_H}
        rx={14}
        strokeWidth={solid ? 2 : 1.5}
        strokeDasharray={solid ? undefined : "5 4"}
        className={cn("transition-colors duration-200 motion-reduce:transition-none", solid ? cn(TONES[tone].solidFill, TONES[tone].stroke) : cn(NEUTRAL.surface, NEUTRAL.faintStroke))}
      />
      <IconCmp x={x + 10} y={ROW1_Y + 9} width={20} height={20} strokeWidth={2.25} className={cn("fill-none", solid ? SOLID_ICON[tone] : "stroke-muted-foreground")} aria-hidden />
      <text x={x + CARD_W - 12} y={ROW1_Y + 24} textAnchor="end" className={cn(textClass, "text-[14px] font-bold tabular-nums")}>{id}</text>
      <text x={x + 10} y={ROW1_Y + 48} className={cn(textClass, "text-[13px] font-bold")}>{step.lines[0]}</text>
      <text x={x + 10} y={ROW1_Y + 62} className={cn(textClass, "text-[13px] font-bold")}>{step.lines[1]}</text>
      <text x={x + 10} y={ROW1_Y + 78} className={cn(textClass, "text-[11.5px] font-semibold")}>{status}</text>
    </SvgButton>
  );
}

/** An undo (or retry) card that slides in under its step, with its place in the order. */
function UndoCard({ id, lines, order, shown, tone, retry }: { id: StepId; lines: readonly [string, string]; order: number; shown: boolean; tone: Tone; retry?: boolean }) {
  const x = left(id);
  const IconCmp = retry ? RotateCw : Undo2;
  const t = TONES[tone];
  return (
    <g
      aria-hidden={!shown}
      style={{ opacity: shown ? 1 : 0, transform: `translateY(${shown ? 0 : -16}px)`, transitionDelay: shown ? `${order * STEP_MS}ms` : "0ms" }}
      className="transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none"
    >
      <line x1={x + CARD_W / 2} x2={x + CARD_W / 2} y1={ROW1_Y + CARD_H + 5} y2={UNDO_Y - 3} strokeWidth={2} strokeDasharray="3 4" className={t.stroke} />
      <rect x={x} y={UNDO_Y + 3} width={CARD_W} height={UNDO_H} rx={14} className="fill-foreground/[0.06]" />
      <rect x={x} y={UNDO_Y} width={CARD_W} height={UNDO_H} rx={14} strokeWidth={2} className={cn(t.softFill, t.stroke)} />
      <IconCmp x={x + 10} y={UNDO_Y + 9} width={18} height={18} strokeWidth={2.25} className={cn("fill-none", t.stroke)} aria-hidden />
      {retry ? null : (
        <>
          <circle cx={x + CARD_W - 17} cy={UNDO_Y + 17} r={11} className={t.solidFill} />
          <text x={x + CARD_W - 17} y={UNDO_Y + 21.5} textAnchor="middle" className="fill-white text-[12.5px] font-bold tabular-nums dark:fill-blue-950">{order + 1}</text>
        </>
      )}
      <text x={x + 10} y={UNDO_Y + 47} className={cn(t.text, "text-[13px] font-bold")}>{lines[0]}</text>
      <text x={x + 10} y={UNDO_Y + 61} className={cn(t.text, "text-[13px] font-bold")}>{lines[1]}</text>
    </g>
  );
}

/** An arrow in the gap between two undo cards, pointing left (newest first). */
function UndoArrow({ from, shown, order }: { from: StepId; shown: boolean; order: number }) {
  const xr = left(from) - 2;
  const xl = left((from - 1) as StepId) + CARD_W + 2;
  const y = UNDO_Y + UNDO_H / 2;
  return (
    <g aria-hidden style={{ opacity: shown ? 1 : 0, transitionDelay: shown ? `${order * STEP_MS}ms` : "0ms" }} className="transition-opacity duration-300 motion-reduce:transition-none">
      <line x1={xr} x2={xl + 5} y1={y} y2={y} strokeWidth={2.5} strokeLinecap="round" className={TONES.accent.stroke} />
      <polygon points={`${xl},${y} ${xl + 8},${y - 5} ${xl + 8},${y + 5}`} className={TONES.accent.solidFill} />
    </g>
  );
}

/** 14.3 beat: tap the step that fails and watch the undo steps run, newest first. */
export function SagaFailCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [fail, setFail] = useState<Fail>(DEFAULTS.fail);
  const [undoOn, setUndoOn] = useState<boolean>(DEFAULTS.undoOn);
  const titleId = useId();
  const descId = useId();
  const s = sagaState(fail, undoOn);
  const pick = (id: StepId) => setFail(fail === id ? 0 : id);
  const countTone: Tone = s.consistent ? "good" : "bad";
  const stockTone: Tone = s.consistent ? "good" : "bad";
  const chipsX = (W - chipRowWidth(FAIL_OPTIONS.map((o) => o.text))) / 2;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap the step that fails. Then switch the <b>undo steps</b> off to see what is left behind.</>}
      controls={
        <BeatChoice
          label="Undo steps"
          options={[
            { id: "on", label: "Undo steps: on" },
            { id: "off", label: "Undo steps: off" },
          ]}
          value={undoOn ? "on" : "off"}
          onChange={(v) => setUndoOn(v === "on")}
        />
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{sagaSummary(s)}</desc>
        <DotGrid width={W} height={H} />
        <g role="status" aria-live="polite">
          <VerdictBanner width={W} text={s.verdict.text} tone={s.verdict.tone} />
        </g>

        {STEPS.map((step) => (
          <StepCard key={step.id} id={step.id} state={s.cards[step.id]} undone={s.undone.includes(step.id)} pressed={fail === step.id} onPress={() => pick(step.id)} />
        ))}

        {STEPS.map((step) =>
          step.undoLines ? (
            <UndoCard key={`u${step.id}`} id={step.id} lines={step.undoLines} order={Math.max(0, s.undone.indexOf(step.id))} shown={s.undone.includes(step.id)} tone="accent" />
          ) : (
            <UndoCard key={`u${step.id}`} id={step.id} lines={["Retry", "receipt"]} order={0} shown={s.retry} tone="warn" retry />
          )
        )}
        {([3, 2] as const).map((id) => (
          <UndoArrow key={`a${id}`} from={id} shown={s.undone.includes(id) && s.undone.includes((id - 1) as StepId)} order={Math.max(0, s.undone.indexOf(id)) + 1} />
        ))}

        <g role="status" aria-live="polite">
          {[
            { text: cardCounter(s), tone: countTone, x: 68 },
            { text: stockCounter(s), tone: stockTone, x: 228 },
          ].map((c) => (
            <g key={c.x}>
              <rect x={c.x} y={COUNT_Y - 15} width={124} height={30} rx={15} strokeWidth={1.75} className={cn(TONES[c.tone].softFill, TONES[c.tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
              <text x={c.x + 62} y={COUNT_Y + 4.8} textAnchor="middle" className={cn(TONES[c.tone].text, "text-[13px] font-bold tabular-nums")}>{c.text}</text>
            </g>
          ))}
        </g>

        <text x={14} y={CAPTION_Y} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Which step fails</text>
        <RadioChipRow
          x={chipsX}
          y={CHIPS_Y}
          options={FAIL_OPTIONS.map((o) => ({ id: String(o.id), text: o.text, label: o.label }))}
          value={String(fail)}
          onChange={(v) => setFail(Number(v) as Fail)}
          ariaLabel="Which step fails"
        />
      </svg>
    </BeatFrame>
  );
}
