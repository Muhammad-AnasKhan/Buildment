// Tokens for the lab "bench" look, shared by every surface that draws a lab part
// (the web reader, the desktop reader, the component gallery). Presentational only:
// no data fetching, no app state. The tokens are CSS variables on `.lab-board`, so
// light and dark both work and follow the site's theme switch with no reload.

/** The part roles the glyphs and colours know. Mirrors the lab catalog's roles. */
export type LabRole =
  | "client" | "dns" | "cdn" | "firewall" | "limiter" | "balancer" | "gateway" | "compute" | "function"
  | "worker" | "cache" | "database" | "nosql" | "search" | "queue" | "stream" | "storage";

/** Six colour families instead of seventeen colours: a link's colour says which kind of part it leaves. */
export type LabFamily = "ingress" | "routing" | "compute" | "cache" | "data" | "bus";

export const ROLE_FAMILY: Record<LabRole, LabFamily> = {
  client: "ingress", dns: "ingress", cdn: "ingress", firewall: "ingress",
  limiter: "routing", balancer: "routing", gateway: "routing",
  compute: "compute", function: "compute", worker: "compute",
  cache: "cache",
  database: "data", nosql: "data", search: "data", storage: "data",
  queue: "bus", stream: "bus",
};

export const FAMILY_LABEL: Record<LabFamily, string> = {
  ingress: "Entry points", routing: "Traffic routing", compute: "Servers", cache: "Cache", data: "Storage", bus: "Queues",
};
export const LAB_FAMILIES: LabFamily[] = ["ingress", "routing", "compute", "cache", "data", "bus"];

export const familyColor = (f: LabFamily) => `var(--lab-${f})`;
export const roleColor = (role: LabRole) => familyColor(ROLE_FAMILY[role]);
/** A tint of a colour (for chips and borders) that works with CSS variables. */
export const tint = (color: string, percent: number) => `color-mix(in srgb, ${color} ${percent}%, transparent)`;

export const DOWN_COLOR = "var(--lab-down)";

/** How busy a part is, in words as well as colour, so colour is never the only signal. */
export interface LoadState {
  key: "ok" | "warm" | "hot";
  tag: string;
  hint: string;
  fill: string;
  ink: string;
}
export function loadState(u: number): LoadState {
  if (u < 0.7) return { key: "ok", tag: "", hint: "", fill: "var(--lab-ok)", ink: "var(--lab-ok-ink)" };
  if (u < 0.9) {
    return { key: "warm", tag: "GETTING BUSY", hint: "Getting busy: waiting time is starting to climb (past the utilisation knee, about 70%).", fill: "var(--lab-warm)", ink: "var(--lab-warm-ink)" };
  }
  return { key: "hot", tag: "NEARLY FULL", hint: "Nearly full (saturated): requests are queueing up and waiting.", fill: "var(--lab-hot)", ink: "var(--lab-hot-ink)" };
}
export const okText = (ok: boolean) => (ok ? "text-[color:var(--lab-ok-ink)]" : "text-[color:var(--lab-down-ink)]");

