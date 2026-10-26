// Tokens and small helpers shared by the lab board, its palette, the settings
// cassette and the run panel.
//
// The look is a drafted bench: vellum in the light theme, anodised slate in the
// dark one. The tokens live on `.lab-board` (see BOARD_CSS) and re-map the app's
// own surface variables inside the board, so every utility class in the lab picks
// up the bench surfaces without a second set of classes.

import type { ComponentKind, Role } from "./catalog";
import { roleOf } from "./catalog";

import { DOWN_COLOR, FAMILY_LABEL, LAB_FAMILIES, ROLE_FAMILY, BOARD_CSS, familyColor, loadState, okText, tint, type LabFamily, type LoadState } from "../lab-ui";

export { BOARD_CSS, FAMILY_LABEL, LAB_FAMILIES, familyColor, loadState, okText, tint };
export type { LabFamily, LoadState };
export const FAMILIES = LAB_FAMILIES;
export const familyOf = (kind: ComponentKind): LabFamily => ROLE_FAMILY[roleOf(kind)];
export const colorOf = (kind: ComponentKind) => familyColor(familyOf(kind));
export const chipStyle = (kind: ComponentKind) => ({ backgroundColor: tint(colorOf(kind), 14), color: colorOf(kind) });

export const ROLE_LABEL: Record<Role, string> = {
  client: "Client", dns: "DNS", cdn: "CDN", firewall: "Firewall", limiter: "Rate limit", balancer: "Load balancing",
  gateway: "Gateway", compute: "Compute", function: "Functions", worker: "Workers", cache: "Cache", database: "Database",
  nosql: "NoSQL", search: "Search", queue: "Queue", stream: "Stream", storage: "Storage",
};

export const ROLE_GROUPS: { group: string; roles: Role[] }[] = [
  { group: "Traffic", roles: ["client", "dns", "cdn", "firewall", "limiter", "balancer", "gateway"] },
  { group: "Compute", roles: ["compute", "function", "worker"] },
  { group: "Data", roles: ["cache", "database", "nosql", "search", "storage"] },
  { group: "Messaging", roles: ["queue", "stream"] },
];
export function paletteFor(kinds: ComponentKind[]) {
  return ROLE_GROUPS.map((g) => ({ group: g.group, kinds: kinds.filter((k) => g.roles.includes(roleOf(k))) })).filter((g) => g.kinds.length > 0);
}

export const RED = DOWN_COLOR;
