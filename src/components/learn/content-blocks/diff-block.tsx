import { diffLines } from "diff";
import { cn } from "@/lib/utils";
import { LearnPanelShell } from "./learn-panel-shell";
import { DarkCodePane } from "./dark-code-pane";

type DiffBlockProps = {
  title?: string;
  language?: string;
  before?: string;
  after?: string;
};

function LineBlock({ text, variant }: { text: string; variant: "before" | "after" | "neutral" }) {
  return (
    <pre className="m-0 p-4 whitespace-pre-wrap">
      {text.split("\n").map((line, i) => (
        <div
          key={i}
          className={cn(
            variant === "before" && "text-red-200/90",
            variant === "after" && "text-emerald-200/90",
            variant === "neutral" && "text-neutral-300"
          )}
        >
          {line || " "}
        </div>
      ))}
    </pre>
  );
}

function UnifiedDiff({ before, after }: { before: string; after: string }) {
  const parts = diffLines(before, after);

  return (
    <pre className="m-0 p-4 whitespace-pre-wrap">
      {parts.map((part, i) => (
        <span
          key={i}
          className={cn(
            part.added && "block bg-emerald-950/50 text-emerald-200",
            part.removed && "block bg-red-950/50 text-red-200",
            !part.added && !part.removed && "block text-neutral-300"
          )}
        >
          {part.value}
        </span>
      ))}
    </pre>
  );
}

export function DiffBlock({ title, language = "text", before = "", after = "" }: DiffBlockProps) {
  return (
    <LearnPanelShell eyebrow="Diff" title={title}>
      <div className="border-b border-neutral-200 bg-neutral-50/80 px-4 py-2 sm:px-5">
        <span className="font-mono text-xs text-neutral-500">{language}</span>
      </div>
      <div className="hidden overflow-hidden lg:grid lg:grid-cols-2 lg:divide-x lg:divide-neutral-800">
        <div className="min-w-0">
          <div className="border-b border-neutral-800 bg-neutral-900 px-4 py-2">
            <span className="font-mono text-[11px] font-medium text-red-300/80">Before</span>
          </div>
          <DarkCodePane>
            <LineBlock text={before} variant="before" />
          </DarkCodePane>
        </div>
        <div className="min-w-0">
          <div className="border-b border-neutral-800 bg-neutral-900 px-4 py-2">
            <span className="font-mono text-[11px] font-medium text-emerald-300/80">After</span>
          </div>
          <DarkCodePane>
            <LineBlock text={after} variant="after" />
          </DarkCodePane>
        </div>
      </div>
      <div className="lg:hidden">
        <DarkCodePane>
          <UnifiedDiff before={before} after={after} />
        </DarkCodePane>
      </div>
    </LearnPanelShell>
  );
}
