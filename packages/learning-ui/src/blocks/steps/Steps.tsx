import type { ReactNode } from "react";
import { Step } from "./Step";
import { StepsClient } from "./StepsClient";

export type StepItemData = string | { title?: string; description?: string; content?: string };

export function Steps({ title, steps, children }: { title?: string; steps?: StepItemData[]; children?: ReactNode }) {
  const hasArraySteps = Array.isArray(steps) && steps.length > 0;
  const content = hasArraySteps ? (
    <ol className="m-0 space-y-2 p-0">
      {steps!.map((step, index) => typeof step === "string" ? (
        <Step key={index} stepNumber={index + 1} title={`Step ${index + 1}`}>{step}</Step>
      ) : (
        <Step key={index} stepNumber={index + 1} title={step.title || `Step ${index + 1}`} description={step.description || step.content}>
          {step.content || step.description}
        </Step>
      ))}
    </ol>
  ) : children;
  if (!content && !title) return null;
  return <StepsClient title={title}>{content}</StepsClient>;
}
