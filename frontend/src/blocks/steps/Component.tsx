import { fetchBlockState } from "@/blocks/block-state";
import { StepsClient } from "./StepsClient";
import { Step } from "./Step";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

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

  const content = hasArraySteps ? (
    <ol className="m-0 p-0 space-y-2">
      {steps!.map((step, index) => {
        if (typeof step === "string") {
          return (
            <Step key={index} stepNumber={index + 1} title={`Step ${index + 1}`}>
              {step}
            </Step>
          );
        }
        return (
          <Step
            key={index}
            stepNumber={index + 1}
            title={step.title || `Step ${index + 1}`}
            description={step.description || step.content}
          >
            {step.content || step.description}
          </Step>
        );
      })}
    </ol>
  ) : (
    children
  );

  return <StepsClient title={resolvedTitle}>{content}</StepsClient>;
}
