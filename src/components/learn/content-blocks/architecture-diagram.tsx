import { Children, isValidElement, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LearnPanelShell } from "./learn-panel-shell";
import { ARCH_LAYER_STYLES, type ArchLayer } from "./types";

export type ArchNodeProps = {
  layer: ArchLayer;
  children?: ReactNode;
};

export function ArchNode(_props: ArchNodeProps) {
  return null;
}

ArchNode.displayName = "ArchNode";

function collectNodes(children: ReactNode): ArchNodeProps[] {
  const nodes: ArchNodeProps[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const type = child.type as { displayName?: string; name?: string };
    if (type?.displayName === "ArchNode" || type?.name === "ArchNode") {
      nodes.push(child.props as ArchNodeProps);
    }
  });
  return nodes;
}

type ArchitectureDiagramProps = {
  title?: string;
  children?: ReactNode;
};

export function ArchitectureDiagram({ title, children }: ArchitectureDiagramProps) {
  const nodes = collectNodes(children);

  return (
    <LearnPanelShell eyebrow="Architecture" title={title}>
      <div className="flex flex-col items-stretch gap-0 p-5 sm:p-6">
        {nodes.map((node, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={cn(
                "w-full rounded-xl border px-5 py-4 shadow-sm",
                ARCH_LAYER_STYLES[node.layer] ?? ARCH_LAYER_STYLES.External
              )}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                {node.layer}
              </p>
              <div className="mt-2 text-sm font-medium leading-relaxed text-neutral-800">
                {node.children}
              </div>
            </div>
            {index < nodes.length - 1 ? (
              <ArrowDown className="my-2 size-5 shrink-0 text-indigo-400" aria-hidden />
            ) : null}
          </div>
        ))}
      </div>
    </LearnPanelShell>
  );
}
