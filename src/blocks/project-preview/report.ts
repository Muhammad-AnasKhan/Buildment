import type { ProjectPreviewConfig } from "./schema";

// Stub projector — see docs/06-reports.mdx.
export function reportProjectPreview(_config: ProjectPreviewConfig) {
  return {
    type: "PROJECT_PREVIEW" as const,
    title: "Project preview",
    summary: "",
    details: [],
  };
}
