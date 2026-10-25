// A small screen as data: a phone or browser frame and a stack of blocks
// (text, buttons, fields, cards, rows, pills, icons, pictures and states).
// layoutScreen() turns it into flat shapes with positions, so a canvas can
// draw a believable interface in SVG and a test can check that every label
// fits. Used by the product-sense course to show the same screen before and
// after a design change. No React here.

/** Text colour. "faint" is deliberately low contrast, for teaching contrast. */
export type SpecTone = "fg" | "muted" | "faint" | "accent" | "onAccent" | "onGlow" | "inverse" | "good" | "warn" | "bad";

/** Block fill. "glow" is the purple gradient of the generic AI-made look, drawn only to be named. */
export type SpecFill = "none" | "card" | "muted" | "ink" | "accent" | "accentSoft" | "goodSoft" | "warnSoft" | "badSoft" | "glow";

export type SpecFont = "sans" | "serif" | "mono";

export type SpecGlyph =
  | "spark" | "bolt" | "shield" | "rocket" | "chart" | "check" | "star" | "heart"
  | "clock" | "user" | "lock" | "globe" | "search" | "plus" | "arrow" | "alert" | "wifi" | "inbox";

export type SpecArt = "photo" | "chart" | "list" | "map" | "receipt" | "blank";

/** Motion on a block, for teaching motion: decorative loops or one that shows a change. */
export type SpecMotion = "bounce" | "pulse" | "spin" | "ping";

type Base = {
  /** Give a block an id when a canvas needs to point at it (spot mode). */
  id?: string;
  /** Animate this block and everything inside it. Turned off when the reader asks for reduced motion. */
  motion?: SpecMotion;
};

export type SpecBlock =
  | (Base & {
      kind: "text";
      text: string;
      size?: number;
      weight?: 400 | 500 | 600 | 700 | 800;
      tone?: SpecTone;
      align?: "start" | "center";
      lineHeight?: number;
      font?: SpecFont;
      caps?: boolean;
      /**
       * A literal colour such as "#767676", only for teaching contrast, on a
       * screen with background "paper" so the ratio stays true in dark mode.
       */
      color?: string;
    })
  | (Base & { kind: "button"; label: string; variant?: "primary" | "secondary" | "ghost" | "glow" | "danger"; full?: boolean; size?: number; align?: "start" | "center" })
  | (Base & { kind: "field"; label?: string; placeholder?: string; value?: string; hint?: string; error?: string; focus?: boolean })
  | (Base & { kind: "image"; height: number; art: SpecArt; caption?: string })
  | (Base & { kind: "box"; children: SpecBlock[]; fill?: SpecFill; border?: boolean | "accent"; radius?: number; pad?: number; gap?: number; shadow?: boolean })
  | (Base & { kind: "row"; children: SpecBlock[]; gap?: number; weights?: number[] })
  | (Base & { kind: "icon"; glyph: SpecGlyph; tile?: boolean; tone?: "accent" | "fg" | "muted" | "good" | "warn" | "bad"; size?: number })
  | (Base & { kind: "pill"; text: string; tone?: "neutral" | "accent" | "good" | "warn" | "bad" })
  | (Base & { kind: "pills"; items: { text: string; tone?: "neutral" | "accent" | "good" | "warn" | "bad" }[] })
  | (Base & { kind: "divider" })
  | (Base & { kind: "space"; height: number })
  | (Base & { kind: "spinner"; label?: string })
  | (Base & { kind: "skeleton"; lines: number; avatar?: boolean })
  | (Base & { kind: "nav"; title: string; action?: string; back?: boolean })
  | (Base & { kind: "stat"; value: string; label: string; tone?: SpecTone })
  | (Base & { kind: "progress"; value: number; label?: string });

export type SpecScreen = {
  /** What the screen shows, in one sentence, for screen readers. */
  alt: string;
  /** "phone" draws a phone outline, "browser" a window bar, "none" just the page. */
  frame?: "phone" | "browser" | "none";
  /** Content width in viewBox units; defaults to 300. */
  width?: number;
  /** Space around the stack; defaults to 16. */
  pad?: number;
  /** Space between top-level blocks; defaults to 12. */
  gap?: number;
  /** "paper" is white in both themes, for screens that use literal colours. */
  background?: "card" | "muted" | "glow" | "ink" | "paper";
  blocks: SpecBlock[];
};

