import type { ComponentType, SVGProps } from "react";
import { Cloud, Laptop, Network, Router, Server, Smartphone } from "lucide-react";
import { cn } from "../../lib/utils";
import { NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import type { ChangedRow, DeviceKind, NetPacket, NetTable, TableRows } from "../models/net-step";
import { CHIP_H, ROW_H, type Box, type ChipBox, type DeviceBox, type LinkGeom, type TableGeom } from "./layout";

// The drawn pieces of a net-step picture. Text is 13 units everywhere, and
// colour follows the theme tokens: the accent for what is lit, amber for what
// changed, green for what is new, and always a word beside the colour.

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>;

const ICONS: Record<DeviceKind, Icon> = { host: Laptop, phone: Smartphone, server: Server, router: Router, switch: Network, cloud: Cloud };

const BADGE: Record<DeviceKind, string> = {
  host: "fill-violet-100 dark:fill-violet-500/20",
  phone: "fill-violet-100 dark:fill-violet-500/20",
  server: "fill-blue-100 dark:fill-blue-500/20",
  router: "fill-sky-100 dark:fill-sky-500/20",
  switch: "fill-emerald-100 dark:fill-emerald-500/20",
  cloud: "fill-slate-200 dark:fill-slate-500/25",
};
const ICON_COLOUR: Record<DeviceKind, string> = {
  host: "text-violet-700 dark:text-violet-300",
  phone: "text-violet-700 dark:text-violet-300",
  server: "text-blue-700 dark:text-blue-300",
  router: "text-sky-700 dark:text-sky-300",
  switch: "text-emerald-700 dark:text-emerald-300",
  cloud: "text-slate-700 dark:text-slate-300",
};

const LABEL = cn(NEUTRAL.text, "text-[13px] font-semibold");
const MUTED = cn(NEUTRAL.mutedText, "text-[13px] font-medium tabular-nums");
const BODY = cn(NEUTRAL.text, "text-[13px] tabular-nums");

/** A device as an icon card: its kind, its name and its addresses. A ring marks the one that matters now. */
export function DeviceCard({ box, lit }: { box: DeviceBox; lit: boolean }) {
  const Cmp = ICONS[box.kind];
  return (
    <g>
      {lit ? <rect x={box.x - 5} y={box.y - 5} width={box.w + 10} height={box.h + 10} rx={19} className={cn("fill-none", TONES.accent.stroke)} strokeWidth={2.5} /> : null}
      {/* A soft shadow drawn as an offset shape, without filters. */}
      <rect x={box.x} y={box.y + 3} width={box.w} height={box.h} rx={14} className="fill-foreground/[0.06]" />
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
      {lit ? <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={14} strokeWidth={2} className={cn(TONES.accent.softFill, TONES.accent.stroke)} /> : null}
      <circle cx={box.x + 16} cy={box.y + 17} r={10} className={BADGE[box.kind]} />
      <Cmp x={box.x + 8} y={box.y + 9} width={16} height={16} strokeWidth={2} className={ICON_COLOUR[box.kind]} aria-hidden />
      <text x={box.x + 30} y={box.y + 22} className={LABEL}>
        {box.label}
      </text>
      {box.addresses.map((a, k) => (
        <text key={a} x={box.x + 6} y={box.y + 41 + 18 * k} className={MUTED}>
          {a}
        </text>
      ))}
    </g>
  );
}

/** A link between two devices: a quiet line, an accent line while it carries the step, and an optional name on a pill. */
export function LinkLine({ link, lit }: { link: LinkGeom; lit: boolean }) {
  return (
    <g>
      <line x1={link.p1.x} y1={link.p1.y} x2={link.p2.x} y2={link.p2.y} strokeLinecap="round" strokeWidth={lit ? 3.5 : 2} className={cn(lit ? TONES.accent.stroke : NEUTRAL.faintStroke, SHAPE_TRANSITION)} />
      {link.label ? (
        <g>
          <rect x={link.label.box.x} y={link.label.box.y} width={link.label.box.w} height={link.label.box.h} rx={11} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <text x={link.label.box.x + link.label.box.w / 2} y={link.label.box.y + 16} textAnchor="middle" className={MUTED}>
            {link.label.text}
          </text>
        </g>
      ) : null}
    </g>
  );
}

/** The packet itself, drawn small on the link while it travels and where it stops. */
export function PacketMarker({ x, y }: { x: number; y: number }) {
  return <rect x={x - 11} y={y - 8} width={22} height={16} rx={5} strokeWidth={2.5} className={cn(TONES.accent.solidFill, "stroke-card")} />;
}

/** One header field of the packet as a chip: the label, the value, and the word "changed" when it changed. */
export function FieldChip({ box, field }: { box: ChipBox; field: NetPacket["fields"][number] }) {
  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={CHIP_H} rx={12} strokeWidth={1.5} className={field.changed ? cn(TONES.warn.softFill, TONES.warn.stroke) : cn(NEUTRAL.surface, NEUTRAL.line)} />
      <text x={box.x + 9} y={box.y + 17} className={BODY}>
        <tspan className={NEUTRAL.mutedText}>{field.label} </tspan>
        <tspan className="font-semibold">{field.value}</tspan>
        {field.changed ? <tspan className={cn(TONES.warn.text, "font-semibold")}>{" changed"}</tspan> : null}
      </text>
    </g>
  );
}

