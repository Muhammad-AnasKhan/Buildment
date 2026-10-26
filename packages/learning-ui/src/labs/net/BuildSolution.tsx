"use client";

// A build lab's solution, behind the same deliberate click as the other net
// labs. Each step says why, and the finished canvas can be loaded to compare.

import type { NetSolution } from "../types";
import { Reveal } from "./NetSolution";

export function BuildSolutionPanel({ solution, onLoad }: { solution: NetSolution; onLoad: () => void }) {
  const build = solution.build;
  if (!build) return null;
  return (
    <Reveal label="Show a solution">
      <p className="mb-3 text-sm">{solution.summary}</p>
      <ol className="list-decimal space-y-2 pl-5">
        {build.steps.map((step, i) => (
          <li key={i} className="text-sm">
            {step.text}
            <p className="mt-0.5 text-muted-foreground">{step.why}</p>
          </li>
        ))}
      </ol>
      <button type="button" onClick={onLoad} className="mt-3 min-h-9 rounded-lg bg-violet-600 px-3 py-1 text-sm font-medium text-white">
        Put this on the canvas
      </button>
    </Reveal>
  );
}
