import { ProjectPreviewView } from '@buildment/learning-ui/blocks/project-preview/ProjectPreviewView';
import { fetchBlockState } from "@/blocks/block-state";
import type { ProjectPreviewConfig } from "@/shared/blocks/project-preview/schema";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export async function ProjectPreviewComponent({
  id,
  title,
  description,
  features,
  techStack,
  imageUrl,
}: {
  id?: string;
  title?: string;
  description?: string;
  features?: string[];
  techStack?: string[];
  imageUrl?: string;
}) {
  let config: ProjectPreviewConfig | null = null;

  if (title) {
    config = {
      title,
      description: description ?? "",
      features: Array.isArray(features) ? features : [],
      techStack: Array.isArray(techStack) ? techStack : [],
      imageUrl,
    };
  } else if (id) {
    config = (await fetchBlockState(id, "PROJECT_PREVIEW"))?.config ?? null;
  }

  if (!config) {
    if (id || title) {
      return (
        <PendingBlockCard
          typeLabel="Project Preview"
          title={title || "Project preview in progress"}
          description="The overview of what you will build in this module is being prepared."
          blockId={id}
        />
      );
    }
    return null;
  }

  return <ProjectPreviewView config={config} />;
}
