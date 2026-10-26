"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { FOCUS_RING, NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import {
  BYTE_PLACES,
  byteToBits,
  flipAddressBit,
  formatAddressNumber,
  ipToNumber,
  maskNumber,
  numberToBits,
  numberToParts,
  parseIpv4,
  wrapWords,
  type ParseError,
} from "../models/net-address";
import {
  andBits,
  andWorking,
  cutByteIndex,
  generateMaskDrill,
  hostPartOf,
  localCheck,
  roleInBlock,
  subnetFacts,
  withHostPart,
  type MaskConfig,
} from "../models/net-subnet";
import { Caption, ControlButton } from "./bit-parts";
import { BitButton, BitStrip, DrillShell, Fact, NativeRange, RowCaption, StaticBit, VerdictChip, W, byteMid, stripX } from "./net-parts";

type Props = { title: string; purpose: string; limits: string; config: MaskConfig };

/** The mask-and mode: five views of the same rule, address AND mask. */
export function MaskView(props: Props) {
  switch (props.config.view) {
    case "bits":
      return <BitsView {...props} />;
    case "and":
      return <AndView {...props} />;
    case "broadcast":
      return <BroadcastView {...props} />;
    case "wide":
      return <WideView {...props} />;
    case "drill":
      return <DrillShell title={props.title} purpose={props.purpose} limits={props.limits} makeItems={generateMaskDrill} />;
  }
}

const bitsOf = (n: number) => numberToBits(n);

// ---------------------------------------------------------------- bits: the mask marks the network part

const BITS_H = 304;

