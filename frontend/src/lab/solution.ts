// Comparing a learner's design with a lab's reference solution, in plain words.
// Pure and server-importable. It says what differs (a missing part, a setting that
// is lower or higher, a missing link) and which of the learner's failing checks that
// explains. It never prints the reference's numbers: a learner who asks "what
// differs" gets directions ("lower", "smaller"), not the answer.

import type { ComponentKind } from "./catalog";
import { COMPONENT_CATALOG, SIZE_CATALOG } from "./catalog";
import type { Board, BoardNode, HldLabSpec } from "./types";
import type { ChallengeReport } from "./challenge";

export interface CompareLine {
  text: string;
  /** Labels of the learner's failing checks this difference helps explain. */
  explains: string[];
}

export interface CompareResult {
  lines: CompareLine[];
  failing: number;
  /** How many of the failing checks at least one difference explains. */
  explained: number;
  headline: string;
}

const label = (kind: ComponentKind) => COMPONENT_CATALOG[kind].label;
const price = (id: unknown) => SIZE_CATALOG.find((s) => s.id === id)?.pricePerHour ?? 0;

function propValue(node: BoardNode, key: string): number | string | undefined {
  return node.props?.[key] ?? COMPONENT_CATALOG[node.kind].properties.find((p) => p.id === key)?.default;
}

/** The learner's nodes of each kind, in board order. */
function byKind(board: Board): Map<ComponentKind, BoardNode[]> {
  const map = new Map<ComponentKind, BoardNode[]>();
  for (const n of board.nodes) map.set(n.kind, [...(map.get(n.kind) ?? []), n]);
  return map;
}

export function compareDesigns(spec: HldLabSpec, mine: Board, report: ChallengeReport): CompareResult {
  const solution = spec.solution;
  if (!solution) return { lines: [], failing: 0, explained: 0, headline: "This lab has no reference solution." };
  const failing = report.checks.filter((c) => !c.pass);
  const failingById = new Map(failing.map((c) => [c.id, c.label]));
  const explainsOf = (ids: string[]) => [...new Set(ids.filter((id) => failingById.has(id)).map((id) => failingById.get(id)!))];

  const ref = byKind(solution.board);
  const own = byKind(mine);
  const partChecks = (kind: ComponentKind) => {
    const node = ref.get(kind)?.[0];
    return node ? solution.parts[node.id]?.checks ?? [] : [];
  };
  const lines: CompareLine[] = [];

  for (const [kind, refNodes] of ref) {
    if (kind === "client") continue;
    const mineNodes = own.get(kind) ?? [];
    const checks = partChecks(kind);
    if (mineNodes.length === 0) {
      lines.push({ text: `The reference has a ${label(kind).toLowerCase()}. Your design has none.`, explains: explainsOf(checks) });
      continue;
    }
    if (mineNodes.length < refNodes.length) {
      lines.push({ text: `The reference has ${refNodes.length} of these: ${label(kind).toLowerCase()}. You have ${mineNodes.length}.`, explains: explainsOf(checks) });
    }
    const refNode = refNodes[0]!;
    const mineNode = mineNodes[0]!;
    for (const prop of COMPONENT_CATALOG[kind].properties) {
      if (prop.id === "down") continue;
      const a = propValue(mineNode, prop.id);
      const b = propValue(refNode, prop.id);
      if (a === b || a === undefined || b === undefined) continue;
      let text: string;
      if (prop.type === "toggle") {
        text = `${label(kind)}: "${prop.label}" is ${Number(a) > 0 ? "on in your design and off" : "off in your design and on"} in the reference.`;
      } else {
        const how = prop.type === "size" ? (price(a) < price(b) ? "smaller" : "larger") : typeof a === "number" && typeof b === "number" ? (a < b ? "lower" : "higher") : "different";
        text = `${label(kind)}: "${prop.label}" is ${how} than in the reference.`;
      }
      lines.push({ text, explains: explainsOf(checks) });
    }
  }

  // Links, by the kinds they join, so renamed or repeated parts do not confuse the comparison.
  const kindOf = (board: Board, id: string) => board.nodes.find((n) => n.id === id)?.kind;
  const mineLinks = new Set(mine.edges.map((e) => `${kindOf(mine, e.from)}>${kindOf(mine, e.to)}`));
  const seen = new Set<string>();
  for (const e of solution.board.edges) {
    const from = kindOf(solution.board, e.from);
    const to = kindOf(solution.board, e.to);
    if (!from || !to) continue;
    const key = `${from}>${to}`;
    if (seen.has(key) || mineLinks.has(key)) continue;
    seen.add(key);
    // A link is only missing if the learner has both ends; a missing part is reported above.
    if (!own.has(from) || !own.has(to)) continue;
    lines.push({
      text: `The reference links ${label(from).toLowerCase()} to ${label(to).toLowerCase()}. Yours does not.`,
      explains: explainsOf([...partChecks(from), ...partChecks(to)]),
    });
  }

  for (const [kind] of own) {
    if (!ref.has(kind)) {
      lines.push({ text: `You added a ${label(kind).toLowerCase()} that the reference does not use.`, explains: explainsOf(["cost"]) });
    }
  }

  const explainedLabels = new Set(lines.flatMap((l) => l.explains));
  const explained = failing.filter((c) => explainedLabels.has(c.label)).length;
  const headline =
    failing.length === 0
      ? lines.length === 0
        ? "Your design matches the reference, and passes every check."
        : "Your design passes every check. These are the differences from the reference."
      : lines.length === 0
        ? `Your design fails ${failing.length} check${failing.length === 1 ? "" : "s"}, but nothing differs in parts, settings or links. Read each failure's reason.`
        : `Your design fails ${failing.length} check${failing.length === 1 ? "" : "s"}. These differences explain ${explained} of them.`;
  return { lines, failing: failing.length, explained, headline };
}