export type PlacedText = {
  type: "text";
  /** Literal colour, when the block set one. */
  color?: string;
  x: number;
  /** Baseline of the first line. */
  y: number;
  lines: string[];
  size: number;
  weight: number;
  tone: SpecTone;
  anchor: "start" | "middle" | "end";
  lineHeight: number;
  font: SpecFont;
  /** The width the lines were wrapped to. */
  maxWidth: number;
  owner?: string;
};

export type PlacedRect = {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  fill: SpecFill;
  stroke?: "border" | "accent" | "bad" | "faint";
  dashed?: boolean;
  owner?: string;
};

export type PlacedGlyph = { type: "glyph"; x: number; y: number; size: number; glyph: SpecGlyph; tone: "accent" | "fg" | "muted" | "good" | "warn" | "bad" | "onAccent"; owner?: string };
export type PlacedArt = { type: "art"; x: number; y: number; w: number; h: number; art: SpecArt; owner?: string };
export type PlacedSpinner = { type: "spinner"; cx: number; cy: number; r: number; owner?: string };
export type PlacedLine = { type: "line"; x1: number; y1: number; x2: number; y2: number; owner?: string };

export type Placed = (PlacedText | PlacedRect | PlacedGlyph | PlacedArt | PlacedSpinner | PlacedLine) & { motion?: SpecMotion };

/** The box a block with an id occupies, for pointing at it and tapping it. */
export type Region = { id: string; x: number; y: number; w: number; h: number };

export type ScreenLayout = {
  /** Whole picture, frame included. */
  width: number;
  height: number;
  /** The page area inside the frame. */
  page: { x: number; y: number; w: number; h: number };
  items: Placed[];
  regions: Region[];
};

export const FRAME_MARGIN = { phone: 10, browser: 0, none: 0 } as const;
const PHONE_TOP = 22;
const BROWSER_BAR = 26;

/**
 * Estimated width of a string in viewBox units. Errs wide, so wrapped text
 * stays inside its box in the reader's sans font.
 */
export function textWidth(text: string, size: number, weight = 400, font: SpecFont = "sans"): number {
  if (font === "mono") return text.length * size * 0.62;
  let units = 0;
  for (const ch of text) {
    if (" il.,:;'|!".includes(ch)) units += 0.3;
    else if ("ftjrI()[]-".includes(ch)) units += 0.38;
    else if ("mwMW@%".includes(ch)) units += 0.88;
    else if (ch >= "A" && ch <= "Z") units += 0.68;
    else if (ch >= "0" && ch <= "9") units += 0.58;
    else units += 0.54;
  }
  const bold = weight >= 600 ? 1.07 : 1;
  const serif = font === "serif" ? 1.02 : 1;
  return units * size * bold * serif;
}

/** Greedy word wrap to a width. A word longer than the width gets its own line. */
export function wrapText(text: string, maxWidth: number, size: number, weight = 400, font: SpecFont = "sans"): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (line && textWidth(next, size, weight, font) > maxWidth) {
        out.push(line);
        line = w;
      } else line = next;
    }
    out.push(line);
  }
  return out;
}

type Ctx = { items: Placed[]; regions: Region[] };

function placeText(ctx: Ctx, b: Extract<SpecBlock, { kind: "text" }>, x: number, y: number, w: number, owner?: string): number {
  const size = b.size ?? 13;
  const weight = b.weight ?? 400;
  const font = b.font ?? "sans";
  const lh = (b.lineHeight ?? (size >= 20 ? 1.2 : 1.4)) * size;
  const text = b.caps ? b.text.toUpperCase() : b.text;
  const lines = wrapText(text, w, size, weight, font);
  const center = b.align === "center";
  ctx.items.push({
    type: "text",
    x: center ? x + w / 2 : x,
    y: y + size * 0.95,
    lines,
    size,
    weight,
    tone: b.tone ?? "fg",
    anchor: center ? "middle" : "start",
    lineHeight: lh,
    font,
    maxWidth: w,
    owner,
    color: b.color,
  });
  return size * 0.95 + (lines.length - 1) * lh + size * 0.3;
}

