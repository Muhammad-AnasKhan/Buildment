"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import { formatAddressNumber, prefixFacts, prefixNote, type Bits, type PrefixConfig } from "../models/net-address";
import { Caption, ControlButton } from "./bit-parts";

type Props = { title: string; purpose: string; limits: string; config: PrefixConfig };

const W = 420;
const H = 412;
const CELL = 11;
const PITCH = 11.78;
const BYTE_GAP = 9;
const X0 = 8;
const RAIL_X0 = 34;
const RAIL_X1 = 386;
const RAIL_Y = 352;

/** Left edge of bit cell i of 32: eight to a byte, a small gap between bytes. */
const cellX = (i: number) => X0 + i * PITCH + Math.floor(i / 8) * BYTE_GAP;

type RowProps = { bits: Bits; y: number; prefix: number };

/** Thirty-two small bit cells. The network part (the first n) is tinted and every digit is printed, so colour is never the only signal. */
function BitRow({ bits, y, prefix }: RowProps) {
  return (
    <g aria-hidden="true">
      {bits.map((bit, i) => {
        const network = i < prefix;
        return (
          <g key={i}>
            <rect
              x={cellX(i)}
              y={y}
              width={CELL}
              height={24}
              rx={4}
              strokeWidth={network ? 1.5 : 1}
              className={cn(network ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), SHAPE_TRANSITION)}
            />
            <text x={cellX(i) + CELL / 2} y={y + 17} textAnchor="middle" className={cn(network ? TONES.accent.text : NEUTRAL.mutedText, "text-[13px] font-bold tabular-nums")}>
              {bit}
            </text>
          </g>
        );
      })}
    </g>
  );
}

type FactProps = { x: number; y: number; w: number; caption: string; value: string };

function Fact({ x, y, w, caption, value }: FactProps) {
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={w} height={44} rx={12} strokeWidth={1.5} className={cn("fill-card", NEUTRAL.line)} />
      <Caption x={x + 12} y={y + 17} anchor="start">{caption}</Caption>
      <text x={x + 12} y={y + 37} className={cn(NEUTRAL.text, "text-[17px] font-bold tabular-nums")}>{value}</text>
    </g>
  );
}