/** Design tokens for `.lab-board`: light is drafting vellum, dark is anodised slate. */
export const BOARD_CSS = `
.lab-board {
  --lab-canvas: #F4F1EA; --lab-module: #FCFBF8; --lab-recessed: #EAE5D9; --lab-inspector: #181F2C; --lab-inspector-2: #232C3D;
  --lab-ink: #14181F; --lab-ink2: #4B5563; --lab-grid: #C8C1B2; --lab-accent: #2563EB; --lab-on-accent: #FFFFFF; --lab-edge-shadow: rgba(20,24,31,0.12);
  --lab-ingress: #4F46E5; --lab-routing: #7C3AED; --lab-compute: #0284C7; --lab-cache: #D97706; --lab-data: #059669; --lab-bus: #0D9488;
  --lab-ok: #10B981; --lab-ok-ink: #047857; --lab-warm: #F59E0B; --lab-warm-ink: #B45309; --lab-hot: #F97316; --lab-hot-ink: #C2410C;
  --lab-down: #DC2626; --lab-down-ink: #B91C1C; --lab-down-fill: #FEE2E2;
  --background: var(--lab-module); --foreground: var(--lab-ink); --card: var(--lab-module); --card-foreground: var(--lab-ink);
  --muted: var(--lab-recessed); --muted-foreground: var(--lab-ink2); --border: var(--lab-grid);
  font-family: var(--font-plex), var(--font-sans), system-ui, sans-serif;
  color: var(--lab-ink);
}
.dark .lab-board {
  --lab-canvas: #0C1017; --lab-module: #151C28; --lab-recessed: #090C10; --lab-inspector: #1E2738; --lab-inspector-2: #2A3550;
  --lab-ink: #F1F5F9; --lab-ink2: #94A3B8; --lab-grid: #263042; --lab-accent: #38BDF8; --lab-on-accent: #0C1017; --lab-edge-shadow: rgba(0,0,0,0.6);
  --lab-ingress: #818CF8; --lab-routing: #A78BFA; --lab-compute: #38BDF8; --lab-cache: #FBBF24; --lab-data: #34D399; --lab-bus: #2DD4BF;
  --lab-ok: #10B981; --lab-ok-ink: #34D399; --lab-warm: #F59E0B; --lab-warm-ink: #FBBF24; --lab-hot: #F97316; --lab-hot-ink: #FB923C;
  --lab-down: #DC2626; --lab-down-ink: #F87171; --lab-down-fill: #450A0A;
}
.lab-display { font-family: var(--font-grotesk), var(--font-plex), system-ui, sans-serif; }
.lab-mono { font-family: var(--font-jetbrains-mono), ui-monospace, monospace; font-variant-numeric: tabular-nums; }
.lab-hatch { background-image: repeating-linear-gradient(45deg, var(--lab-down) 0 4px, transparent 4px 9px); }
@keyframes lab-edge-flow { from { stroke-dashoffset: 26; } to { stroke-dashoffset: 0; } }
@keyframes lab-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
@keyframes lab-stamp { from { transform: scale(1.18); opacity: 0.4; } to { transform: scale(1); opacity: 1; } }
@keyframes lab-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes lab-scan { 0% { background-position: 0 -180px; opacity: 0.18; } 50% { opacity: 0.42; } 100% { background-position: 0 calc(100% + 180px); opacity: 0.18; } }
@keyframes lab-orbit { to { transform: rotate(360deg); } }
@keyframes lab-results-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes lab-dialog-in { from { opacity: 0; transform: translateY(18px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes lab-result-ring { 0% { transform: scale(0.8) rotate(-18deg); opacity: 0; } 70% { transform: scale(1.06) rotate(2deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
.lab-edge-live { animation: lab-edge-flow 0.9s linear infinite; }
.lab-shake { animation: lab-shake 0.18s ease-in-out 2; }
.lab-stamp { animation: lab-stamp 0.14s ease-out; }
.lab-fill { transform-origin: left; animation: lab-fill var(--lab-phase-ms, 2600ms) linear forwards; }
.lab-scan { background-image: linear-gradient(180deg, transparent 0, transparent 42%, color-mix(in srgb, var(--lab-accent) 14%, transparent) 49%, color-mix(in srgb, var(--lab-accent) 34%, transparent) 50%, color-mix(in srgb, var(--lab-accent) 14%, transparent) 51%, transparent 58%, transparent 100%); background-size: 100% 180px; background-repeat: no-repeat; animation: lab-scan 1.7s linear infinite; }
.lab-run-orbit::before { content: ""; position: absolute; inset: 3px; border-radius: 999px; border-top: 2px solid #7dd3fc; border-right: 2px solid transparent; animation: lab-orbit 0.9s linear infinite; }
.lab-results-backdrop { animation: lab-results-in 0.2s ease-out both; }
.lab-results-dialog { animation: lab-dialog-in 0.32s cubic-bezier(.2,.85,.25,1) both; }
.lab-result-ring { animation: lab-result-ring 0.5s cubic-bezier(.2,.85,.25,1) 0.08s both; }
.lab-result-grid { background-image: linear-gradient(var(--lab-grid) 1px, transparent 1px), linear-gradient(90deg, var(--lab-grid) 1px, transparent 1px); background-size: 24px 24px; mask-image: linear-gradient(to right, black, transparent 85%); }
@media (prefers-reduced-motion: reduce) {
  .lab-edge-live, .lab-shake, .lab-stamp, .lab-fill, .lab-scan, .lab-run-orbit::before, .lab-results-backdrop, .lab-results-dialog, .lab-result-ring { animation: none; }
  .lab-fill { transform: scaleX(1); }
  .lab-packet { display: none; }
}
.dark .lab-board .react-flow__controls { box-shadow: none; }
.lab-board .react-flow__controls-button { background: var(--lab-module); color: var(--lab-ink); border-bottom-color: var(--lab-grid); }
.lab-board .react-flow__controls-button:hover { background: var(--lab-recessed); }
.lab-board .react-flow__controls-button svg { fill: currentColor; }
`;