function placeBlock(ctx: Ctx, b: SpecBlock, x: number, y: number, w: number, inherited?: string): number {
  const owner = b.id ?? inherited;
  const start = ctx.items.length;
  const h = placeInner(ctx, b, x, y, w, owner);
  if (b.motion) for (let i = start; i < ctx.items.length; i++) ctx.items[i].motion ??= b.motion;
  if (b.id) {
    // The region is the block's own box; for text and buttons that is narrower than the column.
    let right = x;
    for (let i = start; i < ctx.items.length; i++) right = Math.max(right, itemRight(ctx.items[i]));
    const tight = b.kind === "button" || b.kind === "pill" || b.kind === "icon";
    ctx.regions.push({ id: b.id, x, y, w: tight ? Math.min(w, right - x) : w, h });
  }
  return h;
}

function itemRight(p: Placed): number {
  switch (p.type) {
    case "rect":
    case "art":
      return p.x + p.w;
    case "glyph":
      return p.x + p.size;
    case "spinner":
      return p.cx + p.r;
    case "line":
      return Math.max(p.x1, p.x2);
    case "text": {
      const widest = Math.max(0, ...p.lines.map((l) => textWidth(l, p.size, p.weight, p.font)));
      return p.anchor === "start" ? p.x + widest : p.anchor === "middle" ? p.x + widest / 2 : p.x;
    }
  }
}

const PILL_TONE_FILL: Record<string, SpecFill> = { neutral: "muted", accent: "accentSoft", good: "goodSoft", warn: "warnSoft", bad: "badSoft" };
const PILL_TONE_TEXT: Record<string, SpecTone> = { neutral: "muted", accent: "accent", good: "good", warn: "warn", bad: "bad" };

