import type { ReactNode } from "react";
import type { LabSpec } from "./types";
import { HldBoard } from "./HldBoard";
import { getLabSpec } from "./registry";

export function resolveLab(slug: unknown): { spec: LabSpec } | null {
  if (typeof slug !== "string") return null;
  const spec = getLabSpec(slug);
  return spec ? { spec } : null;
}

export function labView(spec: LabSpec): "hld-board" | "db-placeholder" {
  return spec.family === "hld" ? "hld-board" : "db-placeholder";
}

function LabFrame({ title, purpose, limits, children }: { title: string; purpose: string; limits: string; children: ReactNode }) {
  return (
    <figure className="not-prose my-8">
      <figcaption className="mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Explore</div>
        <div className="text-lg font-semibold">{title}</div>
        <p className="text-sm text-muted-foreground">{purpose}</p>
      </figcaption>
      {children}
      <p className="mt-2 text-xs text-muted-foreground">{limits}</p>
    </figure>
  );
}

export function Lab({ spec, slug }: { spec?: LabSpec | null; slug?: unknown }) {
  const resolvedSpec = spec ?? resolveLab(slug)?.spec;
  if (!resolvedSpec) {
    return (
      <div role="note" className="not-prose my-8 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        This lab is not available right now. The text around it explains the same idea.
      </div>
    );
  }

  return (
    <LabFrame title={resolvedSpec.title} purpose={resolvedSpec.purpose} limits={resolvedSpec.limits}>
      {resolvedSpec.family === "hld" ? <HldBoard spec={resolvedSpec} /> : <p className="text-sm text-muted-foreground">The schema board loads in the full lab.</p>}
    </LabFrame>
  );
}
