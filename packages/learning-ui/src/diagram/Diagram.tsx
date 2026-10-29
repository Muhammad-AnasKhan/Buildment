"use client";

import { createElement, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { describeDiagram, stepCaptions } from "../shared/diagram/describe";
import { BRAND, DIAGRAM_FONT, drawScene, packetPoint, type DrawState, type SvgNode } from "../shared/diagram/draw";
import { layoutDiagram, pathPoint, type Point, type Scene } from "../shared/diagram/layout";
import { isDiagramKind, parseDiagram, type DiagramSpec } from "../shared/diagram/spec";

/**
 * <Diagram kind="flow" spec="..." /> from a ```flow or ```sequence fence
 * (remark-diagram). The server renders both the wide and the phone layout and
 * a container query shows the one that fits, so the picture is readable
 * before any script arrives. Steps: Back and Next, the arrow keys on the
 * controls, or dragging the yellow packet.
 */
export function Diagram({ kind, spec, legend }: { kind?: unknown; spec?: unknown; legend?: string }) {
  const parsed = useMemo(() => (isDiagramKind(kind) && typeof spec === "string" ? parseDiagram(kind, spec) : null), [kind, spec]);
  if (!parsed) return <DiagramProblems problems={["This diagram has no spec. Write it inside a ```flow or ```sequence fence."]} />;
  if (!parsed.ok) return <DiagramProblems problems={parsed.problems} />;
  return <DiagramView spec={parsed.spec} legend={legend} />;
}

// The phone layout takes over once the wide one would shrink below about 85%.
// Literal class names, so Tailwind generates them.
const SWITCH: [number, string, string][] = [
  [320, "@max-[320px]:hidden", "hidden @max-[320px]:block"],
  [400, "@max-[400px]:hidden", "hidden @max-[400px]:block"],
  [480, "@max-[480px]:hidden", "hidden @max-[480px]:block"],
  [560, "@max-[560px]:hidden", "hidden @max-[560px]:block"],
  [640, "@max-[640px]:hidden", "hidden @max-[640px]:block"],
  [720, "@max-[720px]:hidden", "hidden @max-[720px]:block"],
];

function switchClasses(wideWidth: number): { wide: string; compact: string } {
  const at = wideWidth * 0.85;
  if (at < 300) return { wide: "", compact: "hidden" };
  // Wider than any reading column (a long left-to-right chain): always the top-to-bottom layout.
  if (at > 800) return { wide: "hidden", compact: "" };
  const match = SWITCH.find(([width]) => width >= at) ?? SWITCH[SWITCH.length - 1];
  return { wide: match[1], compact: match[2] };
}

/** `legend` is the short note a MermaidDiagram tag carries, shown under the picture. */
export function DiagramView({ spec, legend }: { spec: DiagramSpec; legend?: string }) {
  const id = useId();
  const wide = useMemo(() => layoutDiagram(spec, false), [spec]);
  const compact = useMemo(() => layoutDiagram(spec, true), [spec]);
  const captions = useMemo(() => stepCaptions(spec), [spec]);
  const description = useMemo(() => describeDiagram(spec), [spec]);
  const [step, setStep] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const classes = switchClasses(wide.viewBox.w);
  const stepped = captions.length > 1 || spec.kind === "sequence";
  const last = captions.length - 1;
  const go = (next: number) => setStep(Math.max(0, Math.min(last, next)));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = { ArrowLeft: step - 1, ArrowUp: step - 1, ArrowRight: step + 1, ArrowDown: step + 1, Home: 0, End: last };
    if (!(event.key in moves)) return;
    event.preventDefault();
    go(moves[event.key]);
  };

  const showList = spec.kind === "sequence";
  return (
    <figure
      className="not-prose my-8 @container"
      style={{ background: BRAND.tint, color: BRAND.ink, fontFamily: DIAGRAM_FONT }}
      aria-labelledby={`${id}-title`}
    >
      <figcaption id={`${id}-title`} className="px-4 pt-4 text-base font-bold leading-snug sm:px-5">
        {spec.title}
      </figcaption>
      <p id={`${id}-desc`} className="sr-only">{description}</p>
      <div className={`overflow-x-auto ${classes.wide}`}>
        <DiagramSvg scene={wide} spec={spec} step={step} drag={drag} setDrag={setDrag} setStep={go} labelledBy={`${id}-title`} describedBy={`${id}-desc`} />
      </div>
      <div className={`overflow-x-auto ${classes.compact}`}>
        <DiagramSvg scene={compact} spec={spec} step={step} drag={drag} setDrag={setDrag} setStep={go} labelledBy={`${id}-title`} describedBy={`${id}-desc`} />
        {showList ? (
          <ol className="space-y-1 px-4 pb-2 text-[15px] leading-snug" aria-hidden>
            {captions.map((caption, i) => (
              <li key={i} className="flex gap-2" style={{ fontWeight: i === step ? 700 : 500, color: i === step ? BRAND.cobalt : BRAND.ink }}>
                <span className="tabular-nums">{i + 1}.</span>
                <span>{caption}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
      {stepped ? (
        <div className="flex flex-col gap-3 px-4 pb-4 pt-1 sm:px-5" role="group" aria-label="Diagram steps" onKeyDown={onKeyDown}>
          <p className="min-h-[3rem] text-[15px] leading-snug" aria-live="polite">
            <span className="mr-2 font-bold tabular-nums" style={{ color: BRAND.cobalt }}>
              {step + 1} of {captions.length}
            </span>
            {captions[step]}
          </p>
          <div className="flex gap-2">
            <StepButton onClick={() => go(step - 1)} disabled={step === 0} primary={false}>Back</StepButton>
            <StepButton onClick={() => go(step + 1)} disabled={step === last} primary>Next</StepButton>
          </div>
        </div>
      ) : (
        <div className="pb-2" />
      )}
      {legend ? (
        <p className="px-4 pb-4 text-[15px] leading-snug sm:px-5" style={{ color: BRAND.muted }}>
          {legend}
        </p>
      ) : null}
    </figure>
  );
}

function StepButton({ onClick, disabled, primary, children }: { onClick: () => void; disabled: boolean; primary: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-11 min-w-24 px-5 text-[15px] font-bold outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 disabled:opacity-40"
      style={{
        background: primary ? BRAND.cobalt : BRAND.white,
        color: primary ? BRAND.paper : BRAND.ink,
        border: `2px solid ${primary ? BRAND.cobalt : BRAND.ink}`,
        ["--tw-ring-color" as string]: BRAND.ink,
        ["--tw-ring-offset-color" as string]: BRAND.tint,
      }}
    >
      {children}
    </button>
  );
}

type SvgProps = {
  scene: Scene;
  spec: DiagramSpec;
  step: number;
  drag: number | null;
  setDrag: (t: number | null) => void;
  setStep: (step: number) => void;
  labelledBy: string;
  describedBy: string;
};

function DiagramSvg({ scene, spec, step, drag, setDrag, setStep, labelledBy, describedBy }: SvgProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const hasPacket = spec.kind === "flow" && spec.hops.length > 0;

  const state: DrawState = {};
  if (hasPacket) {
    const t = drag ?? step;
    state.packet = packetPoint(scene, spec.hops, t);
    state.packetHandle = true;
    const hop = drag === null ? step - 1 : Math.min(spec.hops.length - 1, Math.floor(drag));
    state.activeEdge = hop >= 0 ? spec.hops[hop].edge : null;
    state.activeNode = drag === null ? spec.packet[step] : null;
  } else if (spec.kind === "sequence") {
    state.activeEdge = step;
    state.fadedEdges = new Set(spec.edges.map((_, i) => i).filter((i) => i > step));
    const edge = scene.edges[step];
    state.packet = edge ? pathPoint(edge.path, 0.8) : null;
  }

  const nearest = (event: PointerEvent): number | null => {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    let best = { t: 0, d: Infinity };
    for (let s = 0; s <= spec.hops.length * 24; s++) {
      const t = s / 24;
      const q = packetPoint(scene, spec.hops, t) as Point;
      const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
      if (d < best.d) best = { t, d };
    }
    return best.t;
  };

  const packetHandlers = hasPacket
    ? {
        style: { cursor: drag === null ? "grab" : "grabbing", touchAction: "none" },
        onPointerDown: (event: PointerEvent<SVGGElement>) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setDrag(step);
        },
        onPointerMove: (event: PointerEvent<SVGGElement>) => {
          if (drag === null) return;
          const t = nearest(event);
          if (t !== null) setDrag(t);
        },
        onPointerUp: () => {
          if (drag !== null) setStep(Math.round(drag));
          setDrag(null);
        },
        onPointerCancel: () => setDrag(null),
      }
    : {};

  const tree = drawScene(scene, state);
  return toReact(tree, {
    svg: {
      ref: svgRef,
      role: "img",
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      className: "mx-auto block h-auto w-full",
      // Never shrink text below about 72%: a very large diagram scrolls sideways in its panel instead.
      style: { maxWidth: scene.viewBox.w, minWidth: Math.round(scene.viewBox.w * 0.72), fontFamily: DIAGRAM_FONT },
    },
    packet: packetHandlers,
  });
}

/** Maps the shared element tree to React elements, merging extra props by key. */
function toReact(node: SvgNode | string, extra: Record<string, Record<string, unknown>>): ReactNode {
  if (typeof node === "string") return node;
  const { style: _style, ...attrs } = node.attrs;
  const props: Record<string, unknown> = { ...attrs, key: node.key, ...(node.key ? extra[node.key] : undefined) };
  return createElement(node.tag, props, ...(node.children ?? []).map((child) => toReact(child, extra)));
}

export function DiagramProblems({ problems }: { problems: string[] }) {
  return (
    <div role="note" className="not-prose my-8 px-4 py-3 text-sm" style={{ background: BRAND.white, color: BRAND.ink, border: `2px dashed ${BRAND.ink}` }}>
      <p className="font-bold">This diagram could not be drawn.</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {problems.map((problem, i) => (
          <li key={i}>{problem}</li>
        ))}
      </ul>
    </div>
  );
}
