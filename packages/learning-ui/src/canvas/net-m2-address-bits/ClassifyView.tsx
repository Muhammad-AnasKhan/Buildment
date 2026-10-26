"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { ADDRESS_KINDS, classifyFeedback, wrapWords, type AddressKind, type ClassifyConfig } from "../models/net-address";
import { ControlButton } from "./bit-parts";

type Props = { title: string; purpose: string; limits: string; config: ClassifyConfig };

const W = 420;
const GRID_TOP = 48;
const CHIP_W = 130;
const CHIP_H = 44;
const ROW_PITCH = 48;
const COLS = 3;
const LINE_CHARS = 50;

const BUCKETS: Record<AddressKind, { name: string; sub: string }> = {
  public: { name: "Public", sub: "reachable" },
  private: { name: "Private", sub: "RFC 1918" },
  shared: { name: "Shared", sub: "provider NAT" },
  special: { name: "Special", sub: "IANA list" },
};

type Feedback = { text: string; tone: Tone | null };

/** The classify mode: tap an address, then the kind it belongs to. A wrong try says why. */
export function ClassifyView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const addresses = config.addresses;
  const [placed, setPlaced] = useState<Record<string, AddressKind>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongTries, setWrongTries] = useState(0);
  const [wrongFor, setWrongFor] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>({ text: "Tap an address, then the kind it belongs to.", tone: null });

  const total = addresses.length;
  const done = Object.keys(placed).length;
  const rowsCount = Math.ceil(total / COLS);
  const gridBottom = GRID_TOP + rowsCount * ROW_PITCH - (ROW_PITCH - CHIP_H);
  const feedbackY = gridBottom + 8;
  const bucketsY = feedbackY + 52 + 8;
  const BUCKET_H = 62;
  const H = bucketsY + BUCKET_H + 8;
  const BUCKET_GAP = 6;
  const bucketW = (W - 16 - BUCKET_GAP * 3) / 4;

  const verdict: { text: string; tone: Tone } =
    done === total
      ? { text: `All ${total} sorted, ${wrongTries === 0 ? "no wrong tries" : `${wrongTries} wrong ${wrongTries === 1 ? "try" : "tries"}`}`, tone: wrongTries === 0 ? "good" : "accent" }
      : { text: `${done} of ${total} sorted${wrongTries ? `, ${wrongTries} wrong` : ""}`, tone: "accent" };

  const pickAddress = (ip: string) => {
    setSelected(ip);
    setWrongFor(null);
    setFeedback({ text: `${ip}: which kind is it?`, tone: null });
  };

  const pickBucket = (kind: AddressKind) => {
    if (!selected) {
      setFeedback({ text: "Tap an address first.", tone: null });
      return;
    }
    const result = classifyFeedback(selected, kind);
    if (result.right) {
      setPlaced({ ...placed, [selected]: kind });
      setFeedback({ text: result.text, tone: "good" });
      setSelected(null);
      setWrongFor(null);
    } else {
      setWrongTries(wrongTries + 1);
      setWrongFor(selected);
      setFeedback({ text: result.text, tone: "bad" });
    }
  };

  const reset = () => {
    setPlaced({});
    setSelected(null);
    setWrongTries(0);
    setWrongFor(null);
    setFeedback({ text: "Tap an address, then the kind it belongs to.", tone: null });
  };

  const countIn = (kind: AddressKind) => Object.values(placed).filter((k) => k === kind).length;
  const lines = wrapWords(feedback.text, LINE_CHARS);
  const summary = `${verdict.text}. ${feedback.text}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap an address, then its kind. A wrong try says why.</>}
      controls={<ControlButton onClick={reset}>Reset</ControlButton>}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={H} />

        {addresses.map((ip, i) => {
          const x = 8 + (i % COLS) * (CHIP_W + 7);
          const y = GRID_TOP + Math.floor(i / COLS) * ROW_PITCH;
          const kind = placed[ip];
          const on = selected === ip;
          const wrong = wrongFor === ip;
          const body = (
            <>
              <rect
                x={x}
                y={y}
                width={CHIP_W}
                height={CHIP_H}
                rx={12}
                strokeWidth={on || kind || wrong ? 2.5 : 1.5}
                className={cn(
                  kind ? cn(TONES.good.softFill, TONES.good.stroke) : wrong ? cn(TONES.bad.softFill, TONES.bad.stroke) : on ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line),
                  SHAPE_TRANSITION
                )}
              />
              <text x={x + CHIP_W / 2} y={y + (kind ? 19 : 27)} textAnchor="middle" className={cn(kind ? TONES.good.text : on ? TONES.accent.text : NEUTRAL.text, "text-[14px] font-bold tabular-nums")}>{ip}</text>
              {kind ? <text x={x + CHIP_W / 2} y={y + 36} textAnchor="middle" className={cn(TONES.good.text, "text-[13px] font-semibold")}>{BUCKETS[kind].name.toLowerCase()}</text> : null}
            </>
          );
          if (kind) {
            return (
              <g key={ip} role="img" aria-label={`${ip}, sorted as ${kind}`}>
                {body}
              </g>
            );
          }
          return (
            <SvgButton key={ip} x={x} y={y} width={CHIP_W} height={CHIP_H} rx={12} label={`Address ${ip}${wrong ? ", not that kind" : ""}`} pressed={on} onPress={() => pickAddress(ip)}>
              {body}
            </SvgButton>
          );
        })}

        {/* What the last try said, in up to two lines. */}
        <g aria-hidden="true">
          <rect
            x={8}
            y={feedbackY}
            width={W - 16}
            height={52}
            rx={14}
            strokeWidth={1.5}
            className={cn(feedback.tone ? cn(TONES[feedback.tone].softFill, TONES[feedback.tone].stroke) : cn("fill-card", NEUTRAL.line), SHAPE_TRANSITION)}
          />
          {lines.slice(0, 2).map((line, k) => (
            <text key={k} x={W / 2} y={feedbackY + 22 + k * 19} textAnchor="middle" className={cn(feedback.tone ? TONES[feedback.tone].text : NEUTRAL.mutedText, "text-[13.5px] font-semibold tabular-nums")}>
              {line}
            </text>
          ))}
        </g>

        {ADDRESS_KINDS.map((kind, k) => {
          const x = 8 + k * (bucketW + BUCKET_GAP);
          const bucket = BUCKETS[kind];
          return (
            <SvgButton
              key={kind}
              x={x}
              y={bucketsY}
              width={bucketW}
              height={BUCKET_H}
              rx={14}
              label={selected ? `Put ${selected} in ${bucket.name}, ${countIn(kind)} placed` : `${bucket.name}, ${countIn(kind)} placed. Tap an address first`}
              onPress={() => pickBucket(kind)}
            >
              <rect x={x} y={bucketsY} width={bucketW} height={BUCKET_H} rx={14} strokeWidth={selected ? 2 : 1.5} className={cn(selected ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), SHAPE_TRANSITION)} />
              <text x={x + bucketW / 2} y={bucketsY + 22} textAnchor="middle" className={cn(selected ? TONES.accent.text : NEUTRAL.text, "text-[15px] font-bold")}>{bucket.name}</text>
              <text x={x + bucketW / 2} y={bucketsY + 40} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px]")}>{bucket.sub}</text>
              <text x={x + bucketW / 2} y={bucketsY + 56} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] tabular-nums")}>{`${countIn(kind)} placed`}</text>
            </SvgButton>
          );
        })}

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}
