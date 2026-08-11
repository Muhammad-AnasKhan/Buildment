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
  Client: { badge: "bg-blue-50 text-blue-800 ring-blue-200/80", dot: "bg-blue-500" },
  React: { badge: "bg-blue-50 text-blue-800 ring-blue-200/80", dot: "bg-blue-500" },
  API: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-200/80", dot: "bg-emerald-500" },
  Server: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-200/80", dot: "bg-emerald-500" },
  DB: { badge: "bg-amber-50 text-amber-900 ring-amber-200/80", dot: "bg-amber-500" },
  Worker: { badge: "bg-violet-50 text-violet-800 ring-violet-200/80", dot: "bg-violet-500" },
};

export type ArchLayer = "Client" | "API" | "Data" | "Worker" | "External";

export const ARCH_LAYER_STYLES: Record<ArchLayer, string> = {
  Client: "border-blue-200/80 bg-blue-50/40",
  API: "border-emerald-200/80 bg-emerald-50/40",
  Data: "border-amber-200/80 bg-amber-50/40",
  Worker: "border-violet-200/80 bg-violet-50/40",
  External: "border-neutral-200 bg-neutral-50/60",
};
