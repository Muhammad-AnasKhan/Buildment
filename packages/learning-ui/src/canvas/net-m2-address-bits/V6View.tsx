"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { FOCUS_RING, NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { wrapWords } from "../models/net-address";
import {
  V6_GROUPS,
  V6_GROUP_BITS,
  expandV6,
  generateV6Drill,
  groupHex,
  groupPadded,
  judgeV6,
  parseIpv6,
  shortenV6,
  standardRun,
  zeroRuns,
  type V6Config,
  type ZeroRun,
} from "../models/net-ipv6";
import { Caption, ControlButton } from "./bit-parts";
import { ChoiceButton, DrillShell, W } from "./net-parts";

type Props = { title: string; purpose: string; limits: string; config: V6Config };

/** The v6 mode: expand, shorten, tell invalid from non-standard, and a drill. */
export function V6View(props: Props) {
  switch (props.config.view) {
    case "expand":
      return <ExpandView {...props} />;
    case "shorten":
      return <ShortenView {...props} />;
    case "invalid":
      return <InvalidView {...props} />;
    case "drill":
      return <DrillShell title={props.title} purpose={props.purpose} limits={props.limits} makeItems={generateV6Drill} optionClass="text-[15px]" />;
  }
}

// ---------------------------------------------------------------- the eight slots

const SLOT_W = 46;
const SLOT_GAP = 3.5;
const SLOT_X0 = (W - (V6_GROUPS * SLOT_W + (V6_GROUPS - 1) * SLOT_GAP)) / 2;
const slotX = (i: number) => SLOT_X0 + i * (SLOT_W + SLOT_GAP);

/** One drawn group: its digits, the leading zeros that were added shown quietly. */
type Slot =
  | { kind: "group"; digits: string; padded: boolean; tone: "accent" | "faint" }
  | { kind: "gap"; count: number };

