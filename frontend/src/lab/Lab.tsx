// <Lab slug="..." /> from chapter MDX. Looks the slug up in the lab registry and
// renders the interactive board for an hld lab, the network board or planner
// for a net lab (a schema placeholder for db). An
// unknown slug renders a quiet note, and the chapter prose still carries the
// idea. Self-contained so it does not depend on the canvas primitives layer.

import { getLabSpec } from "./registry";
import type { LabSpec } from "./types";
import { HldBoard } from "./HldBoard";
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

function LabFrame({ eyebrow, title, purpose, limits, children }: { eyebrow: string; title: string; purpose: string; limits: string; children: React.ReactNode }) {
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

export function Lab({ slug }: { slug?: unknown }) {
  const resolved = resolveLab(slug);
  if (!resolved) return <LabUnavailable />;
  const { spec } = resolved;

  if (spec.family === "hld") {
    return (
      <LabFrame eyebrow="Explore" title={spec.title} purpose={spec.purpose} limits={spec.limits}>
        <HldBoard spec={spec} />
      </LabFrame>
    );
  }

  if (spec.family === "net") {
    const eyebrow = spec.mode === "fault" ? "Fix it" : spec.mode === "plan" ? "Plan it" : "Explore";
    return (
      <LabFrame eyebrow={eyebrow} title={spec.title} purpose={spec.purpose} limits={spec.limits}>
        {spec.mode === "plan" && spec.plan ? <PlanBoard plan={spec.plan} /> : <NetBoard spec={spec} />}
      </LabFrame>
    );
  }

  return (
    <LabFrame eyebrow="Explore" title={spec.title} purpose={spec.purpose} limits={spec.limits}>
      <p className="text-sm text-muted-foreground">The schema board loads in the full lab.</p>
    </LabFrame>
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
