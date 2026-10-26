import { fetchBlockState } from "@/blocks/block-state";
import { Steps } from "@buildment/learning-ui/blocks/steps/Steps";
import { PendingBlockCard } from "@buildment/learning-ui/components/learn/pending-block-card";

export type StepItemData =
  | string
  | {
      title?: string;
      description?: string;
      content?: string;
    };

export async function StepsComponent({
  id,
  title,
  steps,
  children,
}: {
  id?: string;
  title?: string;
  steps?: StepItemData[];
  children?: React.ReactNode;
}) {
  let resolvedTitle = title;

  if (id) {
    const state = await fetchBlockState(id, "STEPS");
    if (state?.config.title) resolvedTitle = resolvedTitle || state.config.title;
  }

  const hasArraySteps = Array.isArray(steps) && steps.length > 0;
  const hasChildren = Boolean(children);

  if (!hasArraySteps && !hasChildren && !resolvedTitle) {
    if (id) {
      return (
        <PendingBlockCard
          typeLabel="Interactive Steps"
          title="Step-by-step guide in progress"
          description="Numbered instructions for this section are being prepared."
          blockId={id}
        />
      );
    }
    return null;
  }

  return <Steps title={resolvedTitle} steps={steps}>{children}</Steps>;
}
