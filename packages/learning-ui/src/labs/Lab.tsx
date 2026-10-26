import type { ReactNode } from "react";
import type { LabSpec } from "./types";
import { HldBoard } from "./HldBoard";
import { getLabSpec } from "./registry";
import { NetBoard } from "./net/NetBoard";
import { PlanBoard } from "./net/PlanBoard";

export function resolveLab(slug: unknown): { spec: LabSpec } | null {
  if (typeof slug !== "string") return null;
  const spec = getLabSpec(slug);
  return spec ? { spec } : null;
}

export function labView(spec: LabSpec): "hld-board" | "net-board" | "net-plan" | "db-placeholder" {
  if (spec.family === "hld") return "hld-board";
  if (spec.family === "net") return spec.mode === "plan" ? "net-plan" : "net-board";
  return "db-placeholder";
}

function LabFrame({ eyebrow, title, purpose, limits, children }: { eyebrow: string; title: string; purpose: string; limits: string; children: ReactNode }) {
  return (
    <figure className="not-prose my-8">
      <figcaption className="mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{eyebrow}</div>
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
    <LabFrame eyebrow={resolvedSpec.family === "hld" && resolvedSpec.challenge ? "Visual challenge" : resolvedSpec.family === "net" ? resolvedSpec.mode === "fault" ? "Fix it" : resolvedSpec.mode === "plan" ? "Plan it" : "Explore" : "Explore"} title={resolvedSpec.title} purpose={resolvedSpec.purpose} limits={resolvedSpec.limits}>
      {resolvedSpec.family === "hld" ? <HldBoard spec={resolvedSpec} /> : resolvedSpec.family === "net" ? resolvedSpec.mode === "plan" && resolvedSpec.plan ? <PlanBoard plan={resolvedSpec.plan} solution={resolvedSpec.solution} /> : <NetBoard spec={resolvedSpec} /> : <p className="text-sm text-muted-foreground">The schema board loads in the full lab.</p>}
    </LabFrame>
  );
}
