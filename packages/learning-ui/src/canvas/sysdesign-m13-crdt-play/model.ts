import type { Tone } from "../primitives/tones";

// 13.7 beat 5: three replicas A, B and C hold {milk, rice}. A removes milk and
// rice, B adds rice again, C adds eggs. Three set types, state-based: a merge
// sends the whole state of one replica into another and the target keeps the
// union of both. The people meant: eggs and rice. Pure, no React.

export type SetType = "plain" | "byName" | "orset";
export const SET_TYPES: readonly { id: SetType; label: string }[] = [
  { id: "plain", label: "Plain set" },
  { id: "byName", label: "By name" },
  { id: "orset", label: "OR-Set" },
];

export const REPLICAS = ["A", "B", "C"] as const;
export type Replica = (typeof REPLICAS)[number];

export const INTENDED: readonly string[] = ["eggs", "rice"];
const ORDER = ["eggs", "milk", "rice"];

/**
 * What a replica holds. Plain set: adds are names, removed is always empty
 * (a remove deletes the name locally). By name: adds are names, removed are
 * names. OR-Set: adds and removed are "name tag" keys, for example "rice B:1".
 */
export type State = { adds: string[]; removed: string[] };
export type Replicas = Record<Replica, State>;

const nameOf = (key: string): string => key.split(" ")[0];
const sortKey = (key: string): string => `${ORDER.indexOf(nameOf(key))}${key}`;
const canon = (xs: Iterable<string>): string[] => [...new Set(xs)].sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0));
const state = (adds: string[], removed: string[] = []): State => ({ adds: canon(adds), removed: canon(removed) });

export function initialReplicas(type: SetType): Replicas {
  switch (type) {
    case "plain":
      return { A: state([]), B: state(["milk", "rice"]), C: state(["milk", "rice", "eggs"]) };
    case "byName":
      return { A: state(["milk", "rice"], ["milk", "rice"]), B: state(["milk", "rice"]), C: state(["milk", "rice", "eggs"]) };
    case "orset":
      return {
        A: state(["milk s:1", "rice s:2"], ["milk s:1", "rice s:2"]),
        B: state(["milk s:1", "rice s:2", "rice B:1"]),
        C: state(["milk s:1", "rice s:2", "eggs C:1"]),
      };
  }
}

/** The target keeps the union of both states. Commutative, associative and idempotent. */
export function mergeStates(source: State, target: State): State {
  return state([...source.adds, ...target.adds], [...source.removed, ...target.removed]);
}

/** Merge one replica into another. */
export function mergeInto(r: Replicas, from: Replica, to: Replica): Replicas {
  return from === to ? r : { ...r, [to]: mergeStates(r[from], r[to]) };
}

/** The cart a replica shows: the items that count as present. */
export function visible(type: SetType, s: State): string[] {
  const gone = new Set(s.removed);
  switch (type) {
    case "plain":
      return canon(s.adds);
    case "byName":
      return canon(s.adds.filter((n) => !gone.has(n)));
    case "orset":
      return canon(s.adds.filter((k) => !gone.has(k)).map(nameOf));
  }
}

export type Row = { text: string; removed: boolean };

/** What a replica's card lists: names (plain), names with removed ones marked (by name), or tags (OR-Set). */
export function rows(type: SetType, s: State): Row[] {
  if (type === "plain") return s.adds.map((text) => ({ text, removed: false }));
  const gone = new Set(s.removed);
  if (type === "byName") return canon([...s.adds, ...s.removed]).map((text) => ({ text, removed: gone.has(text) }));
  return s.adds.map((text) => ({ text, removed: gone.has(text) }));
}

const same = (a: State, b: State): boolean => a.adds.join("|") === b.adds.join("|") && a.removed.join("|") === b.removed.join("|");
export const allEqual = (r: Replicas): boolean => same(r.A, r.B) && same(r.B, r.C);

export function verdict(type: SetType, r: Replicas): { text: string; tone: Tone } {
  if (!allEqual(r)) return { text: "Replicas still differ: keep merging", tone: "accent" };
  const cart = visible(type, r.A);
  if (cart.join() === INTENDED.join()) return { text: "All agree: eggs and rice. Correct.", tone: "good" };
  if (cart.includes("milk")) return { text: "All agree, but milk came back", tone: "bad" };
  if (!cart.includes("rice")) return { text: "All agree, but rice was lost", tone: "bad" };
  return { text: "All agree, but not the right cart", tone: "bad" };
}

export function cartText(items: readonly string[]): string {
  return items.length === 0 ? "empty" : items.join(", ");
}

export function listItems(items: readonly string[]): string {
  if (items.length === 0) return "nothing";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Merge every replica into every other along the order's path, then back: every replica ends with everything. */
export function mergeAllVia(r: Replicas, order: readonly [Replica, Replica, Replica]): Replicas {
  const [x, y, z] = order;
  return mergeInto(mergeInto(mergeInto(mergeInto(r, x, y), y, z), z, y), z, x);
}

export const ORDERS: readonly (readonly [Replica, Replica, Replica])[] = [
  ["A", "B", "C"],
  ["A", "C", "B"],
  ["B", "A", "C"],
  ["B", "C", "A"],
  ["C", "A", "B"],
  ["C", "B", "A"],
];
