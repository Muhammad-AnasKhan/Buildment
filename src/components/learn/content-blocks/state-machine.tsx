import { MermaidDiagram } from "@/components/learn/mermaid-diagram";
import { LearnPanelShell } from "./learn-panel-shell";

type StateMachineProps = {
  title?: string;
  chart?: string;
};

export function StateMachine({ title, chart = "" }: StateMachineProps) {
  const trimmed = chart.trim();
  const normalized =
    trimmed.startsWith("stateDiagram") || trimmed.startsWith("stateDiagram-v2")
      ? trimmed
      : `stateDiagram-v2\n${trimmed}`;

  return (
    <LearnPanelShell eyebrow="State flow" title={title} contentClassName="border-0 bg-transparent shadow-none">
      <MermaidDiagram chart={normalized} />
    </LearnPanelShell>
  );
}
