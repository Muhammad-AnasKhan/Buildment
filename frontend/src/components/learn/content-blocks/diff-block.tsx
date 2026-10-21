import { diffLines, diffWordsWithSpace } from "diff";
import { cn } from "@/lib/utils";
import { LearnPanelShell } from "./learn-panel-shell";

type DiffBlockProps = {
  title?: string;
  language?: string;
  before?: string;
  after?: string;
};

type DiffKind = "context" | "removed" | "added";
type DiffSegment = { value: string; highlighted: boolean };
type DiffRow = {
  kind: DiffKind;
  text: string;
  oldNumber?: number;
  newNumber?: number;
  segments?: DiffSegment[];
};

function splitLines(value: string): string[] {
  if (!value) return [];
  const lines = value.split("\n");
  if (value.endsWith("\n")) lines.pop();
  return lines;
}

function wordSegments(before: string, after: string, kind: "removed" | "added"): DiffSegment[] {
  return diffWordsWithSpace(before, after)
    .filter((part) => kind === "removed" ? !part.added : !part.removed)
    .map((part) => ({ value: part.value, highlighted: kind === "removed" ? Boolean(part.removed) : Boolean(part.added) }));
}

function buildRows(before: string, after: string): DiffRow[] {
  const changes = diffLines(before, after);
  const rows: DiffRow[] = [];
  let oldNumber = 1;
  let newNumber = 1;

  for (let index = 0; index < changes.length; index++) {
    const change = changes[index]!;
    if (change.removed) {
      const removedLines = splitLines(change.value);
      const next = changes[index + 1];
      const addedLines = next?.added ? splitLines(next.value) : [];

      removedLines.forEach((text, lineIndex) => {
        rows.push({
          kind: "removed",
          text,
          oldNumber: oldNumber++,
          segments: addedLines[lineIndex] === undefined ? undefined : wordSegments(text, addedLines[lineIndex], "removed"),
        });
      });
      addedLines.forEach((text, lineIndex) => {
        rows.push({
          kind: "added",
          text,
          newNumber: newNumber++,
          segments: removedLines[lineIndex] === undefined ? undefined : wordSegments(removedLines[lineIndex], text, "added"),
        });
      });
      if (next?.added) index++;
      continue;
    }

    for (const text of splitLines(change.value)) {
      if (change.added) rows.push({ kind: "added", text, newNumber: newNumber++ });
      else rows.push({ kind: "context", text, oldNumber: oldNumber++, newNumber: newNumber++ });
    }
  }

  return rows;
}

function DiffLine({ row }: { row: DiffRow }) {
  const isRemoved = row.kind === "removed";
  const isAdded = row.kind === "added";
  const sign = isRemoved ? "-" : isAdded ? "+" : " ";

  return (
    <tr
      className={cn(
        "border-b border-border/25 last:border-b-0",
        isRemoved && "bg-red-50/90 dark:bg-red-500/10",
        isAdded && "bg-emerald-50/90 dark:bg-emerald-500/10"
      )}
      aria-label={(isRemoved ? "Removed" : isAdded ? "Added" : "Unchanged") + " line " + (row.oldNumber ?? row.newNumber)}
    >
      <td className={cn("w-10 min-w-10 border-r border-border/40 px-2 text-right text-[11px] text-muted-foreground select-none", isRemoved && "bg-red-100/70 dark:bg-red-500/10")}>{row.oldNumber ?? ""}</td>
      <td className={cn("w-10 min-w-10 border-r border-border/40 px-2 text-right text-[11px] text-muted-foreground select-none", isAdded && "bg-emerald-100/70 dark:bg-emerald-500/10")}>{row.newNumber ?? ""}</td>
      <td className={cn("w-7 min-w-7 py-1 pl-3 text-center font-semibold select-none", isRemoved && "text-red-700 dark:text-red-300", isAdded && "text-emerald-700 dark:text-emerald-300", row.kind === "context" && "text-muted-foreground")} aria-hidden="true">{sign}</td>
      <td className="py-1 pr-5 pl-1 text-foreground/90">
        <span className="whitespace-pre">
          {row.segments?.length
            ? row.segments.map((part, index) => (
                <span
                  key={index}
                  className={cn(
                    part.highlighted && isRemoved && "rounded-[2px] bg-red-200/90 text-red-950 dark:bg-red-500/30 dark:text-red-100",
                    part.highlighted && isAdded && "rounded-[2px] bg-emerald-200/90 text-emerald-950 dark:bg-emerald-500/30 dark:text-emerald-100"
                  )}
                >
                  {part.value}
                </span>
              ))
            : row.text || "\u00a0"}
        </span>
      </td>
    </tr>
  );
}

export function DiffBlock({ title, language = "text", before = "", after = "" }: DiffBlockProps) {
  const rows = buildRows(before, after);
  const removed = rows.filter((row) => row.kind === "removed").length;
  const added = rows.filter((row) => row.kind === "added").length;

  return (
    <LearnPanelShell eyebrow="Diff" title={title}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5 sm:px-5">
        <span className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs text-foreground/80">{language}</span>
        <span className="flex items-center gap-3 font-mono text-xs" aria-label={added + " added lines, " + removed + " removed lines"}>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">+{added}</span>
          <span className="font-semibold text-red-700 dark:text-red-300">-{removed}</span>
        </span>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto bg-card font-mono text-[12px] leading-6 sm:text-[13px]">
          <table className="w-full min-w-max border-collapse" aria-label={title ? title + " diff" : "Code diff"}>
            <tbody>{rows.map((row, index) => <DiffLine key={index} row={row} />)}</tbody>
          </table>
        </div>
      ) : (
        <p className="px-5 py-6 text-sm text-muted-foreground">No changes to display.</p>
      )}
    </LearnPanelShell>
  );
}
