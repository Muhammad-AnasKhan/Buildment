import { Children, isValidElement, type ReactNode } from "react";
import { File, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { LearnPanelShell } from "./learn-panel-shell";

export type FileTreeItemProps = {
  path: string;
  highlight?: boolean;
  new?: boolean;
  /** Optional shell command shown under the tree when set on any item */
  command?: string;
};

export function FileTreeItem(_props: FileTreeItemProps) {
  return null;
}

FileTreeItem.displayName = "FileTreeItem";

function collectItems(children: ReactNode): FileTreeItemProps[] {
  const items: FileTreeItemProps[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const type = child.type as { displayName?: string; name?: string };
    const props = child.props as Record<string, unknown>;
    if (
      type?.displayName === "FileTreeItem" ||
      type?.name === "FileTreeItem" ||
      child.type === FileTreeItem ||
      Boolean(props?.path)
    ) {
      items.push(props as FileTreeItemProps);
    }
  });
  return items;
}

function isFolder(path: string) {
  return path.endsWith("/");
}

type TreeRow = FileTreeItemProps & {
  depth: number;
  folder: boolean;
  name: string;
};

/** Authors can list a deep path without spelling out every parent folder. */
function buildRows(items: FileTreeItemProps[]): TreeRow[] {
  const rows = new Map<string, TreeRow>();

  for (const item of items) {
    const segments = item.path.split("/").filter(Boolean);
    segments.forEach((name, depth) => {
      const last = depth === segments.length - 1;
      const folder = !last || isFolder(item.path);
      const path = `${segments.slice(0, depth + 1).join("/")}${folder ? "/" : ""}`;
      const previous = rows.get(path);

      if (!previous) {
        rows.set(path, {
          path,
          name,
          depth,
          folder,
          ...(last ? { highlight: item.highlight, new: item.new, command: item.command } : {}),
        });
      } else if (last) {
        rows.set(path, { ...previous, highlight: item.highlight, new: item.new, command: item.command });
      }
    });
  }

  return [...rows.values()];
}

type FileTreeProps = {
  title?: string;
  root?: string;
  children?: ReactNode;
};

export function FileTree({ title, root, children }: FileTreeProps) {
  const items = collectItems(children);
  const rows = buildRows(items);

  return (
    <LearnPanelShell eyebrow="Repo" title={title}>
      {root ? (
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5 sm:px-5">
          <Folder className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
          <span className="font-mono text-xs font-semibold text-foreground">{root}</span>
        </div>
      ) : null}
      <ul className="py-1.5" aria-label={title ? `${title} files` : "Project files"}>
        {rows.map((item) => {
          const Icon = item.folder ? Folder : File;
          return (
            <li
              key={item.path}
              title={item.path}
              className={cn(
                "flex min-h-8 items-center gap-2 py-1 pr-4 text-sm sm:pr-5",
                item.highlight ? "bg-muted/70" : "hover:bg-muted/35"
              )}
              style={{ paddingLeft: `${(root ? 36 : 16) + item.depth * 20}px` }}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  item.folder ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                )}
                aria-hidden
              />
              <span className={cn("min-w-0 truncate font-mono text-[13px] text-foreground", item.folder && "font-medium")}>
                {item.name}{item.folder ? "/" : ""}
              </span>
              {item.new ? (
                <span className="ml-auto shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  new
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      {items.some((i) => i.command) ? (
        <div className="space-y-2 border-t border-border bg-neutral-950 px-4 py-3 sm:px-5">
          {items
            .filter((i) => i.command)
            .map((item) => (
              <div key={`cmd-${item.path}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                  {item.path.replace(/\/$/, "")}
                </p>
                <span className="mt-1 block font-mono text-xs text-emerald-400">{item.command}</span>
              </div>
            ))}
        </div>
      ) : null}
    </LearnPanelShell>
  );
}
