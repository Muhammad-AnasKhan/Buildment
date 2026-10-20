// Theme-aware colour for canvases, as Tailwind classes over the app's tokens.
// No hex values: neutral parts use card, border, muted and foreground, so they
// follow light and dark mode. One accent (blue) carries the current step;
// green, amber and red appear only when they mean success, warning or error,
// and always next to a text label so colour is never the only signal.

export type Tone = "accent" | "good" | "warn" | "bad";

type ToneClasses = {
  /** SVG stroke for the lit shape or arrow. */
  stroke: string;
  /** SVG pale fill behind a lit shape. */
  softFill: string;
  /** SVG solid fill, for dots and arrowheads. */
  solidFill: string;
  /** SVG text on the pale fill. */
  text: string;
  /** HTML chip: pale background, readable text, hairline ring. */
  chip: string;
  /** HTML left border for the step note. */
  rule: string;
  /** HTML solid background, for bars. */
  bar: string;
};

export const TONES: Record<Tone, ToneClasses> = {
  accent: {
    stroke: "stroke-blue-600 dark:stroke-blue-400",
    softFill: "fill-blue-50 dark:fill-blue-500/15",
    solidFill: "fill-blue-600 dark:fill-blue-400",
    text: "fill-blue-800 dark:fill-blue-200",
    chip: "bg-blue-50 text-blue-800 ring-blue-200/80 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-400/25",
    rule: "border-l-blue-600 dark:border-l-blue-400",
    bar: "bg-blue-600 dark:bg-blue-400",
  },
  good: {
    stroke: "stroke-emerald-600 dark:stroke-emerald-400",
    softFill: "fill-emerald-50 dark:fill-emerald-500/15",
    solidFill: "fill-emerald-600 dark:fill-emerald-400",
    text: "fill-emerald-800 dark:fill-emerald-200",
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/25",
    rule: "border-l-emerald-600 dark:border-l-emerald-400",
    bar: "bg-emerald-600 dark:bg-emerald-400",
  },
  warn: {
    stroke: "stroke-amber-600 dark:stroke-amber-400",
    softFill: "fill-amber-50 dark:fill-amber-500/15",
    solidFill: "fill-amber-600 dark:fill-amber-400",
    text: "fill-amber-900 dark:fill-amber-100",
    chip: "bg-amber-50 text-amber-900 ring-amber-200/80 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-400/25",
    rule: "border-l-amber-600 dark:border-l-amber-400",
    bar: "bg-amber-600 dark:bg-amber-400",
  },
  bad: {
    stroke: "stroke-red-600 dark:stroke-red-400",
    softFill: "fill-red-50 dark:fill-red-500/15",
    solidFill: "fill-red-600 dark:fill-red-400",
    text: "fill-red-800 dark:fill-red-200",
    chip: "bg-red-50 text-red-800 ring-red-200/80 dark:bg-red-500/15 dark:text-red-200 dark:ring-red-400/25",
    rule: "border-l-red-600 dark:border-l-red-400",
    bar: "bg-red-600 dark:bg-red-400",
  },
};

/** Neutral SVG parts: shapes that are not the current step. */
export const NEUTRAL = {
  surface: "fill-card",
  line: "stroke-border",
  faintStroke: "stroke-muted-foreground/45",
  faintFill: "fill-muted-foreground/45",
  doneStroke: "stroke-muted-foreground",
  doneFill: "fill-muted-foreground",
  text: "fill-foreground",
  mutedText: "fill-muted-foreground",
};

/**
 * A focus ring that stays visible on both themes: solid accent, offset from
 * the card so it never blends into a border.
 */
export const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-card dark:focus-visible:ring-blue-400";

/** Colour changes on SVG shapes: short, and off when motion is reduced. */
export const SHAPE_TRANSITION = "transition-colors duration-200 motion-reduce:transition-none";
