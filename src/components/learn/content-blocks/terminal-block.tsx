import { Children, isValidElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LearnPanelShell } from "./learn-panel-shell";
import { DarkCodePane } from "./dark-code-pane";

export type TerminalLineType = "prompt" | "output" | "error";

export type TerminalLineProps = {
  type?: TerminalLineType;
  children?: ReactNode;
};

export function TerminalLine(_props: TerminalLineProps) {
  return null;
}

TerminalLine.displayName = "TerminalLine";

function collectLines(children: ReactNode): TerminalLineProps[] {
  const lines: TerminalLineProps[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const type = child.type as { displayName?: string; name?: string };
    if (type?.displayName === "TerminalLine" || type?.name === "TerminalLine") {
      lines.push(child.props as TerminalLineProps);
    }
  });
  return lines;
}

type TerminalBlockProps = {
  title?: string;
  cwd?: string;
  children?: ReactNode;
};

export function TerminalBlock({ title, cwd, children }: TerminalBlockProps) {
  const lines = collectLines(children);

  return (
    <LearnPanelShell eyebrow="Terminal" title={title} contentClassName="border-neutral-800 bg-[#0d1117]">
      {cwd ? (
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2">
          <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[11px] text-neutral-400">
            {cwd}
          </span>
        </div>
      ) : null}
      <DarkCodePane className="p-4">
        <pre className="m-0 whitespace-pre-wrap">
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                line.type === "prompt" && "text-[#79c0ff]",
                line.type === "output" && "text-neutral-400",
                line.type === "error" && "text-amber-400"
              )}
            >
              {line.type === "prompt" ? "$ " : line.type === "error" ? "✗ " : ""}
              {line.children}
            </div>
          ))}
        </pre>
      </DarkCodePane>
    </LearnPanelShell>
  );
}
