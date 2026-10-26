"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { SvgButton } from "../primitives/svg-button";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { bandTitle, fieldName, findField, type LayerId, type Packet, type PacketField, type PacketLayer } from "../models/net-packet";
import { HEAD_TOP, NEST, type BandBox, type ChipBox, type PacketLayout } from "./layout";

// The nested header bands of a packet and the field chips inside them. The
// bands are drawn outermost first so each inner box sits on top of the one
// around it. A chip is a button when the picture lets the learner pick fields;
// a band header is a button when it lets the learner pick headers.

const FADE_IN = "animate-in fade-in duration-200 motion-reduce:animate-none";

export type ChipState = {
  /** The chip the learner picked: accent ring. */
  selected?: boolean;
  /** A lit chip: tinted in this tone. */
  tone?: Tone;
  /** A word on the label row, at the right: "changed", "new", "was 64". */
  note?: string;
};

type BandsProps = {
  packet: Packet;
  layout: PacketLayout;
  chipState?: (id: string) => ChipState;
  /** Makes every chip a button. */
  onChip?: (id: string) => void;
  /** The picked header, when headers are buttons. */
  selectedLayer?: LayerId | null;
  /** Makes every band header a button. */
  onLayer?: (id: LayerId) => void;
  /** Layers that fade in when they first appear. */
  fade?: boolean;
  /** Extra words after a band title, for example "(taken off)". */
  titleSuffix?: (layer: PacketLayer) => string;
};

export function PacketBands({ packet, layout, chipState, onChip, selectedLayer, onLayer, fade, titleSuffix }: BandsProps) {
  const stateOf = (id: string): ChipState => chipState?.(id) ?? {};
  return (
    <g>
      {layout.bands.map((band) => (
        <g key={`box-${band.layer.id}`} aria-hidden="true" className={fade ? FADE_IN : undefined}>
          <rect
            x={band.x}
            y={band.y}
            width={band.w}
            height={band.h}
            rx={12}
            strokeWidth={selectedLayer === band.layer.id ? 3 : 1.5}
            className={cn(
              band.depth % 2 === 0 ? NEUTRAL.surface : "fill-muted",
              selectedLayer === band.layer.id ? TONES.accent.stroke : NEUTRAL.line,
              SHAPE_TRANSITION
            )}
          />
        </g>
      ))}
      {layout.bands.map((band) => {
        const suffix = titleSuffix?.(band.layer) ?? "";
        const header = (
          <g aria-hidden={onLayer ? undefined : "true"}>
            {selectedLayer === band.layer.id ? (
              <rect x={band.x + 1} y={band.y + 1} width={band.w - 2} height={band.headerH} rx={11} className={TONES.accent.softFill} />
            ) : null}
            <text x={band.x + NEST + 2} y={band.y + HEAD_TOP + 15} className={cn(selectedLayer === band.layer.id ? TONES.accent.text : NEUTRAL.text, "text-[13px] font-bold")}>
              {`${bandTitle(band.layer)}${suffix}`}
            </text>
            {onChip
              ? null
              : band.chips.map((chip) => <ChipView key={chip.id} chip={chip} field={findField(packet, chip.id)} state={stateOf(chip.id)} nested />)}
          </g>
        );
        return (
          <g key={`head-${band.layer.id}`} className={fade ? FADE_IN : undefined}>
            {onLayer ? (
              <SvgButton
                x={band.x}
                y={band.y}
                width={band.w}
                height={band.headerH}
                rx={12}
                label={`${band.layer.name}, ${band.layer.short}: ${band.layer.fields.map((f) => `${f.label} ${f.value}`).join(", ")}`}
                pressed={selectedLayer === band.layer.id}
                onPress={() => onLayer(band.layer.id)}
              >
                {header}
              </SvgButton>
            ) : (
              <>
                {header}
                {onChip
                  ? band.chips.map((chip) => (
                      <ChipButton key={`btn-${chip.id}`} chip={chip} field={findField(packet, chip.id)} state={stateOf(chip.id)} onPress={() => onChip(chip.id)} />
                    ))
                  : null}
              </>
            )}
          </g>
        );
      })}
      {layout.payload ? (
        <g className={fade ? FADE_IN : undefined}>
          {onChip ? (
            <ChipButton chip={layout.payload} field={packet.payload} state={stateOf(layout.payload.id)} onPress={() => onChip(layout.payload!.id)} payload />
          ) : (
            <g aria-hidden="true">
              <ChipView chip={layout.payload} field={packet.payload} state={stateOf(layout.payload.id)} payload />
            </g>
          )}
        </g>
      ) : null}
    </g>
  );
}

