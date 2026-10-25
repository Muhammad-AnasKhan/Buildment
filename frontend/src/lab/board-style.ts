// Colors, icons and small helpers shared by the lab board, its palette, the
// settings drawer and the results panel.

import type { ComponentKind, Role } from "./catalog";
import { roleOf } from "./catalog";

// One color and icon per role. A component's chip, top bar and dots use its
// role's color, and so does every link that leaves it, so a violet line always
// means "from a load balancer", whichever course it is from. Red is kept for
// trouble: down, unreachable or overloaded.
export const ROLE_ICON: Record<Role, string> = {
  client: "○", dns: "◈", cdn: "☁", firewall: "⛨", limiter: "⧗", balancer: "⇉",
  gateway: "‖", compute: "▣", function: "λ", worker: "⚙", cache: "⚡", database: "▽",
  nosql: "◇", search: "⌕", queue: "☰", stream: "≋", storage: "▦",
};
export const ROLE_COLOR: Record<Role, string> = {
  client: "#64748b", dns: "#78716c", cdn: "#0ea5e9", firewall: "#e11d48", limiter: "#ea580c", balancer: "#8b5cf6",
  gateway: "#c026d3", compute: "#3b82f6", function: "#0891b2", worker: "#6366f1", cache: "#f59e0b", database: "#10b981",
  nosql: "#059669", search: "#a16207", queue: "#14b8a6", stream: "#0d9488", storage: "#84cc16",
};
export const ROLE_LABEL: Record<Role, string> = {
  client: "Client", dns: "DNS", cdn: "CDN", firewall: "Firewall", limiter: "Rate limit", balancer: "Load balancing",
  gateway: "Gateway", compute: "Compute", function: "Functions", worker: "Workers", cache: "Cache", database: "Database",
  nosql: "NoSQL", search: "Search", queue: "Queue", stream: "Stream", storage: "Storage",
};
export const iconOf = (kind: ComponentKind) => ROLE_ICON[roleOf(kind)];
export const colorOf = (kind: ComponentKind) => ROLE_COLOR[roleOf(kind)];
export const chipStyle = (kind: ComponentKind) => ({ backgroundColor: `${colorOf(kind)}22`, color: colorOf(kind) });

export const ROLE_GROUPS: { group: string; roles: Role[] }[] = [
  { group: "Traffic", roles: ["client", "dns", "cdn", "firewall", "limiter", "balancer", "gateway"] },
  { group: "Compute", roles: ["compute", "function", "worker"] },
  { group: "Data", roles: ["cache", "database", "nosql", "search", "storage"] },
  { group: "Messaging", roles: ["queue", "stream"] },
];
export function paletteFor(kinds: ComponentKind[]) {
  return ROLE_GROUPS.map((g) => ({ group: g.group, kinds: kinds.filter((k) => g.roles.includes(roleOf(k))) })).filter((g) => g.kinds.length > 0);
}

export const RED = "#ef4444";

export const utilBar = (u: number) => (u < 0.7 ? "bg-emerald-500" : u < 0.9 ? "bg-amber-500" : "bg-red-500");
export const utilText = (u: number) =>
  u < 0.7 ? "text-emerald-600 dark:text-emerald-400" : u < 0.9 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
export const okText = (ok: boolean) => (ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400");
