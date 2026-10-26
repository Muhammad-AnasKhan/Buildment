import type { CSSProperties, ReactNode } from "react";

/** One labelled share of the traffic on a link, such as "cache misses" or "click writes". */
export interface WirePart {
  label: string;
  rate: number;
}

/** One part of a wire tag: a glyph that tells reads, cache misses and writes apart without colour. */
export function wirePartKind(label: string): { glyph: ReactNode; word: string; hint: string } {
  if (label.startsWith("reads")) {
    const hit = label.match(/(\d+)% answered/)?.[1];
    return {
      glyph: <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--lab-ok)]" />,
      word: hit ? `asked, ${hit}% found` : "asked",
      hint: "Lookups sent to the cache. The share found there is the hit rate. A cache hit means the database is never asked.",
    };
  }
  if (label.startsWith("cache miss")) {
    return {
      glyph: <span aria-hidden className="inline-block h-1.5 w-1.5 rotate-45 border border-[color:var(--lab-warm)]" />,
      word: "not in cache",
      hint: "Cache miss: the cache did not have the answer, so the database is asked.",
    };
  }
  if (label.startsWith("click writes")) {
    return { glyph: <span aria-hidden className="text-[8px] leading-none text-[color:var(--lab-routing)]">▸</span>, word: "saved", hint: "Writes: clicks being saved in the database." };
  }
  return { glyph: null, word: label, hint: label };
}

/**
 * The wire tag: one compact tag with a colour bar for the part the link leaves, and
 * one segment per kind of traffic (reads, cache misses, writes).
 */
export function WireTag({ color, flow, parts, className = "", style }: {
  color: string;
  /** Total requests a second, used when there are no parts. */
  flow: number;
  parts: WirePart[];
  className?: string;
  style?: CSSProperties;
}) {
  const shown = parts.length > 0 ? parts : [{ label: "", rate: flow }];
  return (
    <div
      className={`lab-mono flex items-stretch overflow-hidden whitespace-nowrap rounded-[4px] border-[1.5px] border-[color:var(--lab-grid)] bg-card text-[10px] font-medium text-card-foreground shadow-[0_1px_0_0_var(--lab-edge-shadow)] ${className}`}
      style={style}
    >
      <span aria-hidden className="w-[3px] shrink-0" style={{ backgroundColor: color }} />
      {shown.map((part, i) => {
        const k = part.label ? wirePartKind(part.label) : null;
        return (
          <span key={part.label || i} title={k?.hint} className={`flex items-center gap-1 px-1.5 py-0.5 ${i > 0 ? "border-l border-[color:var(--lab-grid)]" : ""}`}>
            {k?.glyph}
            <span className="font-bold">{Math.round(part.rate).toLocaleString()}/s</span>
            {k ? <span className="text-muted-foreground">{k.word}</span> : null}
            {part.label ? <span className="sr-only">{part.label}</span> : null}
          </span>
        );
      })}
    </div>
  );
}