function placeInner(ctx: Ctx, b: SpecBlock, x: number, y: number, w: number, owner?: string): number {
  switch (b.kind) {
    case "text":
      return placeText(ctx, b, x, y, w, owner);
    case "button": {
      const size = b.size ?? 13;
      const h = Math.round(size * 2.7);
      const tw = textWidth(b.label, size, 600);
      const bw = b.full ? w : Math.min(w, tw + 32);
      const bx = b.align === "center" && !b.full ? x + (w - bw) / 2 : x;
      const variant = b.variant ?? "primary";
      const fill: SpecFill = variant === "primary" ? "accent" : variant === "glow" ? "glow" : variant === "danger" ? "badSoft" : variant === "secondary" ? "card" : "none";
      ctx.items.push({ type: "rect", x: bx, y, w: bw, h, r: variant === "glow" ? h / 2 : 8, fill, stroke: variant === "secondary" ? "border" : variant === "danger" ? "bad" : undefined, owner });
      const tone: SpecTone = variant === "glow" ? "onGlow" : variant === "primary" ? "onAccent" : variant === "danger" ? "bad" : "accent";
      ctx.items.push({ type: "text", x: bx + bw / 2, y: y + h / 2 + size * 0.36, lines: [b.label], size, weight: 600, tone, anchor: "middle", lineHeight: size, font: "sans", maxWidth: bw, owner });
      return h;
    }
    case "field": {
      let cy = y;
      if (b.label) {
        cy += placeText(ctx, { kind: "text", text: b.label, size: 12, weight: 600 }, x, cy, w, owner) + 4;
      }
      const h = 36;
      ctx.items.push({ type: "rect", x, y: cy, w, h, r: 7, fill: "card", stroke: b.error ? "bad" : b.focus ? "accent" : "border", owner });
      const shown = b.value ?? b.placeholder ?? "";
      if (shown) {
        ctx.items.push({ type: "text", x: x + 11, y: cy + 23, lines: [shown], size: 13, weight: 400, tone: b.value ? "fg" : "faint", anchor: "start", lineHeight: 13, font: "sans", maxWidth: w - 22, owner });
      }
      cy += h;
      if (b.error) cy += 5 + placeText(ctx, { kind: "text", text: b.error, size: 11.5, tone: "bad", weight: 500 }, x, cy + 5, w, owner);
      else if (b.hint) cy += 5 + placeText(ctx, { kind: "text", text: b.hint, size: 11.5, tone: "muted" }, x, cy + 5, w, owner);
      return cy - y;
    }
    case "image":
      ctx.items.push({ type: "art", x, y, w, h: b.height, art: b.art, owner });
      if (b.caption) return b.height + 4 + placeText(ctx, { kind: "text", text: b.caption, size: 11, tone: "muted" }, x, y + b.height + 4, w, owner);
      return b.height;
    case "box": {
      const pad = b.pad ?? 12;
      const gap = b.gap ?? 8;
      const rectIndex = ctx.items.length;
      // Reserve the rectangle first so it is drawn under its children.
      ctx.items.push({ type: "rect", x, y, w, h: 0, r: b.radius ?? 10, fill: b.fill ?? "card", stroke: b.border === "accent" ? "accent" : b.border ? "border" : undefined, owner });
      if (b.shadow) ctx.items.splice(rectIndex, 0, { type: "rect", x: x + 2, y: y + 4, w, h: 0, r: b.radius ?? 10, fill: "muted", owner });
      const h = stack(ctx, b.children, x + pad, y + pad, w - pad * 2, gap, owner) + pad * 2;
      for (let i = rectIndex; i <= rectIndex + (b.shadow ? 1 : 0); i++) (ctx.items[i] as PlacedRect).h = h;
      return h;
    }
    case "row": {
      const gap = b.gap ?? 10;
      const n = b.children.length;
      const weights = b.weights && b.weights.length === n ? b.weights : b.children.map(() => 1);
      const total = weights.reduce((s, v) => s + v, 0);
      const usable = w - gap * (n - 1);
      let cx = x;
      let h = 0;
      b.children.forEach((c, i) => {
        const cw = (usable * weights[i]) / total;
        h = Math.max(h, placeBlock(ctx, c, cx, y, cw, owner));
        cx += cw + gap;
      });
      return h;
    }
    case "icon": {
      const size = b.size ?? 18;
      if (b.tile) {
        const t = size + 16;
        ctx.items.push({ type: "rect", x, y, w: t, h: t, r: 9, fill: b.tone === "good" ? "goodSoft" : b.tone === "warn" ? "warnSoft" : b.tone === "bad" ? "badSoft" : "accentSoft", owner });
        ctx.items.push({ type: "glyph", x: x + 8, y: y + 8, size, glyph: b.glyph, tone: b.tone ?? "accent", owner });
        return t;
      }
      ctx.items.push({ type: "glyph", x, y, size, glyph: b.glyph, tone: b.tone ?? "fg", owner });
      return size;
    }
    case "pill":
    case "pills": {
      const list = b.kind === "pill" ? [{ text: b.text, tone: b.tone }] : b.items;
      let px = x;
      let py = y;
      const ph = 22;
      for (const p of list) {
        const pw = textWidth(p.text, 11, 600) + 18;
        if (px > x && px + pw > x + w) {
          px = x;
          py += ph + 6;
        }
        const tone = p.tone ?? "neutral";
        ctx.items.push({ type: "rect", x: px, y: py, w: pw, h: ph, r: ph / 2, fill: PILL_TONE_FILL[tone], owner });
        ctx.items.push({ type: "text", x: px + pw / 2, y: py + 15, lines: [p.text], size: 11, weight: 600, tone: PILL_TONE_TEXT[tone], anchor: "middle", lineHeight: 11, font: "sans", maxWidth: pw, owner });
        px += pw + 6;
      }
      return py - y + ph;
    }
    case "divider":
      ctx.items.push({ type: "line", x1: x, y1: y + 0.5, x2: x + w, y2: y + 0.5, owner });
      return 1;
    case "space":
      return b.height;
    case "spinner": {
      ctx.items.push({ type: "spinner", cx: x + 11, cy: y + 11, r: 9, owner });
      if (b.label) {
        ctx.items.push({ type: "text", x: x + 30, y: y + 15.5, lines: [b.label], size: 12.5, weight: 400, tone: "muted", anchor: "start", lineHeight: 12.5, font: "sans", maxWidth: w - 30, owner });
      }
      return 22;
    }
    case "skeleton": {
      let sy = y;
      let sx = x;
      if (b.avatar) {
        ctx.items.push({ type: "rect", x, y, w: 36, h: 36, r: 18, fill: "muted", owner });
        sx = x + 46;
      }
      const widths = [1, 0.86, 0.64, 0.92, 0.5];
      for (let i = 0; i < b.lines; i++) {
        ctx.items.push({ type: "rect", x: sx, y: sy, w: (x + w - sx) * widths[i % widths.length], h: 10, r: 5, fill: "muted", owner });
        sy += 18;
      }
      return Math.max(sy - y - 8, b.avatar ? 36 : 0);
    }
    case "nav": {
      const h = 40;
      let tx = x;
      if (b.back) {
        ctx.items.push({ type: "glyph", x, y: y + 11, size: 18, glyph: "arrow", tone: "fg", owner });
        tx = x + 28;
      }
      ctx.items.push({ type: "text", x: tx, y: y + 25, lines: [b.title], size: 15, weight: 700, tone: "fg", anchor: "start", lineHeight: 15, font: "sans", maxWidth: w - (tx - x) - 70, owner });
      if (b.action) ctx.items.push({ type: "text", x: x + w, y: y + 25, lines: [b.action], size: 13, weight: 600, tone: "accent", anchor: "end", lineHeight: 13, font: "sans", maxWidth: 70, owner });
      ctx.items.push({ type: "line", x1: x - 16, y1: y + h, x2: x + w + 16, y2: y + h, owner });
      return h;
    }
    case "stat": {
      const vh = placeText(ctx, { kind: "text", text: b.value, size: 24, weight: 700, tone: b.tone ?? "fg" }, x, y, w, owner);
      return vh + 2 + placeText(ctx, { kind: "text", text: b.label, size: 11.5, tone: "muted" }, x, y + vh + 2, w, owner);
    }
    case "progress": {
      let py = y;
      if (b.label) py += placeText(ctx, { kind: "text", text: b.label, size: 12, tone: "muted" }, x, y, w, owner) + 4;
      const v = Math.max(0, Math.min(1, b.value));
      ctx.items.push({ type: "rect", x, y: py, w, h: 8, r: 4, fill: "muted", owner });
      if (v > 0) ctx.items.push({ type: "rect", x, y: py, w: Math.max(8, w * v), h: 8, r: 4, fill: "accent", owner });
      return py - y + 8;
    }
  }
}

