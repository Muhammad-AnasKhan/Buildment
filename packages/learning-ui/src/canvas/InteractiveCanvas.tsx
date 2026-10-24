import { FactorCanvas } from "./renderers/factor/FactorCanvas";
import { SequenceCanvas } from "./renderers/sequence/SequenceCanvas";
import { SliderCanvas } from "./renderers/slider/SliderCanvas";
import { StateMachineCanvas } from "./renderers/state-machine/StateMachineCanvas";
import { SceneCanvas } from "./renderers/scene/SceneCanvas";
import { CANVAS_SLUGS, canvasRegistry, getCanvasSpec, type CanvasSpec } from "./registry";

/**
 * <InteractiveCanvas slug="..." /> from chapter MDX. Looks the slug up in the
 * registry and renders that canvas. The server renders the starting state, so
 * the canvas is readable before its script arrives on a slow connection. An
 * unknown slug renders a quiet note instead of an error, and the chapter's
 * prose still carries the idea.
 */
export function InteractiveCanvas({ slug }: { slug?: unknown }) {
  const spec = getCanvasSpec(slug);
  if (!spec) return <CanvasUnavailable />;
  return <CanvasForSpec spec={spec} />;
}

export function CanvasForSpec({ spec }: { spec: CanvasSpec }) {
  switch (spec.kind) {
    case "sequence":
      return <SequenceCanvas spec={spec} />;
    case "state-machine":
      return <StateMachineCanvas spec={spec} />;
    case "factor":
      return <FactorCanvas spec={spec} />;
    case "scene":
      return <SceneCanvas spec={spec} />;
    case "slider": {
      // Slider specs hold functions, so the client component looks its spec up by slug.
      const slug = CANVAS_SLUGS.find((candidate) => canvasRegistry[candidate] === spec);
      return slug ? <SliderCanvas slug={slug} /> : null;
    }
    case "custom": {
      const Component = spec.component;
      return <Component title={spec.title} purpose={spec.purpose} limits={spec.limits} />;
    }
  }
}

function CanvasUnavailable() {
  return (
    <div role="note" className="not-prose my-8 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      This interactive part is not available right now. The text around it explains the same idea.
    </div>
  );
}
