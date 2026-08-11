import { Children, isValidElement, type ReactNode } from "react";
import { File, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { LearnPanelShell } from "./learn-panel-shell";

export type FileTreeItemProps = {
  path: string;
  highlight?: boolean;
  new?: boolean;
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
    if (type?.displayName === "FileTreeItem" || type?.name === "FileTreeItem") {
      items.push(child.props as FileTreeItemProps);
    }
  });
  return items;
}

function depthOf(path: string) {
  const trimmed = path.replace(/\/$/, "");
  const segments = trimmed.split("/").filter(Boolean);
  return Math.max(segments.length - 1, 0);
}

function isFolder(path: string) {
  return path.endsWith("/");
}

type FileTreeProps = {
  title?: string;
  root?: string;
  children?: ReactNode;
};

export function FileTree({ title, root, children }: FileTreeProps) {
  const items = collectItems(children);

  return (
    <LearnPanelShell eyebrow="Repo" title={title}>
      {root ? (
        <div className="border-b border-neutral-100 bg-neutral-50/80 px-4 py-2.5 sm:px-5">
          <code className="font-mono text-xs text-neutral-600">{root}</code>
        </div>
      ) : null}
      <ul className="divide-y divide-neutral-100">
        {items.map((item) => {
          const folder = isFolder(item.path);
          const Icon = folder ? Folder : File;
          const depth = depthOf(item.path);
          const name = item.path.replace(/\/$/, "").split("/").pop() ?? item.path;

          return (
            <li
              key={item.path}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 sm:px-5",
                item.highlight && "bg-indigo-50/80"
              )}
              style={{ paddingLeft: `${16 + depth * 16}px` }}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  folder ? "text-amber-600" : "text-neutral-400"
                )}
                aria-hidden
              />
              <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-neutral-800">
                {name}
                {folder ? "/" : ""}
              </code>
              {item.new ? (
                <span className="shrink-0 rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                  new
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </LearnPanelShell>
  );
}
