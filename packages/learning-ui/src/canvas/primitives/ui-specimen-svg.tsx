import { useId } from "react";
import {
  ArrowLeft, ChartColumn, Check, Clock, Globe, Heart, Inbox, Lock, Plus, Rocket, Search, Shield, Sparkles, Star,
  TriangleAlert, User, WifiOff, Zap,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { Placed, PlacedText, ScreenLayout, SpecArt, SpecFill, SpecGlyph, SpecTone } from "../models/ui-specimen";
import { NEUTRAL, TONES } from "./tones";

// Draws a laid-out specimen screen (models/ui-specimen.ts) as SVG, inside a
// larger picture. Colours are theme classes, never hex: the page follows light
// and dark mode like the rest of the reader. The purple "glow" fill exists
// only so the course can show, and name, the generic AI-made look.

const GLYPHS: Record<SpecGlyph, typeof Check> = {
  spark: Sparkles, bolt: Zap, shield: Shield, rocket: Rocket, chart: ChartColumn, check: Check, star: Star, heart: Heart,
  clock: Clock, user: User, lock: Lock, globe: Globe, search: Search, plus: Plus, arrow: ArrowLeft, alert: TriangleAlert,
  wifi: WifiOff, inbox: Inbox,
};

const TEXT_TONE: Record<SpecTone, string> = {
  fg: NEUTRAL.text,
  muted: NEUTRAL.mutedText,
  faint: "fill-muted-foreground/45",
  accent: "fill-blue-600 dark:fill-blue-400",
  onAccent: "fill-white dark:fill-blue-950",
  onGlow: "fill-white",
  inverse: "fill-background",
  good: TONES.good.text,
  warn: TONES.warn.text,
  bad: TONES.bad.text,
};

const GLYPH_TONE: Record<string, string> = {
  accent: "stroke-blue-600 dark:stroke-blue-400",
  fg: "stroke-foreground",
  muted: "stroke-muted-foreground",
  good: TONES.good.stroke,
  warn: TONES.warn.stroke,
  bad: TONES.bad.stroke,
  onAccent: "stroke-white dark:stroke-blue-950",
};

const FONT: Record<string, string> = { sans: "font-sans", serif: "font-serif", mono: "font-mono" };

function fillClass(fill: SpecFill, glowId: string): { className?: string; fill?: string } {
  switch (fill) {
    case "none":
      return { fill: "none" };
    case "card":
      return { className: "fill-card" };
    case "muted":
      return { className: "fill-muted" };
    case "ink":
      return { className: "fill-foreground" };
    case "accent":
      return { className: "fill-blue-600 dark:fill-blue-400" };
    case "accentSoft":
      return { className: TONES.accent.softFill };
    case "goodSoft":
      return { className: TONES.good.softFill };
    case "warnSoft":
      return { className: TONES.warn.softFill };
    case "badSoft":
      return { className: TONES.bad.softFill };
    case "glow":
      return { fill: `url(#${glowId})` };
  }
}

const SOFT_FILLS = new Set<SpecFill>(["accentSoft", "goodSoft", "warnSoft", "badSoft"]);

const STROKE: Record<string, string> = {
  border: "stroke-border",
  accent: "stroke-blue-600 dark:stroke-blue-400",
  bad: TONES.bad.stroke,
  faint: NEUTRAL.faintStroke,
};

function SpecText({ p }: { p: PlacedText }) {
  return (
    <text
      x={p.x}
      y={p.y}
      textAnchor={p.anchor}
      className={cn(!p.color && TEXT_TONE[p.tone], FONT[p.font])}
      style={{ fontSize: p.size, fontWeight: p.weight, fill: p.color }}
    >
      {p.lines.map((line, i) => (
        <tspan key={i} x={p.x} dy={i === 0 ? 0 : p.lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

/** Simple drawings standing in for real content: a photo, a chart, a list, a map or a receipt. */
function Art({ x, y, w, h, art }: { x: number; y: number; w: number; h: number; art: SpecArt }) {
  const frame = <rect x={x} y={y} width={w} height={h} rx={8} className="fill-muted" />;
  switch (art) {
    case "photo":
      return (
        <g>
          {frame}
          <circle cx={x + w * 0.75} cy={y + h * 0.32} r={Math.min(w, h) * 0.1} className="fill-muted-foreground/35" />
          <path d={`M${x + 8} ${y + h - 8} L${x + w * 0.35} ${y + h * 0.45} L${x + w * 0.55} ${y + h * 0.7} L${x + w * 0.7} ${y + h * 0.55} L${x + w - 8} ${y + h - 8} Z`} className="fill-muted-foreground/30" />
        </g>
      );
    case "chart": {
      const bars = [0.45, 0.7, 0.55, 0.9, 0.65, 0.8];
      const bw = (w - 24) / bars.length - 6;
      return (
        <g>
          {frame}
          {bars.map((v, i) => (
            <rect key={i} x={x + 12 + i * (bw + 6)} y={y + h - 10 - (h - 24) * v} width={bw} height={(h - 24) * v} rx={2} className={i === 3 ? "fill-blue-600 dark:fill-blue-400" : "fill-muted-foreground/35"} />
          ))}
        </g>
      );
    }
    case "list": {
      const rows = Math.max(2, Math.floor((h - 12) / 22));
      return (
        <g>
          {frame}
          {Array.from({ length: rows }, (_, i) => (
            <g key={i}>
              <circle cx={x + 16} cy={y + 17 + i * 22} r={5} className="fill-muted-foreground/35" />
              <rect x={x + 28} y={y + 13 + i * 22} width={(w - 44) * (i % 2 ? 0.6 : 0.85)} height={8} rx={4} className="fill-muted-foreground/30" />
            </g>
          ))}
        </g>
      );
    }
    case "map":
      return (
        <g>
          {frame}
          <path d={`M${x} ${y + h * 0.6} C${x + w * 0.3} ${y + h * 0.4} ${x + w * 0.6} ${y + h * 0.8} ${x + w} ${y + h * 0.5}`} className="fill-none stroke-muted-foreground/35" strokeWidth={6} />
          <circle cx={x + w * 0.58} cy={y + h * 0.62} r={7} className="fill-blue-600 dark:fill-blue-400" />
        </g>
      );
    case "receipt":
      return (
        <g>
          {frame}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={x + 12} y={y + 12 + i * 16} width={w * 0.45} height={7} rx={3} className="fill-muted-foreground/30" />
              <rect x={x + w - 12 - w * 0.18} y={y + 12 + i * 16} width={w * 0.18} height={7} rx={3} className="fill-muted-foreground/40" />
            </g>
          ))}
        </g>
      );
    case "blank":
      return <rect x={x} y={y} width={w} height={h} rx={8} className="fill-muted stroke-border" strokeDasharray="4 4" />;
  }
}

const MOTION: Record<string, string> = {
  bounce: "motion-safe:animate-bounce",
  pulse: "motion-safe:animate-pulse",
  spin: "motion-safe:animate-spin",
  ping: "motion-safe:animate-ping",
};

/** Wraps a shape in its motion class; transform-box keeps a spin centred on the shape. */
function Item({ p, glowId }: { p: Placed; glowId: string }) {
  const shape = <Shape p={p} glowId={glowId} />;
  return p.motion ? <g className={cn(MOTION[p.motion], "[transform-box:fill-box] [transform-origin:center]")}>{shape}</g> : shape;
}

function Shape({ p, glowId }: { p: Placed; glowId: string }) {
  switch (p.type) {
    case "text":
      return <SpecText p={p} />;
    case "rect": {
      const f = fillClass(p.fill, glowId);
      const shape = <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r} {...f} className={cn(f.className, p.stroke && STROKE[p.stroke])} strokeWidth={p.stroke ? 1.25 : 0} />;
      // Soft tints are see-through in dark mode; an opaque card under them keeps their text readable on a glow or a photo.
      return SOFT_FILLS.has(p.fill) ? (
        <g>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r} className="fill-card" />
          {shape}
        </g>
      ) : (
        shape
      );
    }
    case "glyph": {
      const G = GLYPHS[p.glyph];
      return <G x={p.x} y={p.y} width={p.size} height={p.size} strokeWidth={2} className={cn("fill-none", GLYPH_TONE[p.tone])} aria-hidden />;
    }
    case "art":
      return <Art {...p} />;
    case "spinner":
      return (
        <g>
          <circle cx={p.cx} cy={p.cy} r={p.r} className="fill-none stroke-muted" strokeWidth={3} />
          <path d={`M${p.cx} ${p.cy - p.r} A${p.r} ${p.r} 0 0 1 ${p.cx + p.r} ${p.cy}`} className="fill-none stroke-blue-600 dark:stroke-blue-400" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case "line":
      return <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} className="stroke-border" strokeWidth={1} />;
  }
}

type SpecimenSvgProps = {
  layout: ScreenLayout;
  /** Where the screen's top-left corner sits in the outer picture. */
  x?: number;
  y?: number;
  frame: "phone" | "browser" | "none";
  background?: "card" | "muted" | "glow" | "ink" | "paper";
  /** Blur the screen, as when you squint at it to see what stands out. */
  blur?: boolean;
  /** Lower the screen's opacity, for example while it is hidden in a skim test. */
  dim?: boolean;
};

/** The screen with its frame, as a group to place inside a larger SVG. */
export function SpecimenSvg({ layout, x = 0, y = 0, frame, background = "card", blur, dim }: SpecimenSvgProps) {
  const uid = useId().replace(/:/g, "");
  const glowId = `glow-${uid}`;
  const clipId = `page-${uid}`;
  const blurId = `squint-${uid}`;
  const { page } = layout;
  const bg =
    background === "glow"
      ? { fill: `url(#${glowId})` }
      : background === "paper"
        ? { fill: "white" }
        : { className: background === "muted" ? "fill-muted" : background === "ink" ? "fill-foreground" : "fill-card" };
  return (
    <g transform={`translate(${x} ${y})`} opacity={dim ? 0.12 : 1} className="transition-opacity duration-200 motion-reduce:transition-none">
      <defs>
        <linearGradient id={glowId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" className="[stop-color:var(--color-violet-500)]" />
          <stop offset="100%" className="[stop-color:var(--color-fuchsia-400)]" />
        </linearGradient>
        <filter id={blurId} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
        <clipPath id={clipId}>
          <rect x={page.x} y={page.y} width={page.w} height={page.h} rx={frame === "phone" ? 18 : 0} />
        </clipPath>
      </defs>
      {frame === "phone" ? (
        <>
          <rect x={0.75} y={0.75} width={layout.width - 1.5} height={layout.height - 1.5} rx={28} className="fill-muted stroke-border" strokeWidth={1.5} />
          <rect x={layout.width / 2 - 30} y={9} width={60} height={8} rx={4} className="fill-muted-foreground/40" />
        </>
      ) : null}
      {frame === "browser" ? (
        <>
          <rect x={0.75} y={0.75} width={layout.width - 1.5} height={layout.height - 1.5} rx={10} className="fill-muted stroke-border" strokeWidth={1.5} />
          {[12, 24, 36].map((cx) => (
            <circle key={cx} cx={cx} cy={13} r={3.5} className="fill-muted-foreground/40" />
          ))}
          <rect x={52} y={6} width={layout.width - 64} height={14} rx={7} className="fill-card" />
        </>
      ) : null}
      <g clipPath={`url(#${clipId})`} filter={blur ? `url(#${blurId})` : undefined}>
        <rect x={page.x} y={page.y} width={page.w} height={page.h} {...bg} />
        {layout.items.map((p, i) => (
          <Item key={i} p={p} glowId={glowId} />
        ))}
      </g>
    </g>
  );
}
