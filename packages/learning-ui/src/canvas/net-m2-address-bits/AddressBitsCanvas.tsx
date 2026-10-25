"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { FOCUS_RING, NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import {
  BYTE_PLACES,
  DEFAULT_ADDRESS,
  DEFAULT_BYTE_BITS,
  bitsToByte,
  byteToBits,
  carrySteps,
  flipAddressBit,
  formatAddressNumber,
  numberToIp,
  numberToParts,
  parseIpv4,
  placesOn,
  sumText,
  toggleBit,
  ipToNumber,
  type Bits,
  type ParseError,
} from "../models/net-address";
import { BitCard, Caption, ControlButton, bitName, useReducedMotion, useTimers } from "./bit-parts";
import { DrillView } from "./DrillView";

export type AddressMode = "byte" | "address" | "drill";

export type AddressBitsProps = {
  title: string;
  purpose: string;
  limits: string;
  mode: AddressMode;
};

/** The address renderer: one component, three modes (byte, address, drill). */
export function AddressBitsCanvas({ mode, title, purpose, limits }: AddressBitsProps) {
  if (mode === "byte") return <ByteView title={title} purpose={purpose} limits={limits} />;
  if (mode === "address") return <AddressView title={title} purpose={purpose} limits={limits} />;
  return <DrillView title={title} purpose={purpose} limits={limits} />;
}

type ViewProps = { title: string; purpose: string; limits: string };

const W = 420;
const STEP_MS = 190;

/** The words for what is on: "Value 23. Bits on: 16, 4, 2, 1." */
const byteSummary = (bits: Bits) => {
  const on = placesOn(bits);
  return `Value ${bitsToByte(bits)}. ${on.length ? `Bits on: ${on.join(", ")}.` : "No bits on."}`;
};

// ---------------------------------------------------------------- byte

const BYTE_H = 268;
const BYTE_X0 = 14;
const BYTE_PITCH = 44;
const BYTE_CARD = 40;

