import { useId } from "react";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONES, type Tone } from "./tones";

// Small SVG pieces every beat picture shares, so all of them read as one family.

/** A soft dotted canvas behind the picture. Draw it first. */
export function DotGrid({ width, height }: { width: number; height: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <>
      <defs>
        <pattern id={id} width={16} height={16} patternUnits="userSpaceOnUse">
          <circle cx={1.5} cy={1.5} r={1} className="fill-muted-foreground/20" />
        </pattern>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill={`url(#${id})`} />
    </>
  );
}

const VERDICT_ICON: Record<Tone, typeof CircleCheck> = { good: CircleCheck, bad: CircleX, warn: TriangleAlert, accent: Info };

/** The result of the picture, as a banner across the top with an icon and words. */
export function VerdictBanner({ width, text, tone, opacity = 1, y = 8 }: { width: number; text: string; tone: Tone; opacity?: number; y?: number }) {
  const w = Math.min(width - 16, text.length * 8.3 + 46);
  const left = (width - w) / 2;
  const t = TONES[tone];
  const IconCmp = VERDICT_ICON[tone];
  return (
    <g opacity={opacity} transform={`translate(0 ${-4 * (1 - opacity)})`}>
      {/* An opaque card under the tint, so the banner never reads faint over the dots. */}
      <rect x={left} y={y} width={w} height={30} rx={15} className="fill-card" />
      <rect x={left} y={y} width={w} height={30} rx={15} className={cn(t.softFill, t.stroke)} strokeWidth={2} />
      <IconCmp x={left + 10} y={y + 7} width={16} height={16} strokeWidth={2.25} className={cn(t.stroke, "fill-none")} aria-hidden />
      <text x={left + 32} y={y + 20} className={cn(t.text, "text-[14.5px] font-bold")}>{text}</text>
    </g>
  );
}
