import type { LucideIcon } from "lucide-react";
import {
  Columns2,
  Database,
  FileDiff,
  FolderTree,
  GitBranch,
  Layers,
  Route,
  Terminal,
} from "lucide-react";

export type ContentBlockEyebrow =
  | "Repo"
  | "Terminal"
  | "Compare"
  | "Architecture"
  | "State flow"
  | "Data model"
  | "Diff"
  | "Trace"
  | "Predict";

export const EYEBROW_ICONS: Record<ContentBlockEyebrow, LucideIcon> = {
  Repo: FolderTree,
  Terminal: Terminal,
  Compare: Columns2,
  Architecture: Layers,
  "State flow": GitBranch,
  "Data model": Database,
  Diff: FileDiff,
  Trace: Route,
  Predict: Route,
};

export type TraceActor = "Client" | "React" | "API" | "Server" | "DB" | "Worker";

export const TRACE_ACTOR_STYLES: Record<
  TraceActor,
  { badge: string; dot: string }
> = {
  Client: { badge: "bg-blue-50 text-blue-800 ring-blue-200/80 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-400/25", dot: "bg-blue-500" },
  React: { badge: "bg-blue-50 text-blue-800 ring-blue-200/80 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-400/25", dot: "bg-blue-500" },
  API: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/25", dot: "bg-emerald-500" },
  Server: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/25", dot: "bg-emerald-500" },
  DB: { badge: "bg-amber-50 text-amber-900 ring-amber-200/80 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-400/25", dot: "bg-amber-500" },
  Worker: { badge: "bg-muted text-foreground ring-border", dot: "bg-muted-foreground" },
};

export type ArchLayer = "Client" | "API" | "Data" | "Worker" | "External";

export const ARCH_LAYER_STYLES: Record<ArchLayer, string> = {
  Client: "border-blue-200/80 bg-blue-50/40 dark:border-blue-400/25 dark:bg-blue-500/10",
  API: "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-400/25 dark:bg-emerald-500/10",
  Data: "border-amber-200/80 bg-amber-50/40 dark:border-amber-400/25 dark:bg-amber-500/10",
  Worker: "border-border bg-muted/40",
  External: "border-border bg-muted/40",
};
