import { prisma } from "@/server/db";
import { VisualDiagramConfigSchema } from "./schema";
import { VisualDiagramClient } from "./VisualDiagramClient";

export async function VisualDiagramComponent({
  id,
  title,
  imageUrl,
  alt,
  caption,
  kind = "concept",
  legend,
}: {
  id?: string;
  title?: string;
  imageUrl?: string;
  alt?: string;
  caption?: string;
  kind?: "system" | "concept" | "whiteboard";
  legend?: string[];
}) {
  if (title && imageUrl) {
    return (
      <VisualDiagramClient
        title={title}
        imageUrl={imageUrl}
        alt={alt ?? title}
        caption={caption}
        kind={kind}
        legend={legend}
      />
    );
  }


  if (!id) return null;

  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? VisualDiagramConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "VISUAL_DIAGRAM" || !parsed?.success) {
    return <div className="not-prose my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">Visual diagram block {id} is missing or misconfigured.</div>;
  }
  return <VisualDiagramClient {...parsed.data} />;
}