function ByteView({ title, purpose, limits }: ViewProps) {
  const ids = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const timers = useTimers();
  const [bits, setBits] = useState<Bits>(DEFAULT_BYTE_BITS);
  const [overflow, setOverflow] = useState(false);
  const [ghostLit, setGhostLit] = useState(false);
  const [flash, setFlash] = useState<number | null>(null);
  const [pending, setPending] = useState<{ result: Bits; overflow: boolean } | null>(null);

  /** Finish a running carry at once, so a quick tap never fights the ripple. */
  const settle = (): { bits: Bits; overflow: boolean } => {
    timers.clear();
    setGhostLit(false);
    setFlash(null);
    if (!pending) return { bits, overflow };
    setPending(null);
    setBits(pending.result);
    setOverflow(pending.overflow);
    return { bits: pending.result, overflow: pending.overflow };
  };

  const flip = (index: number) => {
    const base = settle();
    setBits(toggleBit(base.bits, index));
    setOverflow(false);
    setFlash(index);
    timers.later(260, () => setFlash(null));
  };

  const addOne = () => {
    const base = settle();
    const { steps, overflow: carryOut, result } = carrySteps(base.bits);
    setOverflow(false);
    if (reduced) {
      setBits(result);
      setOverflow(carryOut);
      return;
    }
    setPending({ result, overflow: carryOut });
    let current = base.bits;
    steps.forEach((step, k) => {
      timers.later((k + 1) * STEP_MS, () => {
        current = current.map((b, i) => (i === step.index ? step.bit : b)) as unknown as Bits;
        setBits(current);
        setFlash(step.index);
      });
    });
    timers.later((steps.length + 1) * STEP_MS, () => {
      setFlash(null);
      setPending(null);
      setOverflow(carryOut);
      if (carryOut) {
        setGhostLit(true);
        timers.later(700, () => setGhostLit(false));
      }
    });
  };

  const reset = () => {
    timers.clear();
    setPending(null);
    setBits(DEFAULT_BYTE_BITS);
    setOverflow(false);
    setGhostLit(false);
    setFlash(null);
  };

  const value = bitsToByte(bits);
  const verdict: { text: string; tone: Tone } = overflow
    ? { text: "256 needs a ninth bit. A byte has eight.", tone: "warn" }
    : value === 255
      ? { text: "255: the biggest number one byte can hold", tone: "good" }
      : { text: `${value} in one byte`, tone: "accent" };
  const equation = sumText(bits);
  const chipText = placesOn(bits).length ? equation : "no bits on";
  const chipW = Math.min(W - 16, chipText.length * 8.2 + 32);
  const summary = `${byteSummary(bits)}${overflow ? " Every bit is back to 0." : ""}`;

  const cardX = (i: number) => BYTE_X0 + BYTE_PITCH * (i + 1);
  const rowY = 76;
  const rowH = 52;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap the bits. Then turn them all on and press <b>Add 1</b>.</>}
      controls={
        <>
          <ControlButton onClick={addOne}>Add 1</ControlButton>
          <ControlButton onClick={reset}>Reset</ControlButton>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${BYTE_H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${byteSummary(bits)}`}</desc>
        <DotGrid width={W} height={BYTE_H} />

        {/* The ghost ninth card: where a carry out of 255 would have to go. */}
        <Caption x={BYTE_X0 + BYTE_CARD / 2} y={rowY - 8}>256</Caption>
        <g aria-hidden="true">
          <rect
            x={BYTE_X0}
            y={rowY}
            width={BYTE_CARD}
            height={rowH}
            rx={10}
            strokeWidth={ghostLit ? 2.5 : 1.5}
            strokeDasharray={ghostLit ? undefined : "5 4"}
            className={cn(ghostLit ? cn(TONES.warn.softFill, TONES.warn.stroke) : cn("fill-card", NEUTRAL.faintStroke), SHAPE_TRANSITION)}
          />
          {ghostLit ? (
            <text x={BYTE_X0 + BYTE_CARD / 2} y={rowY + rowH / 2 + 8} textAnchor="middle" className={cn(TONES.warn.text, "text-[22px] font-bold")}>
              1
            </text>
          ) : null}
        </g>
        <Caption x={BYTE_X0} y={rowY + rowH + 22} anchor="start">
          no ninth bit
        </Caption>

        {BYTE_PLACES.map((place, i) => (
          <g key={place}>
            <Caption x={cardX(i) + BYTE_CARD / 2} y={rowY - 8}>{place}</Caption>
            <BitCard
              x={cardX(i)}
              y={rowY}
              w={BYTE_CARD}
              h={rowH}
              bit={bits[i]}
              label={bitName(place, bits[i])}
              onPress={() => flip(i)}
              flash={flash === i}
              digitClass="text-[22px]"
            />
          </g>
        ))}

        {/* The running sum, under the cards, then the value in a large card. */}
        <g aria-hidden="true">
          <rect x={(W - chipW) / 2} y={170} width={chipW} height={28} rx={14} strokeWidth={1.5} className={cn("fill-card", NEUTRAL.line)} />
          <text x={W / 2} y={189} textAnchor="middle" className={cn(NEUTRAL.text, "text-[14px] font-semibold tabular-nums")}>
            {chipText}
          </text>
          <rect x={W / 2 - 74} y={208} width={148} height={48} rx={14} strokeWidth={2} className={cn(TONES.accent.softFill, TONES.accent.stroke)} />
          <text x={W / 2} y={241} textAnchor="middle" className={cn(TONES.accent.text, "text-[28px] font-bold tabular-nums")}>
            {`= ${value}`}
          </text>
        </g>

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
      <p className="sr-only" role="status" aria-live="polite">{`${summary} ${verdict.text}.`}</p>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- address

const ADDR_H = 364;
const ROW_X = 66;
const ROW_PITCH = 43;
const ROW_CARD = 39;
const ROW_TOP = 108;
const ROW_STEP = 46;
const ROW_H = 40;

function AddressView({ title, purpose, limits }: ViewProps) {
  const ids = useId().replace(/:/g, "");
  const timers = useTimers();
  const [n, setN] = useState(() => ipToNumber(DEFAULT_ADDRESS));
  const [text, setText] = useState(DEFAULT_ADDRESS);
  const [error, setError] = useState<ParseError | null>(null);
  const [touched, setTouched] = useState(false);
  const [flashRow, setFlashRow] = useState<number | "all" | null>(null);
  const [flashBit, setFlashBit] = useState<number | null>(null);

  const lit = (row: number | "all") => {
    setFlashRow(row);
    setFlashBit(null);
    timers.clear();
    timers.later(700, () => { setFlashRow(null); setFlashBit(null); });
  };

  const flip = (row: number, i: number) => {
    const next = flipAddressBit(n, row * 8 + i);
    setN(next);
    setText(numberToIp(next));
    setError(null);
    lit(row);
    setFlashBit(row * 8 + i);
  };

  const onType = (value: string) => {
    setText(value);
    if (value.trim() === "") {
      setError(null);
      return;
    }
    const parsed = parseIpv4(value.trim());
    if (parsed.ok) {
      setError(null);
      setN(parsed.number);
      lit("all");
    } else {
      setError(parsed.error);
    }
  };

  const reset = () => {
    timers.clear();
    setN(ipToNumber(DEFAULT_ADDRESS));
    setText(DEFAULT_ADDRESS);
    setError(null);
    setTouched(false);
    setFlashRow(null);
    setFlashBit(null);
  };

  const parts = numberToParts(n);
  const dotted = numberToIp(n);
  const formatted = formatAddressNumber(n);
  // "Four parts" is expected while the learner is still typing, so it waits for Enter or leaving the field.
  const shownError = error && (error.kind !== "parts" || touched) ? error.message : "";
  const summary = `Address ${dotted} is the number ${formatted}. Bytes: ${parts.join(", ")}.`;
  const fieldId = `${ids}f`;
  const errorId = `${ids}e`;

  const rowTop = (row: number) => ROW_TOP + row * ROW_STEP;
  const pulse = (row: number) => flashRow === "all" || flashRow === row;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Flip the last bit, then type your own address.</>}
      controls={
        <>
          <form
            className="flex w-full flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setTouched(true);
            }}
          >
            <label htmlFor={fieldId} className="w-full text-sm font-semibold text-foreground">
              Type an address, for example your own from 1.3
            </label>
            <input
              id={fieldId}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={15}
              value={text}
              onChange={(e) => onType(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={shownError ? true : undefined}
              aria-describedby={shownError ? errorId : undefined}
              placeholder="192.168.1.23"
              className={cn("h-11 w-48 rounded-lg border border-border bg-background px-3 text-base tabular-nums text-foreground sm:h-10", FOCUS_RING)}
            />
            <ControlButton onClick={reset}>Reset</ControlButton>
            <p id={errorId} role="alert" className="min-h-5 w-full text-sm font-medium text-red-700 dark:text-red-300">
              {shownError}
            </p>
          </form>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${ADDR_H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={ADDR_H} />

        {/* The dotted form people write, above the bits. */}
        <text x={W / 2} y={74} textAnchor="middle" aria-hidden="true" className={cn(flashRow ? TONES.accent.text : NEUTRAL.text, "text-[26px] font-bold tabular-nums transition-colors duration-200 motion-reduce:transition-none")}>
          {dotted}
        </text>

        {BYTE_PLACES.map((place, i) => (
          <Caption key={place} x={ROW_X + i * ROW_PITCH + ROW_CARD / 2} y={ROW_TOP - 8}>{place}</Caption>
        ))}

        {parts.map((part, row) => {
          const rowBits = byteToBits(part);
          return (
            <g key={row}>
              <g aria-hidden="true">
                <rect x={10} y={rowTop(row)} width={48} height={ROW_H} rx={10} strokeWidth={pulse(row) ? 2.5 : 1.5} className={cn(pulse(row) ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn("fill-card", NEUTRAL.line), SHAPE_TRANSITION)} />
                <text x={34} y={rowTop(row) + 27} textAnchor="middle" className={cn(pulse(row) ? TONES.accent.text : NEUTRAL.text, "text-[18px] font-bold tabular-nums")}>
                  {part}
                </text>
              </g>
              {rowBits.map((bit, i) => (
                <BitCard
                  key={i}
                  x={ROW_X + i * ROW_PITCH}
                  y={rowTop(row)}
                  w={ROW_CARD}
                  h={ROW_H}
                  bit={bit}
                  label={`Byte ${row + 1}, ${bitName(BYTE_PLACES[i], bit).toLowerCase()}`}
                  onPress={() => flip(row, i)}
                  flash={flashBit === row * 8 + i}
                  digitClass="text-[20px]"
                />
              ))}
            </g>
          );
        })}

        {/* The same 32 bits read as one number. */}
        <g aria-hidden="true">
          <rect x={60} y={298} width={300} height={56} rx={14} strokeWidth={2} className={cn(flashRow ? TONES.accent.softFill : "fill-card", flashRow ? TONES.accent.stroke : NEUTRAL.line, SHAPE_TRANSITION)} />
          <Caption x={W / 2} y={317}>the same 32 bits as one number</Caption>
          <text x={W / 2} y={344} textAnchor="middle" className={cn(flashRow ? TONES.accent.text : NEUTRAL.text, "text-[26px] font-bold tabular-nums transition-colors duration-200 motion-reduce:transition-none")}>
            {formatted}
          </text>
        </g>

        <VerdictBanner width={W} text={`${dotted} is the number ${formatted}`} tone="accent" />
      </svg>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}
