"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import {
  allocateVerdict,
  allocationRows,
  allocationTotals,
  formatAddressNumber,
  placeBlock,
  usableCount,
  type AllocateConfig,
} from "../models/net-address";
import { Caption, ControlButton } from "./bit-parts";

type Props = { title: string; purpose: string; limits: string; config: AllocateConfig };

const W = 420;
const ROW_TOP = 50;
const ROW_PITCH = 46;
const ROW_H = 42;
const BAR_X = 200;
const BAR_W = 100;

const computersText = (n: number) => `${formatAddressNumber(n)} computer${n === 1 ? "" : "s"}`;

/** The allocate mode: give each organisation a block, see what is left unused and how many routes it costs. */
export function AllocateView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const [picks, setPicks] = useState<(number | null)[]>(() => config.orgs.map(() => null));
  const [selected, setSelected] = useState(0);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const rows = allocationRows(config, picks);
  const totals = allocationTotals(config, picks);
  const verdict = allocateVerdict(config, picks, refusal);
  const n = config.orgs.length;
  const labelOf = (prefix: number) => config.choices.find((c) => c.prefix === prefix)?.label ?? `/${prefix}`;

  const rowsBottom = ROW_TOP + n * ROW_PITCH - (ROW_PITCH - ROW_H);
  const summaryY = rowsBottom + 8;
  const captionY = summaryY + 46 + 18;
  const chipsY = captionY + 8;
  const H = chipsY + 44 + 8;

  const choose = (prefix: number) => {
    const result = placeBlock(config, picks, selected, prefix);
    setNote(result.message);
    if (result.refused) {
      setRefusal(result.message);
      return;
    }
    setRefusal(null);
    const next = [...result.picks];
    setPicks(next);
    // Move on to the next organisation that has no block yet.
    for (let step = 1; step < n; step += 1) {
      const k = (selected + step) % n;
      if (next[k] === null) {
        setSelected(k);
        break;
      }
    }
  };

  const reset = () => {
    setPicks(config.orgs.map(() => null));
    setSelected(0);
    setRefusal(null);
    setNote("");
  };

  const org = config.orgs[selected];
  const wide = config.choices.length <= 3;
  const chipGap = wide ? 8 : 3;
  const chipW = (W - 16 - chipGap * (config.choices.length - 1)) / config.choices.length;

  const summary = `${verdict.text}. ${totals.placed} of ${n} placed, ${formatAddressNumber(totals.unused)} addresses unused, ${totals.routes} routing table ${totals.routes === 1 ? "entry" : "entries"}.${note ? ` ${note}.` : ""}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap a row, then the block to give it. Aim for the least unused.</>}
      controls={<ControlButton onClick={reset}>Reset</ControlButton>}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={H} />

        {rows.map((row, i) => {
          const y = ROW_TOP + i * ROW_PITCH;
          const on = selected === i;
          const refused = refusal !== null && on;
          const usedFraction = row.usable ? Math.min(1, row.need / row.usable) : 0;
          const label = `${row.name}, needs ${computersText(row.need)}, ${row.prefix === null ? "no block yet" : `${labelOf(row.prefix)}, ${formatAddressNumber(row.usable ?? 0)} usable, ${formatAddressNumber(row.unused ?? 0)} unused`}`;
          return (
            <SvgButton key={row.name} x={8} y={y} width={W - 16} height={ROW_H} rx={12} label={label} pressed={on} onPress={() => { setSelected(i); setRefusal(null); }}>
              <rect
                x={8}
                y={y}
                width={W - 16}
                height={ROW_H}
                rx={12}
                strokeWidth={on ? 2.5 : 1.5}
                className={cn(refused ? cn(TONES.bad.softFill, TONES.bad.stroke) : on ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), SHAPE_TRANSITION)}
              />
              <text x={20} y={y + 18} className={cn(NEUTRAL.text, "text-[14px] font-bold")}>{row.name}</text>
              <text x={20} y={y + 35} className={cn(NEUTRAL.mutedText, "text-[13px] tabular-nums")}>{computersText(row.need)}</text>
              <rect x={136} y={y + 8} width={58} height={26} rx={13} strokeWidth={1.5} strokeDasharray={row.prefix === null ? "4 3" : undefined} className={cn(row.prefix === null ? cn(NEUTRAL.surface, NEUTRAL.faintStroke) : cn(TONES.accent.softFill, TONES.accent.stroke))} />
              <text x={165} y={y + 26} textAnchor="middle" className={cn(row.prefix === null ? NEUTRAL.mutedText : TONES.accent.text, "text-[13px] font-bold tabular-nums")}>
                {row.prefix === null ? "pick" : labelOf(row.prefix)}
              </text>
              {row.prefix !== null && !refused ? (
                <>
                  <rect x={BAR_X} y={y + 16} width={BAR_W} height={10} rx={5} className={cn(TONES.warn.softFill, TONES.warn.stroke)} strokeWidth={1} />
                  <rect x={BAR_X} y={y + 16} width={Math.max(4, BAR_W * usedFraction)} height={10} rx={5} className={TONES.accent.solidFill} />
                  <text x={W - 16} y={y + 26} textAnchor="end" className={cn(NEUTRAL.text, "text-[13px] font-semibold tabular-nums")}>
                    {`${formatAddressNumber(row.unused ?? 0)} unused`}
                  </text>
                </>
              ) : null}
              {refused ? (
                <>
                  <X x={BAR_X} y={y + 13} width={16} height={16} strokeWidth={3} aria-hidden className={cn("fill-none", TONES.bad.stroke)} />
                  <text x={BAR_X + 22} y={y + 26} className={cn(TONES.bad.text, "text-[13px] font-semibold")}>too small</text>
                </>
              ) : null}
            </SvgButton>
          );
        })}

        {/* The two totals: what is wasted, and what every router must remember. */}
        <g aria-hidden="true">
          <rect x={8} y={summaryY} width={W - 16} height={46} rx={14} strokeWidth={1.5} className={cn("fill-card", NEUTRAL.line)} />
          <Caption x={20} y={summaryY + 18} anchor="start">total unused</Caption>
          <text x={20} y={summaryY + 39} className={cn(totals.placed ? TONES.warn.text : NEUTRAL.mutedText, "text-[20px] font-bold tabular-nums")}>
            {formatAddressNumber(totals.unused)}
          </text>
          <Caption x={232} y={summaryY + 18} anchor="start">routing table entries</Caption>
          <text x={232} y={summaryY + 39} className={cn(NEUTRAL.text, "text-[20px] font-bold tabular-nums")}>{totals.routes}</text>
        </g>

        <Caption x={W / 2} y={captionY}>{`${org.name}, ${computersText(org.need)}: usable under each block`}</Caption>
        {config.choices.map((choice, k) => {
          const x = 8 + k * (chipW + chipGap);
          const usable = usableCount(choice.prefix);
          const current = picks[selected] === choice.prefix;
          return (
            <SvgButton
              key={choice.prefix}
              x={x}
              y={chipsY}
              width={chipW}
              height={44}
              rx={12}
              label={`Give ${org.name} ${choice.label}, ${formatAddressNumber(usable)} usable`}
              pressed={current}
              onPress={() => choose(choice.prefix)}
            >
              <rect x={x} y={chipsY} width={chipW} height={44} rx={12} strokeWidth={current ? 2.5 : 1.5} className={cn(current ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), SHAPE_TRANSITION)} />
              <text x={x + chipW / 2} y={chipsY + 19} textAnchor="middle" className={cn(current ? TONES.accent.text : NEUTRAL.text, "text-[14px] font-bold tabular-nums")}>{choice.label}</text>
              <text x={x + chipW / 2} y={chipsY + 36} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] tabular-nums")}>{formatAddressNumber(usable)}</text>
            </SvgButton>
          );
        })}

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}
