import type { Tone } from "../primitives/tones";

// 13.6 beat 3: the cart starts as {eggs, milk}. Two edits happen at once.
// Case 1: Hana removes milk, Dina adds tea (they mean eggs and tea).
// Case 2: Hana removes milk, Dina adds milk again without seeing the removal
// (they mean eggs and milk). Four merge rules turn the two carts into one.
// The stamps 10 and 12 are made up. Pure, no React.

export const ITEMS = ["eggs", "milk", "tea"] as const;
export type Item = (typeof ITEMS)[number];
export const START: readonly Item[] = ["eggs", "milk"];

export type Rule = "lww" | "union" | "byName" | "tagged";
export const RULES: readonly { id: Rule; label: string; short: string; why: string }[] = [
  { id: "lww", label: "Last write wins", short: "last write wins", why: "The whole cart with the later stamp wins." },
  { id: "union", label: "Union", short: "union", why: "A union only adds, so it cannot remove." },
  { id: "byName", label: "Remove by name", short: "remove by name", why: "A removed name stays removed, even if added again." },
  { id: "tagged", label: "Tagged adds", short: "tagged adds", why: "A remove cancels only the adds it saw." },
];

export type CaseId = 1 | 2;

export const HANA_STAMP = 10;
export const DINA_STAMP = 12;

/** Each person's cart after their own edit. */
export function cartsFor(c: CaseId): { hana: Item[]; dina: Item[] } {
  return { hana: ["eggs"], dina: c === 1 ? ["eggs", "milk", "tea"] : ["eggs", "milk"] };
}

export const editText = (who: "hana" | "dina", c: CaseId): string => (who === "hana" ? "removes milk" : c === 1 ? "adds tea" : "adds milk");

export const intendedFor = (c: CaseId): Item[] => (c === 1 ? ["eggs", "tea"] : ["eggs", "milk"]);

/** The stamps shown on Hana's and Dina's saves. Flipped, Hana's save is the later one. */
export const stampsFor = (flipped: boolean): { hana: number; dina: number } => (flipped ? { hana: DINA_STAMP, dina: HANA_STAMP } : { hana: HANA_STAMP, dina: DINA_STAMP });

const inOrder = (xs: Iterable<Item>): Item[] => ITEMS.filter((i) => new Set(xs).has(i));

// ---------- Tagged adds (an OR-Set) ----------

type Tagged = { adds: { item: Item; tag: string }[]; removed: string[] };

function taggedFor(c: CaseId): { hana: Tagged; dina: Tagged } {
  const start = [
    { item: "eggs" as Item, tag: "s:1" },
    { item: "milk" as Item, tag: "s:2" },
  ];
  // Hana saw the starting milk (tag s:2) and removes that tag.
  const hana: Tagged = { adds: start, removed: ["s:2"] };
  const dina: Tagged = { adds: [...start, { item: c === 1 ? ("tea" as Item) : ("milk" as Item), tag: "D:1" }], removed: [] };
  return { hana, dina };
}

function taggedMerge(c: CaseId): Item[] {
  const { hana, dina } = taggedFor(c);
  const adds = [...hana.adds, ...dina.adds];
  const removed = new Set([...hana.removed, ...dina.removed]);
  return inOrder(adds.filter((a) => !removed.has(a.tag)).map((a) => a.item));
}

/** The cart a rule makes from the two edits. */
export function merge(rule: Rule, c: CaseId, flipped: boolean): Item[] {
  const { hana, dina } = cartsFor(c);
  switch (rule) {
    case "lww": {
      const s = stampsFor(flipped);
      return s.dina > s.hana ? dina : hana;
    }
    case "union":
      return inOrder([...hana, ...dina]);
    case "byName": {
      // Items = both carts together, minus every name either side removed.
      const removed = new Set(START.filter((i) => !hana.includes(i)));
      return inOrder([...hana, ...dina].filter((i) => !removed.has(i)));
    }
    case "tagged":
      return taggedMerge(c);
  }
}

export type Mark = "right" | "back" | "lost";

/** For each item, whether the result gets it right, brings back one nobody wants, or loses one somebody added. */
export function grade(result: readonly Item[], intended: readonly Item[]): { item: Item; mark: Mark }[] {
  return ITEMS.flatMap<{ item: Item; mark: Mark }>((item) => {
    const got = result.includes(item);
    const want = intended.includes(item);
    if (got && want) return [{ item, mark: "right" as const }];
    if (got) return [{ item, mark: "back" as const }];
    if (want) return [{ item, mark: "lost" as const }];
    return [];
  });
}

export function verdict(rule: Rule, c: CaseId, flipped: boolean): { text: string; tone: Tone } {
  const marks = grade(merge(rule, c, flipped), intendedFor(c));
  const wrong = marks.filter((m) => m.mark !== "right");
  if (wrong.length === 0) return rule === "lww" ? { text: "Right only if Dina's stamp is later", tone: "warn" } : { text: "Both people's intent kept", tone: "good" };
  return wrong.some((m) => m.mark === "back") ? { text: "Milk came back", tone: "bad" } : { text: "Dina's add was lost", tone: "bad" };
}

export function listItems(items: readonly string[]): string {
  if (items.length === 0) return "an empty cart";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function describeResult(rule: Rule, c: CaseId, flipped: boolean): string {
  const label = RULES.find((r) => r.id === rule)!.label;
  return `${label}, case ${c}: ${listItems(merge(rule, c, flipped))}. ${verdict(rule, c, flipped).text}.`;
}
