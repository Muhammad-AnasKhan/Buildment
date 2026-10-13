import { fetchBlockState } from "@/blocks/block-state";
import { VisualDiagramClient } from "./VisualDiagramClient";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

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

  const state = await fetchBlockState(id, "VISUAL_DIAGRAM");
  if (!state) {
    return (
      <PendingBlockCard
        typeLabel="Visual Diagram"
        title={title || "Diagram in preparation"}
        description="The concept diagram for this topic is being prepared."
        blockId={id}
      />
    );
  }
  return <VisualDiagramClient {...state.config} />;
}