/** The prefix mode: one address, one slider for the prefix length, and everything the length decides. */
export function PrefixView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [prefix, setPrefix] = useState(config.initial);

  const { min, max } = config;
  const ladder = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const facts = prefixFacts(config.address, prefix);
  const clamp = (p: number) => Math.max(min, Math.min(max, Math.round(p)));
  const fraction = (prefix - min) / (max - min);
  const railX = (f: number) => RAIL_X0 + f * (RAIL_X1 - RAIL_X0);
  const handleX = railX(fraction);

  const sizeText = formatAddressNumber(facts.size);
  const verdictText = `/${prefix}: ${sizeText} address${facts.size === 1 ? "" : "es"}, mask ${facts.mask}`;
  const summary = `Prefix /${prefix} on ${facts.address}: mask ${facts.mask}, ${sizeText} addresses, ${formatAddressNumber(facts.usable)} usable, from ${facts.first} to ${facts.last}. ${prefixNote(prefix)}.`;

  // The line between the network part and the host part, between cells prefix-1 and prefix.
  const divider = prefix > 0 && prefix < 32 ? (cellX(prefix - 1) + CELL + cellX(prefix)) / 2 : null;
  const networkMid = (cellX(0) + cellX(Math.max(prefix, 1) - 1) + CELL) / 2;
  const hostBits = 32 - prefix;
  const hostMid = hostBits >= 5 ? (cellX(prefix) + cellX(31) + CELL) / 2 : null;

  const marks = [16, 24].filter((p) => p > min && p < max);

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the knob, or step. Try <b>/31</b> and <b>/32</b>.</>}
      controls={
        <>
          <ControlButton onClick={() => setPrefix(clamp(prefix - 1))} disabled={prefix <= min}>Shorter prefix</ControlButton>
          <ControlButton onClick={() => setPrefix(clamp(prefix + 1))} disabled={prefix >= max}>Longer prefix</ControlButton>
        </>
      }
    >
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={H} />

        <text x={W / 2} y={74} textAnchor="middle" aria-hidden="true" className={cn(NEUTRAL.text, "text-[26px] font-bold tabular-nums")}>
          {facts.address}
          <tspan className={TONES.accent.text}>{`/${prefix}`}</tspan>
        </text>

        <Caption x={X0} y={98} anchor="start">address bits</Caption>
        <BitRow bits={facts.addressBits} y={104} prefix={prefix} />
        <Caption x={X0} y={146} anchor="start">mask bits</Caption>
        <text x={W - 8} y={146} textAnchor="end" aria-hidden="true" className={cn(TONES.accent.text, "text-[14px] font-bold tabular-nums")}>{facts.mask}</text>
        <BitRow bits={facts.maskBits} y={152} prefix={prefix} />

        {divider !== null ? <line x1={divider} x2={divider} y1={98} y2={182} strokeWidth={2} strokeLinecap="round" aria-hidden="true" className={TONES.accent.stroke} /> : null}
        <Caption x={networkMid} y={200}>network</Caption>
        {hostMid !== null ? <Caption x={hostMid} y={200}>host</Caption> : hostBits > 0 ? <Caption x={W - 8} y={200} anchor="end">host</Caption> : null}

        <Fact x={8} y={212} w={198} caption="block size" value={sizeText} />
        <Fact x={214} y={212} w={198} caption="usable" value={formatAddressNumber(facts.usable)} />
        <Fact x={8} y={262} w={198} caption="first address" value={facts.first} />
        <Fact x={214} y={262} w={198} caption="last address" value={facts.last} />
        <Caption x={W / 2} y={324}>{prefixNote(prefix)}</Caption>

        <RailSlider
          svgRef={svgRef}
          x0={RAIL_X0}
          x1={RAIL_X1}
          y={RAIL_Y}
          label="Prefix length"
          valueText={`/${prefix}, ${sizeText} addresses`}
          value={prefix}
          ladder={ladder}
          fromFraction={(f) => clamp(min + f * (max - min))}
          onChange={(p) => setPrefix(clamp(p))}
        >
          <g aria-hidden="true">
            <line x1={RAIL_X0} x2={RAIL_X1} y1={RAIL_Y} y2={RAIL_Y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
            <line x1={RAIL_X0} x2={handleX} y1={RAIL_Y} y2={RAIL_Y} strokeWidth={6} strokeLinecap="round" className={TONES.accent.stroke} />
            {ladder.map((p) => (
              <line key={p} x1={railX((p - min) / (max - min))} x2={railX((p - min) / (max - min))} y1={RAIL_Y - 4} y2={RAIL_Y + 4} strokeWidth={1} className={NEUTRAL.faintStroke} />
            ))}
            {marks.map((p) => (
              <text key={p} x={railX((p - min) / (max - min))} y={RAIL_Y + 33} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-medium tabular-nums")}>{`/${p}`}</text>
            ))}
            <text x={RAIL_X0} y={RAIL_Y + 53} textAnchor="start" className={cn(NEUTRAL.mutedText, "text-[13px] tabular-nums")}>{`/${min}`}</text>
            <text x={RAIL_X1} y={RAIL_Y + 53} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[13px] tabular-nums")}>{`/${max}`}</text>
            <text x={W / 2} y={RAIL_Y + 53} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>prefix length</text>
            <circle cx={handleX} cy={RAIL_Y} r={17} className={TONES.accent.softFill} />
            <circle cx={handleX} cy={RAIL_Y} r={11} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={2.5} />
            <line x1={handleX - 3} x2={handleX - 3} y1={RAIL_Y - 4.5} y2={RAIL_Y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
            <line x1={handleX + 3} x2={handleX + 3} y1={RAIL_Y - 4.5} y2={RAIL_Y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
          </g>
        </RailSlider>

        <VerdictBanner width={W} text={verdictText} tone="accent" />
      </svg>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}
