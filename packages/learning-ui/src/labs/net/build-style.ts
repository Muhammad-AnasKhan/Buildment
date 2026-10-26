// Colours for build mode's devices, as theme-aware classes shared by the
// palette and the canvas so a placed device looks like the button it came from.

import type { NetDeviceKind } from "./model";

export const BUILD_TONE: Record<NetDeviceKind, { box: string; tag: string; dot: string }> = {
  host: { box: "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/60", tag: "text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  router: { box: "border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-950/50", tag: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  switch: { box: "border-slate-400 bg-slate-100 dark:border-slate-500 dark:bg-slate-800/70", tag: "text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
};