function stack(ctx: Ctx, blocks: SpecBlock[], x: number, y: number, w: number, gap: number, owner?: string): number {
  let cy = y;
  blocks.forEach((b, i) => {
    cy += placeBlock(ctx, b, x, cy, w, owner);
    if (i < blocks.length - 1 && b.kind !== "space") cy += gap;
  });
  return cy - y;
}

/** Lay a screen out: every shape with its position, and the region of every block with an id. */
export function layoutScreen(screen: SpecScreen): ScreenLayout {
  const frame = screen.frame ?? "phone";
  const pageW = screen.width ?? 300;
  const pad = screen.pad ?? 16;
  const gap = screen.gap ?? 12;
  const margin = FRAME_MARGIN[frame];
  const top = frame === "phone" ? margin + PHONE_TOP : frame === "browser" ? BROWSER_BAR : 0;
  const ctx: Ctx = { items: [], regions: [] };
  const contentH = stack(ctx, screen.blocks, margin + pad, top + pad, pageW - pad * 2, gap);
  const pageH = contentH + pad * 2;
  const height = top + pageH + (frame === "phone" ? margin + 8 : 0);
  return {
    width: pageW + margin * 2,
    height,
    page: { x: margin, y: top, w: pageW, h: pageH },
    items: ctx.items,
    regions: ctx.regions,
  };
}

/** Ids used by blocks anywhere in a screen, in order. */
export function blockIds(blocks: SpecBlock[]): string[] {
  const out: string[] = [];
  const walk = (list: SpecBlock[]) => {
    for (const b of list) {
      if (b.id) out.push(b.id);
      if (b.kind === "box" || b.kind === "row") walk(b.children);
    }
  };
  walk(blocks);
  return out;
}

/**
 * Lines of text that run past the box they were wrapped to (only possible for
 * a single word wider than the box). Tests use it to keep labels on a phone.
 */
export function overflowingText(layout: ScreenLayout): PlacedText[] {
  return layout.items.filter((p): p is PlacedText => p.type === "text" && p.lines.some((l) => textWidth(l, p.size, p.weight, p.font) > p.maxWidth + 0.5));
}

/** Relative luminance of a "#rrggbb" colour, as WCAG 2.2 defines it. */
export function relativeLuminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Not a #rrggbb colour: ${hex}`);
  const channel = (i: number) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** WCAG contrast ratio between two colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