/** The eight places of an address. A `gap` stands for `count` places folded into `::`. */
function SlotRow({ slots, y }: { slots: Slot[]; y: number }) {
  let position = 0;
  return (
    <g aria-hidden="true">
      {slots.map((slot, k) => {
        const at = position;
        const span = slot.kind === "gap" ? slot.count : 1;
        position += span;
        const left = slotX(at);
        const width = span * SLOT_W + (span - 1) * SLOT_GAP;
        if (slot.kind === "gap") {
          return (
            <g key={k}>
              <rect x={left} y={y} width={width} height={44} rx={10} strokeWidth={2} strokeDasharray="5 4" className={cn("fill-card", NEUTRAL.doneStroke)} />
              <text x={left + width / 2} y={y + 30} textAnchor="middle" className={cn(NEUTRAL.text, "text-[22px] font-bold")}>::</text>
              <Caption x={left + width / 2} y={y + 62}>{`${slot.count} zero group${slot.count === 1 ? "" : "s"}`}</Caption>
            </g>
          );
        }
        const lit = slot.tone === "accent";
        const zeros = slot.padded ? Math.max(0, 4 - slot.digits.length) : 0;
        const body = slot.digits.padStart(slot.digits.length + zeros, "0");
        return (
          <g key={k}>
            <rect
              x={left}
              y={y}
              width={SLOT_W}
              height={44}
              rx={10}
              strokeWidth={lit ? 2 : 1.5}
              strokeDasharray={lit ? undefined : "5 4"}
              className={cn(lit ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn("fill-card", NEUTRAL.faintStroke), SHAPE_TRANSITION)}
            />
            <text x={left + SLOT_W / 2} y={y + 28} textAnchor="middle" className={cn(lit ? TONES.accent.text : NEUTRAL.mutedText, "text-[16px] font-bold tabular-nums")}>
              <tspan className={NEUTRAL.mutedText} fontWeight={400}>{body.slice(0, zeros)}</tspan>
              {body.slice(zeros)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Captions 1 to 8 under the places, so "which group" can be said out loud. */
function SlotNumbers({ y }: { y: number }) {
  return (
    <g aria-hidden="true">
      {Array.from({ length: V6_GROUPS }, (_, i) => (
        <Caption key={i} x={slotX(i) + SLOT_W / 2} y={y}>{i + 1}</Caption>
      ))}
    </g>
  );
}

/** A font size class that lets a whole address fit the picture. Written out so the class scanner sees them. */
const fitClass = (text: string) => (text.length <= 22 ? "text-[24px]" : text.length <= 30 ? "text-[19px]" : "text-[15px]");

function Field({ id, label, value, onChange, placeholder, error, errorId }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder: string; error: string; errorId: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={id} className="w-full text-sm font-semibold text-foreground">{label}</label>
      <input
        id={id}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={45}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        placeholder={placeholder}
        className={cn("h-11 w-full rounded-lg border border-border bg-background px-3 text-base tabular-nums text-foreground sm:h-10", FOCUS_RING)}
      />
      <p id={errorId} role="alert" className="min-h-5 w-full text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
    </div>
  );
}

// ---------------------------------------------------------------- expand

const EXPAND_H = 248;

function ExpandView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const examples = config.addresses ?? ["2001:db8:4a1:20::5c"];
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(examples[0]);
  const [shown, setShown] = useState(examples[0]);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");

  const onType = (value: string) => {
    setText(value);
    if (value === "") {
      setError("");
      return;
    }
    const parsed = parseIpv6(value);
    if (parsed.ok) {
      setError("");
      setShown(value);
    } else {
      setError(parsed.error.message);
    }
  };
  const next = () => {
    const k = (index + 1) % examples.length;
    setIndex(k);
    setText(examples[k]);
    setShown(examples[k]);
    setError("");
    setExpanded(false);
  };

  const parsed = parseIpv6(shown);
  if (!parsed.ok) return null;
  const { groups, written, compressedAt, compressedCount: k } = parsed;
  const full = expandV6(groups);

  const slots: Slot[] = [];
  if (expanded) {
    groups.forEach((g, i) => {
      const inserted = compressedAt !== null && i >= compressedAt && i < compressedAt + k;
      slots.push({ kind: "group", digits: inserted ? "0" : groupHex(g), padded: true, tone: inserted ? "faint" : "accent" });
    });
  } else {
    // As written: the groups exactly as typed, with `::` as one dashed place.
    const split = compressedAt ?? written.length;
    written.slice(0, split).forEach((d) => slots.push({ kind: "group", digits: d.toLowerCase(), padded: false, tone: "accent" }));
    if (compressedAt !== null) slots.push({ kind: "gap", count: k });
    written.slice(split).forEach((d) => slots.push({ kind: "group", digits: d.toLowerCase(), padded: false, tone: "accent" }));
  }

  const arithmetic =
    k === 0
      ? expanded
        ? "All 8 groups were written; each is padded to four digits."
        : "All 8 groups are written, so there is no :: to expand."
      : expanded
        ? `${written.length} written + ${k} zero groups = 8 groups = ${V6_GROUPS * V6_GROUP_BITS} bits`
        : `${written.length} group${written.length === 1 ? "" : "s"} written, 8 needed: :: stands for ${k}`;
  const banner: { text: string; tone: Tone } =
    k === 0 ? { text: "No ::, all eight groups are written", tone: "accent" } : { text: `:: stands for ${k} zero group${k === 1 ? "" : "s"} (${k * V6_GROUP_BITS} bits)`, tone: "accent" };
  const summary = `${shown} has ${written.length} group${written.length === 1 ? "" : "s"} written${k > 0 ? ` and :: stands for ${k} zero group${k === 1 ? "" : "s"}, ${k * V6_GROUP_BITS} bits` : ""}. Full form: ${full}.${expanded ? " Shown expanded." : ""}`;
  const fieldId = `${ids}f`;
  const errorId = `${ids}e`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Press <b>Expand</b>, then count the zero groups the <b>::</b> hid.</>}
      controls={
        <>
          <button
            type="button"
            aria-pressed={expanded}
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "h-11 rounded-full px-4 text-sm font-semibold sm:h-10",
              SHAPE_TRANSITION,
              expanded ? cn("border-l-4 ring-1 ring-inset", TONES.accent.rule, TONES.accent.chip) : "border border-border bg-card text-foreground hover:bg-muted/50",
              FOCUS_RING,
            )}
          >
            {expanded ? "Fold back" : "Expand"}
          </button>
          <ControlButton onClick={next}>Next example</ControlButton>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${EXPAND_H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={EXPAND_H} />
        <text x={W / 2} y={78} textAnchor="middle" aria-hidden="true" className={cn(NEUTRAL.text, fitClass(shown), "font-bold tabular-nums")}>{shown}</text>
        <SlotRow slots={slots} y={94} />
        <SlotNumbers y={170} />
        <text x={W / 2} y={198} textAnchor="middle" aria-hidden="true" className={cn(NEUTRAL.text, "text-[14.5px] font-bold")}>{arithmetic}</text>
        {expanded ? <text x={W / 2} y={228} textAnchor="middle" aria-hidden="true" className={cn(TONES.accent.text, fitClass(full), "font-bold tabular-nums")}>{full}</text> : null}
        <VerdictBanner width={W} text={banner.text} tone={banner.tone} />
      </svg>
      <div className="mt-2 px-1 pb-1">
        <Field id={fieldId} label="Type your own address, or use this one" value={text} onChange={onType} placeholder="2001:db8:4a1:20::5c" error={error} errorId={errorId} />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- shorten

const SHORTEN_H = 252;

function buildShort(groups: readonly number[], trimmed: boolean, run: ZeroRun | null): string {
  const fmt = trimmed ? groupHex : groupPadded;
  if (!run) return groups.map(fmt).join(":");
  return `${groups.slice(0, run.start).map(fmt).join(":")}::${groups.slice(run.start + run.length).map(fmt).join(":")}`;
}

function ShortenView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const examples = config.addresses ?? ["2001:0db8:0000:0000:0001:0000:0000:0001"];
  const [index, setIndex] = useState(0);
  const [trimmed, setTrimmed] = useState(false);
  const [runStart, setRunStart] = useState<number | null>(null);

  const parsed = parseIpv6(examples[index]);
  if (!parsed.ok) return null;
  const groups = parsed.groups;
  const runs = zeroRuns(groups);
  const std = standardRun(groups);
  const run = runStart === null ? null : (runs.find((r) => r.start === runStart) ?? null);
  const standard = shortenV6(groups);
  const result = buildShort(groups, trimmed, run);
  const judged = judgeV6(result);
  const untouched = !trimmed && run === null;
  const isStandard = result === standard;

  let banner: { text: string; tone: Tone };
  if (untouched) banner = { text: "Drop the leading zeros, then pick one run", tone: "accent" };
  else if (isStandard) banner = { text: `Standard form: ${standard}`, tone: "good" };
  else if (!trimmed) banner = { text: "Valid, but the leading zeros are still there", tone: "warn" };
  else if (run && run.length === 1) banner = { text: "Valid, but a single 0 is never ::", tone: "warn" };
  else if (run && std && run.length < std.length) banner = { text: "Valid, but the longest run is the one to fold", tone: "warn" };
  else if (run && std && run.length === std.length) banner = { text: "Valid, but the first equal run wins", tone: "warn" };
  else if (!run && std) banner = { text: "Valid, but the longest run becomes ::", tone: "warn" };
  else banner = { text: "Valid, but not the standard form", tone: "warn" };

  const slots: Slot[] = [];
  groups.forEach((g, i) => {
    if (run && i >= run.start && i < run.start + run.length) {
      if (i === run.start) slots.push({ kind: "gap", count: run.length });
      return;
    }
    slots.push({ kind: "group", digits: groupHex(g), padded: !trimmed, tone: "accent" });
  });

  const reasons = judged.status === "invalid" || isStandard ? [] : judged.reasons;
  const summary = `${banner.text}. Result: ${result}. ${reasons.join(" ")}`;
  const pickLabel = (r: ZeroRun) => (r.length === 1 ? `Group ${r.start + 1}` : `Groups ${r.start + 1} to ${r.start + r.length}`);

  const next = () => {
    setIndex((index + 1) % examples.length);
    setTrimmed(false);
    setRunStart(null);
  };

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drop the zeros in front, then choose which run of zero groups becomes <b>::</b>.</>}
      controls={
        <>
          <button
            type="button"
            aria-pressed={trimmed}
            onClick={() => setTrimmed(!trimmed)}
            className={cn(
              "h-11 rounded-full px-4 text-sm font-semibold sm:h-10",
              SHAPE_TRANSITION,
              trimmed ? cn("border-l-4 ring-1 ring-inset", TONES.accent.rule, TONES.accent.chip) : "border border-border bg-card text-foreground hover:bg-muted/50",
              FOCUS_RING,
            )}
          >
            Drop leading zeros
          </button>
          <ControlButton onClick={next}>Next address</ControlButton>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${SHORTEN_H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={SHORTEN_H} />
        <text x={W / 2} y={78} textAnchor="middle" aria-hidden="true" className={cn(NEUTRAL.mutedText, fitClass(expandV6(groups)), "font-bold tabular-nums")}>{expandV6(groups)}</text>
        <SlotRow slots={slots} y={94} />
        <SlotNumbers y={170} />
        <Caption x={W / 2} y={198}>the form you are building</Caption>
        <text x={W / 2} y={226} textAnchor="middle" aria-hidden="true" className={cn(TONES[banner.tone].text, fitClass(result), "font-bold tabular-nums")}>{result}</text>
        <VerdictBanner width={W} text={banner.text} tone={banner.tone} />
      </svg>
      <div className="mt-2 space-y-2 px-1 pb-1">
        <p className="text-sm font-semibold text-foreground">Which run of zero groups becomes ::?</p>
        <div role="group" aria-label="Runs of zero groups" className="grid gap-2 sm:grid-cols-2">
          {runs.map((r) => (
            <ChoiceButton
              key={r.start}
              label={`${pickLabel(r)}, ${r.length} zero group${r.length === 1 ? "" : "s"}${runStart === r.start ? ", chosen" : ""}`}
              pressed={runStart === r.start}
              onClick={() => setRunStart(runStart === r.start ? null : r.start)}
            >
              <span className="block text-sm font-medium">{pickLabel(r)}</span>
              <span className="block text-base font-bold">{`${r.length} zero group${r.length === 1 ? "" : "s"}`}</span>
            </ChoiceButton>
          ))}
        </div>
        {reasons.length > 0 ? (
          <ul className={cn("space-y-1 rounded-xl px-3 py-2 text-sm leading-snug ring-1 ring-inset", TONES.warn.chip)}>
            {reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- invalid

function InvalidView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const examples = config.addresses ?? ["2001:db8::1::5c"];
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(examples[0]);

  const next = () => {
    const k = (index + 1) % examples.length;
    setIndex(k);
    setText(examples[k]);
  };

  const judged = text === "" ? null : judgeV6(text);
  let banner: { text: string; tone: Tone };
  if (!judged) banner = { text: "Type an IPv6 address", tone: "accent" };
  else if (judged.status === "invalid") banner = { text: "Invalid: this is not an address", tone: "bad" };
  else if (judged.status === "nonstandard") banner = { text: "Valid, but not the standard form", tone: "warn" };
  else banner = { text: "Valid and standard", tone: "good" };

  const lines: { caption: string; text: string; tone?: Tone; mono?: boolean }[] = [];
  if (judged?.status === "invalid") {
    lines.push({ caption: "The rule it breaks", text: judged.error.message });
  } else if (judged) {
    lines.push({ caption: "Full form", text: judged.expanded, mono: true });
    lines.push({ caption: "Standard form (RFC 5952)", text: judged.standard, mono: true });
    if (judged.status === "nonstandard") lines.push({ caption: "Why it is not standard", text: judged.reasons.join(" "), tone: "warn" });
    else lines.push({ caption: "Why it is standard", text: "Lowercase, no leading zeros, the longest run of zero groups as ::." });
  }

  const summary = judged
    ? judged.status === "invalid"
      ? `${text} is invalid. ${judged.error.message}.`
      : `${text} is valid${judged.status === "nonstandard" ? " but not standard" : " and standard"}. Full form ${judged.expanded}. Standard form ${judged.standard}. ${judged.reasons.join(" ")}`
    : "Nothing typed yet.";
  const fieldId = `${ids}f`;
  const errorId = `${ids}e`;

  let y = 116;
  const drawn = lines.map((line) => {
    const wrapped = line.mono ? [line.text] : wrapWords(line.text, 52);
    const top = y;
    y += 22 + wrapped.length * 20 + 8;
    return { ...line, wrapped, top };
  });

  const height = Math.max(196, y + 6);

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Type a form, or press <b>Next example</b>.</>}
      controls={<ControlButton onClick={next}>Next example</ControlButton>}
    >
      <svg viewBox={`0 0 ${W} ${height}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={height} />
        <text x={W / 2} y={78} textAnchor="middle" aria-hidden="true" className={cn(NEUTRAL.text, fitClass(text), "font-bold tabular-nums")}>{text}</text>
        {drawn.map((line) => (
          <g key={line.caption} aria-hidden="true">
            <Caption x={12} y={line.top} anchor="start" strong>{line.caption}</Caption>
            {line.wrapped.map((row, k) => (
              <text key={k} x={12} y={line.top + 21 + k * 20} className={cn(line.tone ? TONES[line.tone].text : NEUTRAL.text, line.mono ? "text-[16px] font-semibold tabular-nums" : "text-[14.5px]")}>
                {row}
              </text>
            ))}
          </g>
        ))}
        <VerdictBanner width={W} text={banner.text} tone={banner.tone} />
      </svg>
      <div className="mt-2 px-1 pb-1">
        <Field id={fieldId} label="Type an IPv6 address" value={text} onChange={setText} placeholder="2001:db8::1::5c" error="" errorId={errorId} />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}