function BitsView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const address = config.address ?? "10.20.143.7";
  const min = config.min ?? 8;
  const max = config.max ?? 32;
  const [prefix, setPrefix] = useState(config.prefix ?? 20);
  const clamp = (p: number) => Math.max(min, Math.min(max, Math.round(p)));

  const n = ipToNumber(address);
  const f = subnetFacts(n, prefix);
  const parts = numberToParts(n);
  const maskParts = numberToParts(maskNumber(prefix));
  const hostBits = 32 - prefix;
  const summary = `Address ${address} with the mask ${f.mask}: the first ${prefix} bits are the network part and the last ${hostBits} are the host part. The block holds ${formatAddressNumber(f.size)} addresses.`;
  const verdict = `${prefix} network bits, ${hostBits} host bit${hostBits === 1 ? "" : "s"}`;

  const divider = prefix > 0 && prefix < 32 ? (stripX(prefix - 1) + 11 + stripX(prefix)) / 2 : null;
  const networkMid = (stripX(0) + stripX(Math.max(prefix, 1) - 1) + 11) / 2;
  const hostMid = (stripX(Math.min(prefix, 31)) + stripX(31) + 11) / 2;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Change the length. The 1s of the mask cover the network part.</>}
      controls={
        <>
          <ControlButton onClick={() => setPrefix(clamp(prefix - 1))} disabled={prefix <= min}>Shorter prefix</ControlButton>
          <ControlButton onClick={() => setPrefix(clamp(prefix + 1))} disabled={prefix >= max}>Longer prefix</ControlButton>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${BITS_H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={BITS_H} />

        <text x={W / 2} y={74} textAnchor="middle" aria-hidden="true" className={cn(NEUTRAL.text, "text-[26px] font-bold tabular-nums")}>
          {address}
          <tspan className={TONES.accent.text}>{`/${prefix}`}</tspan>
        </text>

        <Caption x={8} y={100} anchor="start">address</Caption>
        {parts.map((part, k) => (
          <text key={`a${k}`} x={byteMid(k)} y={119} textAnchor="middle" aria-hidden="true" className={cn(NEUTRAL.text, "text-[14px] font-bold tabular-nums")}>{part}</text>
        ))}
        <BitStrip bits={bitsOf(n)} y={125} tinted={prefix} />

        <Caption x={8} y={172} anchor="start">mask</Caption>
        {maskParts.map((part, k) => (
          <text key={`m${k}`} x={byteMid(k)} y={191} textAnchor="middle" aria-hidden="true" className={cn(TONES.accent.text, "text-[14px] font-bold tabular-nums")}>{part}</text>
        ))}
        <BitStrip bits={bitsOf(maskNumber(prefix))} y={197} tinted={prefix} />

        {divider !== null ? (
          <g aria-hidden="true">
            <line x1={divider} x2={divider} y1={122} y2={152} strokeWidth={2} strokeLinecap="round" className={TONES.accent.stroke} />
            <line x1={divider} x2={divider} y1={195} y2={225} strokeWidth={2} strokeLinecap="round" className={TONES.accent.stroke} />
          </g>
        ) : null}
        {prefix > 0 ? <Caption x={prefix >= 6 ? networkMid : 8} y={246} anchor={prefix >= 6 ? "middle" : "start"}>network part</Caption> : null}
        {hostBits > 0 ? <Caption x={hostBits >= 6 ? hostMid : W - 8} y={246} anchor={hostBits >= 6 ? "middle" : "end"}>host part</Caption> : null}

        <text x={W / 2} y={274} textAnchor="middle" aria-hidden="true" className={cn(NEUTRAL.text, "text-[17px] font-bold tabular-nums")}>{`mask ${f.mask}`}</text>
        <Caption x={W / 2} y={294}>{`${formatAddressNumber(f.size)} address${f.size === 1 ? "" : "es"} in the block`}</Caption>

        <VerdictBanner width={W} text={verdict} tone="accent" />
      </svg>
      <div className="mt-2 px-1 pb-1">
        <NativeRange
          label="Prefix length"
          valueText={`/${prefix}, mask ${f.mask}`}
          value={prefix}
          min={min}
          max={max}
          onChange={(p) => setPrefix(clamp(p))}
          minLabel={`/${min}`}
          maxLabel={`/${max}`}
        />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- and: flip address bits, read the network

function AndView({ title, purpose, limits, config }: Props) {
  const prefix = config.prefix ?? 20;
  const start = ipToNumber(config.address ?? "10.20.143.7");
  const [n, setN] = useState(start);
  const [active, setActive] = useState<number>(cutByteIndex(prefix));

  const f = subnetFacts(n, prefix);
  const parts = numberToParts(n);
  const maskParts = numberToParts(maskNumber(prefix));
  const netParts = numberToParts(f.networkNumber);
  const addressBits = byteToBits(parts[active]);
  const maskBits = byteToBits(maskParts[active]);
  const resultBits = andBits(addressBits, maskBits);
  const working = andWorking(n, prefix, active);
  const text = `${f.address} AND ${f.mask} = ${f.network}`;
  const summary = `${text}. Byte ${active + 1}: ${working}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Flip a bit under a 1 of the mask, then one under a 0.</>}
      controls={
        <ControlButton
          onClick={() => {
            setN(start);
            setActive(cutByteIndex(prefix));
          }}
        >
          Reset
        </ControlButton>
      }
    >
      <div className="space-y-3 px-1 py-1">
        <VerdictChip text={text} tone="accent" />

        <div className="grid grid-cols-[4.5rem_repeat(4,minmax(0,1fr))] items-stretch gap-x-2 gap-y-1">
          <div aria-hidden="true" className="text-[13px] font-medium text-muted-foreground">
            <p className="h-6 leading-6">&nbsp;</p>
            <p className="h-8 leading-8">address</p>
            <p className="h-8 leading-8">mask</p>
            <p className="h-8 leading-8">network</p>
          </div>
          {parts.map((part, k) => (
            <button
              key={k}
              type="button"
              aria-pressed={active === k}
              aria-label={`Byte ${k + 1}: address ${part}, mask ${maskParts[k]}, network ${netParts[k]}. Show its bits.`}
              onClick={() => setActive(k)}
              className={cn(
                "rounded-xl px-1 text-center tabular-nums",
                SHAPE_TRANSITION,
                active === k ? cn("border-l-4 ring-1 ring-inset", TONES.accent.rule, TONES.accent.chip) : "border border-border bg-card text-foreground hover:bg-muted/50",
                FOCUS_RING,
              )}
            >
              <span className="block h-6 text-[13px] font-medium leading-6 text-muted-foreground">{`Byte ${k + 1}`}</span>
              <span className="block h-8 text-lg font-bold leading-8">{part}</span>
              <span className="block h-8 text-lg leading-8">{maskParts[k]}</span>
              <span className="block h-8 text-lg font-bold leading-8">{netParts[k]}</span>
            </button>
          ))}
        </div>

        <div>
          <div aria-hidden="true" className="grid grid-cols-8 gap-1">
            {BYTE_PLACES.map((place) => (
              <span key={place} className="text-center text-[13px] tabular-nums text-muted-foreground">{place}</span>
            ))}
          </div>
          <RowCaption>{`Address, byte ${active + 1}: tap a bit to flip it`}</RowCaption>
          <div role="group" aria-label={`Address bits of byte ${active + 1}`} className="grid grid-cols-8 gap-1">
            {addressBits.map((bit, i) => (
              <BitButton
                key={i}
                bit={bit}
                label={`Byte ${active + 1}, bit worth ${BYTE_PLACES[i]}, ${bit === 1 ? "on" : "off"}, ${maskBits[i] === 1 ? "under a 1 of the mask, kept" : "under a 0 of the mask, cleared"}`}
                onPress={() => setN(flipAddressBit(n, active * 8 + i))}
              />
            ))}
          </div>
          <RowCaption>{`Mask, byte ${active + 1}: ${maskParts[active]}`}</RowCaption>
          <div className="grid grid-cols-8 gap-1">
            {maskBits.map((bit, i) => (
              <StaticBit key={i} bit={bit} lit={bit === 1} />
            ))}
          </div>
          <RowCaption>{`Address AND mask, byte ${active + 1}: ${netParts[active]}`}</RowCaption>
          <div className="grid grid-cols-8 gap-1">
            {resultBits.map((bit, i) => (
              <StaticBit key={i} bit={bit} lit={bit === 1} />
            ))}
          </div>
        </div>
        <p className="text-sm leading-snug tabular-nums text-foreground">{working}</p>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- broadcast: host bits all 1

function BroadcastView({ title, purpose, limits, config }: Props) {
  const prefix = config.prefix ?? 20;
  const start = ipToNumber(config.address ?? "10.20.143.7");
  const [n, setN] = useState(start);

  const f = subnetFacts(n, prefix);
  const hostBits = 32 - prefix;
  const role = roleInBlock(n, prefix);
  const allOnes = hostPartOf(n, prefix) === 2 ** hostBits - 1;
  const allZero = hostPartOf(n, prefix) === 0;
  const bits = bitsOf(n);

  let verdict: { text: string; tone: Tone };
  if (prefix === 32) verdict = { text: "A /32 is one address: network, broadcast and host in one", tone: "accent" };
  else if (prefix === 31) verdict = { text: `A /31: both addresses are hosts, there is no broadcast`, tone: "accent" };
  else if (role === "network") verdict = { text: "All host bits are 0: the network address, not for a host", tone: "accent" };
  else if (role === "broadcast") verdict = { text: "All host bits are 1: the broadcast, not for a host", tone: "accent" };
  else verdict = { text: `${f.address} is a host: it lies between the two`, tone: "good" };

  const byteRows = [0, 1, 2, 3].filter((k) => k * 8 + 7 >= prefix);
  const summary = `${verdict.text}. Network ${f.network}, broadcast ${f.broadcast ?? "none"}, first host ${f.firstHost}, last host ${f.lastHost}. ${hostBits} host bit${hostBits === 1 ? "" : "s"}, ${formatAddressNumber(f.size)} addresses, ${formatAddressNumber(f.hostCount)} usable.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Flip host bits. Then set them all to 1.</>}
      controls={
        <>
          <ControlButton onClick={() => setN(withHostPart(f.networkNumber, prefix, 2 ** hostBits - 1))} disabled={hostBits === 0 || allOnes}>All host bits 1</ControlButton>
          <ControlButton onClick={() => setN(f.networkNumber)} disabled={hostBits === 0 || allZero}>All host bits 0</ControlButton>
        </>
      }
    >
      <div className="space-y-3 px-1 py-1">
        <VerdictChip text={verdict.text} tone={verdict.tone} />
        <p className="text-center text-[26px] font-bold leading-tight tabular-nums text-foreground">
          {f.address}
          <span className="text-muted-foreground">{`/${prefix}`}</span>
        </p>

        <div className="space-y-3">
          {byteRows.map((k) => (
            <div key={k}>
              <RowCaption>{prefix <= k * 8 ? `Byte ${k + 1}: all host bits` : `Byte ${k + 1}: the first ${prefix - k * 8} bits (dashed) are the network`}</RowCaption>
              <div role="group" aria-label={`Byte ${k + 1} bits`} className="grid grid-cols-8 gap-1">
                {bits.slice(k * 8, k * 8 + 8).map((bit, i) => {
                  const index = k * 8 + i;
                  return index < prefix ? (
                    <StaticBit key={i} bit={bit} fixed />
                  ) : (
                    <BitButton key={i} bit={bit} label={`Byte ${k + 1}, bit worth ${BYTE_PLACES[i]}, host bit, ${bit === 1 ? "on" : "off"}`} onPress={() => setN(flipAddressBit(n, index))} />
                  );
                })}
              </div>
            </div>
          ))}
          {hostBits === 0 ? <p className="text-sm text-muted-foreground">There are no host bits to flip.</p> : null}
        </div>

        <dl className="grid grid-cols-2 gap-2">
          <Fact label="Network address" value={f.network} />
          <Fact label="Broadcast address" value={f.broadcast ?? "none on a /31"} />
          <Fact label="First host" value={f.firstHost} />
          <Fact label="Last host" value={f.lastHost} />
        </dl>
        <p className="text-sm text-muted-foreground">
          {`${hostBits} host bit${hostBits === 1 ? "" : "s"}: ${formatAddressNumber(f.size)} address${f.size === 1 ? "" : "es"}, ${formatAddressNumber(f.hostCount)} usable${prefix < 31 ? " (two less)" : ""}.`}
        </p>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- wide: the shortcut that breaks

const WIDE_H = 424;
const CELL_X = 100;
const CELL_PITCH = 34;
const CELL_W = 30;
const ORDINAL = ["first", "second", "third", "fourth"] as const;

function WideView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const address = config.address ?? "192.168.1.23";
  const prefix = config.prefix ?? 23;
  const initial = config.destination ?? "192.168.0.40";
  const [text, setText] = useState(initial);
  const [dest, setDest] = useState(initial);
  const [error, setError] = useState<ParseError | null>(null);
  const [touched, setTouched] = useState(false);

  const onType = (value: string) => {
    setText(value);
    if (value.trim() === "") {
      setError(null);
      return;
    }
    const parsed = parseIpv4(value.trim());
    if (parsed.ok) {
      setError(null);
      setDest(value.trim());
    } else {
      setError(parsed.error);
    }
  };
  const reset = () => {
    setText(initial);
    setDest(initial);
    setError(null);
    setTouched(false);
  };

  const c = localCheck(address, prefix, dest);
  const mineBits = byteToBits(numberToParts(ipToNumber(address))[c.cutByte]);
  const theirBits = byteToBits(numberToParts(ipToNumber(dest))[c.cutByte]);
  const maskBits = byteToBits(c.maskByte);
  const mineAndBits = andBits(mineBits, maskBits);
  const theirAndBits = andBits(theirBits, maskBits);
  const netBitsHere = Math.max(0, Math.min(8, prefix - 8 * c.cutByte));
  const facts = subnetFacts(address, prefix);

  const verdict: { text: string; tone: Tone } = c.local ? { text: "Local: it is on my network", tone: "good" } : { text: "Not local: it goes via the router", tone: "warn" };
  const ord = ORDINAL[c.cutByte];
  const compare =
    c.differsAt !== null
      ? `Number ${c.differsAt + 1} already differs: different network`
      : c.local
        ? `${c.mineAnd} and ${c.theirsAnd} are equal: same network`
        : `${c.mineAnd} and ${c.theirsAnd} differ: different network`;
  const shortcut = c.shortcutWrong
    ? c.local
      ? `The shortcut "same first three numbers" says not local. It is wrong here: the mask decides.`
      : `The shortcut "same first three numbers" says local. It is wrong here: the mask decides.`
    : `The "same first three numbers" shortcut happens to agree here. Only a /24 makes it always true.`;
  const shownError = error && (error.kind !== "parts" || touched) ? error.message : "";
  const summary = `${address}/${prefix} covers ${c.network} to ${c.last}. ${dest} is ${c.local ? "local" : "not local"}. ${compare}. ${shortcut}`;
  const fieldId = `${ids}f`;
  const errorId = `${ids}e`;

  const rows: { label: string; bits: readonly (0 | 1)[]; value: number; networkTint: boolean }[] = [
    { label: "my address", bits: mineBits, value: c.mine, networkTint: true },
    { label: "destination", bits: theirBits, value: c.theirs, networkTint: true },
    { label: "mask", bits: maskBits, value: c.maskByte, networkTint: false },
    { label: "me AND mask", bits: mineAndBits, value: c.mineAnd, networkTint: true },
    { label: "it AND mask", bits: theirAndBits, value: c.theirsAnd, networkTint: true },
  ];
  const rowY = [136, 172, 208, 268, 304];
  const lineX = netBitsHere > 0 && netBitsHere < 8 ? CELL_X + netBitsHere * CELL_PITCH - 2 : null;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Type a destination and watch the bits of the {ord} number.</>}
      controls={<ControlButton onClick={reset}>Reset</ControlButton>}
    >
      <svg viewBox={`0 0 ${W} ${WIDE_H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={WIDE_H} />

        <text x={W / 2} y={74} textAnchor="middle" aria-hidden="true" className={cn(NEUTRAL.text, "text-[26px] font-bold tabular-nums")}>
          {address}
          <tspan className={TONES.accent.text}>{`/${prefix}`}</tspan>
        </text>
        <Caption x={W / 2} y={98}>{`my network: ${facts.network} to ${facts.last}`}</Caption>
        <Caption x={8} y={122} anchor="start" strong>{`The ${ord} number, in bits. Destination ${dest}`}</Caption>

        {rows.map((row, r) => (
          <g key={row.label} aria-hidden="true">
            <Caption x={8} y={rowY[r] + 20} anchor="start">{row.label}</Caption>
            {row.bits.map((bit, i) => {
              const network = i < netBitsHere;
              const lit = row.networkTint ? network : bit === 1;
              return (
                <g key={i}>
                  <rect
                    x={CELL_X + i * CELL_PITCH}
                    y={rowY[r]}
                    width={CELL_W}
                    height={28}
                    rx={7}
                    strokeWidth={lit ? 2 : 1.5}
                    className={cn(lit ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), SHAPE_TRANSITION)}
                  />
                  <text x={CELL_X + i * CELL_PITCH + CELL_W / 2} y={rowY[r] + 20} textAnchor="middle" className={cn(lit ? TONES.accent.text : NEUTRAL.mutedText, "text-[15px] font-bold tabular-nums")}>
                    {bit}
                  </text>
                </g>
              );
            })}
            <text x={W - 8} y={rowY[r] + 20} textAnchor="end" className={cn(NEUTRAL.text, "text-[15px] font-bold tabular-nums")}>{row.value}</text>
          </g>
        ))}
        {lineX !== null ? <line x1={lineX} x2={lineX} y1={128} y2={338} strokeWidth={2} strokeLinecap="round" aria-hidden="true" className={TONES.accent.stroke} /> : null}
        {netBitsHere >= 3 ? <Caption x={CELL_X + (netBitsHere * CELL_PITCH) / 2} y={254} anchor="middle">network part</Caption> : null}

        <text x={W / 2} y={362} textAnchor="middle" aria-hidden="true" className={cn(TONES[verdict.tone].text, "text-[14.5px] font-bold")}>{compare}</text>
        {wrapWords(shortcut, 58).map((line, k) => (
          <Caption key={k} x={W / 2} y={384 + k * 18}>{line}</Caption>
        ))}

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
      <form
        className="mt-2 flex flex-wrap items-center gap-2 px-1 pb-1"
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
        }}
      >
        <label htmlFor={fieldId} className="w-full text-sm font-semibold text-foreground">Destination address</label>
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
          placeholder="192.168.0.40"
          className={cn("h-11 w-48 rounded-lg border border-border bg-background px-3 text-base tabular-nums text-foreground sm:h-10", FOCUS_RING)}
        />
        <p id={errorId} role="alert" className="min-h-5 w-full text-sm font-medium text-red-700 dark:text-red-300">{shownError}</p>
      </form>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}
