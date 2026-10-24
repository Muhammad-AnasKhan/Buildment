// <Lab slug="..." /> from chapter MDX. Looks the slug up in the lab registry and
// renders the lab's static starting board, readable before any editor script
// loads. The interactive drag-and-build editor hydrates over this in a later
// plan. An unknown slug renders a quiet note, and the chapter prose still
// carries the idea.

import { CanvasFrame, CanvasNotes } from "@buildment/learning-ui/canvas/primitives/canvas-frame";
import { getLabSpec } from "./registry";
import type { LabSpec } from "./types";
import { HldBoard } from "./HldBoard";

export function resolveLab(slug: unknown): { spec: LabSpec } | null {
  if (typeof slug !== "string") return null;
  const spec = getLabSpec(slug);
  return spec ? { spec } : null;
}

export function labView(spec: LabSpec): "hld-board" | "db-placeholder" {
  return spec.family === "hld" ? "hld-board" : "db-placeholder";
}

export function Lab({ slug }: { slug?: unknown }) {
  const resolved = resolveLab(slug);
  if (!resolved) return <LabUnavailable />;
  const { spec } = resolved;

  if (spec.family === "hld") {
    return (
      <CanvasFrame eyebrow="Explore" title={spec.title} purpose={spec.purpose}>
        <HldBoard spec={spec} />
        <CanvasNotes limits={spec.limits} />
      </CanvasFrame>
    );
  }

  return (
    <CanvasFrame eyebrow="Explore" title={spec.title} purpose={spec.purpose}>
      <p className="not-prose text-sm text-muted-foreground">
        The schema board loads in the full lab.
      </p>
      <CanvasNotes limits={spec.limits} />
    </CanvasFrame>
  );
}

function LabUnavailable() {
  return (
    <div
      role="note"
      className="not-prose my-8 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
    >
      This lab is not available right now. The text around it explains the same idea.
    </div>
  );
}
