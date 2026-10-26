"use client";

import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { VerdictBanner } from "../primitives/svg-parts";
import { SvgButton } from "../primitives/svg-button";
import { NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import { compare, findField, litFields, packetSummary } from "../models/net-packet";
import { FieldCard, LiveCard } from "./cards";
import type { ChangeConfig, InspectConfig, LinesConfig } from "./config";
import { MARGIN, OUTER_W, VIEW_W, WORD_PAD_X, WORD_ROW_H, flowWords, layoutPacket } from "./layout";
import { PacketBands, type ChipState } from "./PacketBands";
import { PacketSvg } from "./PacketSvg";

// The three modes where the learner taps fields: inspect (one real packet),
// lines (pick a recorded tcpdump line) and change (pick another destination).

export type ViewProps<C> = { title: string; purpose: string; limits: string; config: C };

/** Where the bands start: under the verdict banner. */
const BANDS_TOP = 50;
const BOTTOM_PAD = 10;

// ---------------------------------------------------------------- inspect

export function InspectView({ title, purpose, limits, config }: ViewProps<InspectConfig>) {
  const [sel, setSel] = useState(config.initial);
  const layout = useMemo(() => layoutPacket(config.packet, { top: BANDS_TOP }), [config.packet]);
  const field = findField(config.packet, sel) ?? findField(config.packet, config.initial);
  return (
    <BeatFrame label={title} limits={limits} hint="Tap any field to see what it is and who set it.">
      <PacketSvg title={title} purpose={purpose} summary={packetSummary(config.packet)} height={Math.ceil(layout.bottom) + BOTTOM_PAD}>
        <PacketBands packet={config.packet} layout={layout} chipState={(id) => ({ selected: id === sel })} onChip={setSel} />
        <VerdictBanner width={VIEW_W} text={config.verdict} tone="accent" />
      </PacketSvg>
      <LiveCard summary={config.verdict}>{field ? <FieldCard field={field} /> : null}</LiveCard>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- lines

const SELECTOR_Y = 50;
const SELECTOR_H = 40;
const SELECTOR_GAP = 7;
const PANEL_TOP = SELECTOR_Y + SELECTOR_H + 8;
const PANEL_PAD = 10;
const WORDS_OFFSET = 28;

export function LinesView({ title, purpose, limits, config }: ViewProps<LinesConfig>) {
  const [index, setIndex] = useState(0);
  const lines = config.lines;
  const line = lines[index];
  const lit = useMemo(() => litFields(line.segments), [line]);
  const [sel, setSel] = useState(lit[0]);

  // One geometry for all lines, so the picture never changes height when the learner picks another line.
  const geometry = useMemo(() => {
    const flows = lines.map((l) => flowWords(l.segments, MARGIN + PANEL_PAD, OUTER_W - 2 * PANEL_PAD));
    const panelH = WORDS_OFFSET + Math.max(...flows.map((f) => f.rows)) * WORD_ROW_H + 8;
    const bandsTop = PANEL_TOP + panelH + 10;
    const layouts = lines.map((l) => layoutPacket(l.packet, { top: bandsTop, hidePayload: true }));
    const height = Math.ceil(Math.max(...layouts.map((l) => l.bottom))) + BOTTOM_PAD;
    return { flows, panelH, layouts, height };
  }, [lines]);

  const pick = (i: number) => {
    setIndex(i);
    setSel(litFields(lines[i].segments)[0]);
  };

  const { words } = geometry.flows[index];
  const verdict = `${line.title}: ${lit.length} words are fields`;
  const field = findField(line.packet, sel);
  const buttonW = (OUTER_W - 2 * SELECTOR_GAP) / 3;
  const stateOf = (id: string): ChipState => ({ selected: id === sel, tone: lit.includes(id) ? "accent" : undefined });

  return (
    <BeatFrame label={title} limits={limits} hint="Tap a line, then a lit field, to match words to fields.">
      <PacketSvg title={title} purpose={purpose} summary={`${line.title}. ${packetSummary(line.packet)}`} height={geometry.height}>
        {lines.map((l, i) => {
          const x = MARGIN + i * (buttonW + SELECTOR_GAP);
          const on = i === index;
          return (
            <SvgButton key={l.id} x={x} y={SELECTOR_Y} width={buttonW} height={SELECTOR_H} rx={12} label={`Capture line ${i + 1}, ${l.title}`} pressed={on} onPress={() => pick(i)}>
              <rect
                x={x}
                y={SELECTOR_Y}
                width={buttonW}
                height={SELECTOR_H}
                rx={12}
                strokeWidth={on ? 2.5 : 1.5}
                className={cn(on ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), SHAPE_TRANSITION)}
              />
              <text x={x + buttonW / 2} y={SELECTOR_Y + 25} textAnchor="middle" aria-hidden="true" className={cn(on ? TONES.accent.text : NEUTRAL.text, "text-[13px] font-bold")}>
                {`${i + 1}. ${l.title}`}
              </text>
            </SvgButton>
          );
        })}

        {/* The recorded line, word by word. The words that are fields light up. */}
        <g aria-hidden="true">
          <rect x={MARGIN} y={PANEL_TOP} width={OUTER_W} height={geometry.panelH} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <text x={MARGIN + PANEL_PAD} y={PANEL_TOP + 19} className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>
            {`tcpdump -n -v -e, line ${index + 1} (time left off)`}
          </text>
          {words.map((w, i) => {
            const isField = Boolean(w.field);
            const chosen = w.field !== undefined && w.field === sel;
            const y = PANEL_TOP + WORDS_OFFSET + w.y;
            return (
              <g key={`${index}-${i}`}>
                {isField ? (
                  <rect x={w.x} y={y} width={w.w} height={w.h} rx={5} strokeWidth={chosen ? 2.5 : 1} className={cn(TONES.accent.softFill, TONES.accent.stroke, SHAPE_TRANSITION)} />
                ) : null}
                <text x={w.x + WORD_PAD_X} y={y + 15} className={cn(isField ? TONES.accent.text : NEUTRAL.mutedText, "font-mono text-[13px]", isField && "font-semibold")}>
                  {w.text}
                </text>
              </g>
            );
          })}
        </g>

        <PacketBands packet={line.packet} layout={geometry.layouts[index]} chipState={stateOf} onChip={setSel} />
        <VerdictBanner width={VIEW_W} text={verdict} tone="accent" />
      </PacketSvg>
      <LiveCard summary={`${verdict}. ${line.what}`}>
        <p className="mt-2 text-sm text-foreground">{line.what}</p>
        {field ? <FieldCard field={field} /> : null}
      </LiveCard>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- change

const PICKER_H = 46;
const PICKER_GAP = 8;
const CHANGE_TOP = BANDS_TOP + PICKER_H + 10;
/** "changed" is the longest note a chip in this picture carries. */
const CHANGED_CHARS = 7;

export function ChangeView({ title, purpose, limits, config }: ViewProps<ChangeConfig>) {
  const [index, setIndex] = useState(0);
  const [sel, setSel] = useState(config.initial);
  const [base, other] = config.options;
  const option = config.options[index];

  const reserve = useMemo(() => Object.fromEntries(compare(base.packet, other.packet).changed.map((id) => [id, CHANGED_CHARS])), [base, other]);
  const layouts = useMemo(() => config.options.map((o) => layoutPacket(o.packet, { top: CHANGE_TOP, noteChars: reserve })), [config.options, reserve]);
  const diff = compare(base.packet, option.packet);
  const shown = (ids: string[]) => ids.filter((id) => !findField(base.packet, id)?.absent).length;
  const verdict = index === 0 ? `The ping as recorded, to ${option.address}` : `${shown(diff.changed)} changed, ${shown(diff.same)} stayed the same`;
  const height = Math.ceil(Math.max(...layouts.map((l) => l.bottom))) + BOTTOM_PAD;
  const buttonW = (OUTER_W - PICKER_GAP) / 2;

  const field = findField(option.packet, sel);
  const before = findField(base.packet, sel);
  const aside = field && before && diff.changed.includes(sel) ? `changed, was ${before.value}` : undefined;
  const stateOf = (id: string): ChipState => (diff.changed.includes(id) ? { selected: id === sel, tone: "warn", note: "changed" } : { selected: id === sel });

  return (
    <BeatFrame label={title} limits={limits} hint="Pick the other computer and watch which fields change.">
      <PacketSvg title={title} purpose={purpose} summary={`Ping ${option.address}. ${packetSummary(option.packet)}`} height={height}>
        {config.options.map((o, i) => {
          const x = MARGIN + i * (buttonW + PICKER_GAP);
          const on = i === index;
          return (
            <SvgButton key={o.id} x={x} y={BANDS_TOP} width={buttonW} height={PICKER_H} rx={12} label={`Ping ${o.address}, ${o.note}`} pressed={on} onPress={() => setIndex(i)}>
              <rect
                x={x}
                y={BANDS_TOP}
                width={buttonW}
                height={PICKER_H}
                rx={12}
                strokeWidth={on ? 2.5 : 1.5}
                className={cn(on ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), SHAPE_TRANSITION)}
              />
              <g aria-hidden="true">
                <text x={x + 12} y={BANDS_TOP + 20} className={cn(on ? TONES.accent.text : NEUTRAL.text, "text-[14px] font-bold tabular-nums")}>
                  {`Ping ${o.address}`}
                </text>
                <text x={x + 12} y={BANDS_TOP + 38} className={cn(on ? TONES.accent.text : NEUTRAL.mutedText, "text-[13px] font-medium")}>
                  {o.note}
                </text>
              </g>
            </SvgButton>
          );
        })}
        <PacketBands packet={option.packet} layout={layouts[index]} chipState={stateOf} onChip={setSel} />
        <VerdictBanner width={VIEW_W} text={verdict} tone={index === 0 ? "accent" : "warn"} />
      </PacketSvg>
      <LiveCard summary={verdict}>{field ? <FieldCard field={field} aside={aside} /> : null}</LiveCard>
    </BeatFrame>
  );
}