/** The frame of the packet tray: a titled card the chips sit in. */
export function Tray({ box, titleY, title, empty }: { box: Box; titleY: number; title: string; empty: boolean }) {
  return (
    <g>
      {empty ? null : <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />}
      <text x={box.x + 10} y={titleY} className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold")}>
        {title}
      </text>
    </g>
  );
}

type TableProps = {
  geom: TableGeom;
  table: NetTable;
  rows: TableRows;
  changed: ChangedRow[];
  /** Row indexes the step points at. */
  lit: number[];
};

/** A table of the picture: title, column heads, the rows so far, a tag on every row that just changed. */
export function TableView({ geom, table, rows, changed, lit }: TableProps) {
  const { box } = geom;
  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
      <text x={box.x + 10} y={geom.titleY} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>
        {table.title}
      </text>
      {table.columns.map((c, k) => (
        <text key={c} x={geom.colX[k]} y={geom.headY + 17} className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold")}>
          {c}
        </text>
      ))}
      <line x1={box.x + 8} x2={box.x + box.w - 8} y1={geom.rowY(0)} y2={geom.rowY(0)} strokeWidth={1} className={NEUTRAL.line} />
      {rows.length === 0 ? (
        <text x={geom.colX[0]} y={geom.rowY(0) + 17} className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>
          No entries yet
        </text>
      ) : null}
      {rows.map((cells, r) => {
        const change = changed.find((c) => c.table === table.id && c.row === r);
        const pointed = lit.includes(r);
        const tone = change ? (change.kind === "new" ? TONES.good : TONES.warn) : null;
        const word = change ? change.kind : "";
        return (
          <g key={r}>
            {change || pointed ? (
              <rect
                x={box.x + 4}
                y={geom.rowY(r) + 1}
                width={box.w - 8}
                height={ROW_H - 2}
                rx={7}
                strokeWidth={pointed ? 2 : 1}
                className={cn(tone ? tone.softFill : TONES.accent.softFill, pointed ? TONES.accent.stroke : tone ? tone.stroke : "", SHAPE_TRANSITION)}
              />
            ) : null}
            {cells.map((cell, k) => (
              <text key={k} x={geom.colX[k]} y={geom.rowY(r) + 17} className={cn(BODY, change && "font-semibold")}>
                {cell}
              </text>
            ))}
            {tone ? (
              <text x={geom.tagRight} y={geom.rowY(r) + 17} textAnchor="end" className={cn(tone.text, "text-[13px] font-bold")}>
                {word}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
