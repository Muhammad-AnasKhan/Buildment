// Labs a chapter may embed as <Lab slug="..." />.
// See agent-ip/work/system-design/04-component-lab-platform.md. The frontend
// registry (frontend/src/lab/registry.ts) maps each slug to a LabSpec and a
// frontend test keeps the two lists identical. A breaking change to a lab gets
// a new slug, so chapters that already use the old one keep working.
export const LAB_SLUGS = [
  "hld-m2-utilisation-knee",
  "hld-m4-three-tiers",
  "hld-m20-wasla-redirects",
  "hld-visual-url-shortener",
  "aws-web-tier",
  "k8s-web-app",
  "docker-compose-stack",
  "linux-single-host",
  "net-explore-office",
  "net-lab-fix-office",
  "net-lab-plan-school",
] as const;

export type LabSlug = (typeof LAB_SLUGS)[number];

const labSlugSet: ReadonlySet<string> = new Set(LAB_SLUGS);

export function isLabSlug(value: unknown): value is LabSlug {
  return typeof value === "string" && labSlugSet.has(value);
}
