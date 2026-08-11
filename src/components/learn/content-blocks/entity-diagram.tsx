import { MermaidDiagram } from "@/components/learn/mermaid-diagram";
import { LearnPanelShell } from "./learn-panel-shell";

type EntityDiagramProps = {
  title?: string;
  chart?: string;
  legend?: string;
};

export function EntityDiagram({ title, chart = "", legend }: EntityDiagramProps) {
  const trimmed = chart.trim();
  const normalized = trimmed.startsWith("erDiagram") ? trimmed : `erDiagram\n${trimmed}`;

  return (
    <LearnPanelShell eyebrow="Data model" title={title} contentClassName="border-0 bg-transparent shadow-none">
      <MermaidDiagram chart={normalized} />
      {legend ? (
        <p className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm text-neutral-600">
          {legend}
        </p>
      ) : null}
    </LearnPanelShell>
  );
}