type ChipViewProps = { chip: ChipBox; field?: PacketField; state: ChipState; payload?: boolean; nested?: boolean };

/** The look of one chip: label on top (and a note at the right), value under it. Never a button by itself. */
function ChipView({ chip, state, payload, nested }: ChipViewProps) {
  const fillTone: Tone | undefined = state.tone ?? (state.selected ? "accent" : undefined);
  const strokeTone: Tone | undefined = state.selected ? "accent" : state.tone;
  const textClass = fillTone ? TONES[fillTone].text : null;
  return (
    <g aria-hidden={nested ? "true" : undefined}>
      <rect
        x={chip.x}
        y={chip.y}
        width={chip.w}
        height={chip.h}
        rx={8}
        strokeWidth={state.selected ? 3 : fillTone ? 2 : 1.5}
        strokeDasharray={chip.absent ? "4 3" : undefined}
        className={cn(
          fillTone ? TONES[fillTone].softFill : payload ? "fill-muted" : NEUTRAL.surface,
          strokeTone ? TONES[strokeTone].stroke : chip.absent ? NEUTRAL.faintStroke : NEUTRAL.line,
          SHAPE_TRANSITION
        )}
      />
      <text x={chip.x + 10} y={chip.y + 17} className={cn(textClass ?? NEUTRAL.mutedText, "text-[13px] font-medium")}>
        {chip.label}
      </text>
      {state.note ? (
        <text x={chip.x + chip.w - 10} y={chip.y + 17} textAnchor="end" className={cn(textClass ?? NEUTRAL.text, "text-[13px] font-bold")}>
          {state.note}
        </text>
      ) : null}
      <text
        x={chip.x + 10}
        y={chip.y + 36}
        className={cn(chip.absent ? NEUTRAL.mutedText : (textClass ?? NEUTRAL.text), "text-[14px] tabular-nums", chip.absent ? "font-medium" : "font-bold")}
      >
        {chip.value}
      </text>
    </g>
  );
}

/** A chip you can tap: the chip look inside a button with the field's accessible name. */
function ChipButton({ chip, field, state, onPress, payload }: ChipViewProps & { onPress: () => void }): ReactNode {
  const base = field ? fieldName(field) : `${chip.label}, ${chip.value}`;
  const label = state.note ? `${base}, ${state.note}` : base;
  return (
    <SvgButton x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx={8} label={label} pressed={Boolean(state.selected)} onPress={onPress}>
      <ChipView chip={chip} field={field} state={state} payload={payload} nested />
    </SvgButton>
  );
}

/**
 * The header strip of a layer that has been taken off the packet: dashed, quiet, drawn where the
 * header used to be, with no box around the packet any more.
 */
export function GhostHeader({ band, packet, title }: { band: BandBox; packet: Packet; title: string }) {
  return (
    <g aria-hidden="true" className="animate-in fade-in duration-200 motion-reduce:animate-none">
      <rect x={band.x} y={band.y} width={band.w} height={band.headerH} rx={12} strokeWidth={1.5} strokeDasharray="5 4" className={cn(NEUTRAL.surface, NEUTRAL.faintStroke)} />
      <text x={band.x + NEST + 2} y={band.y + HEAD_TOP + 15} className={cn(NEUTRAL.mutedText, "text-[13px] font-bold")}>
        {title}
      </text>
      <g opacity={0.6}>
        {band.chips.map((chip) => (
          <ChipView key={chip.id} chip={chip} field={findField(packet, chip.id)} state={{}} nested />
        ))}
      </g>
    </g>
  );
}
