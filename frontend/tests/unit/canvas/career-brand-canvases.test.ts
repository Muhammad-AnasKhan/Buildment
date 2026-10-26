import { describe, expect, it } from "vitest";
import { canvasRegistry } from "@buildment/learning-ui/canvas/registry";
import { checkStack } from "@buildment/learning-ui/canvas/models/budget-stack";
import { checkPhrase } from "@buildment/learning-ui/canvas/models/phrase-fixer";
import { checkSlots } from "@buildment/learning-ui/canvas/models/slot-card";
import { checkDeck } from "@buildment/learning-ui/canvas/models/sorter";

// Every canvas of the career-brand course (slugs starting with career-m): the data of the custom ones
// passes the matching check function, and no learner-facing string carries a long dash, a hex colour or an internal word.

type Dict = Record<string, unknown>;

// Vite adds import.meta.glob at test time; the app tsconfig does not include vite/client types.
const modules = (import.meta as unknown as { glob: <T>(pattern: string, options: { eager: true }) => Record<string, T> }).glob<Dict>("../../../../packages/learning-ui/src/canvas/career-m*/data.ts", { eager: true });
const moduleFor = (slug: string): Dict | undefined => {
  const hit = Object.entries(modules).find(([file]) => file.includes(`/${slug}/data.ts`));
  return hit?.[1] as Dict | undefined;
};

const slugs = Object.keys(canvasRegistry)
  .filter((slug) => slug.startsWith("career-m"))
  .sort();

const isDict = (v: unknown): v is Dict => typeof v === "object" && v !== null && !Array.isArray(v);
const isObjArray = (v: unknown): v is Dict[] => Array.isArray(v) && v.length > 0 && v.every(isDict);

/** Every string value inside a value, with the path it was found at. Functions and components are skipped. */
function strings(value: unknown, at: string, out: Array<[string, string]> = []): Array<[string, string]> {
  if (typeof value === "string") out.push([at, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => strings(v, `${at}[${i}]`, out));
  else if (isDict(value)) for (const [k, v] of Object.entries(value)) strings(v, `${at}.${k}`, out);
  return out;
}

const INTERNAL = /\b(canon|dossier|module brief|canvas spec|interaction map|assessment plan)\b/i;
const LONG_DASH = /[\u2013\u2014]/;
const HEX = /#[0-9a-fA-F]{3,8}\b/;

type Checked = { slug: string; kind: "stack" | "phrase" | "slots" | "sorter"; problems: string[] };

function checksFor(slug: string, mod: Dict): Checked[] {
  const found: Checked[] = [];
  const exported = Object.values(mod);
  for (const v of exported) {
    if (!isDict(v)) continue;
    if (isObjArray(v.blocks) && typeof v.budget === "number") {
      found.push({ slug, kind: "stack", problems: checkStack(v as unknown as Parameters<typeof checkStack>[0]) });
    } else if (isObjArray(v.segments) && typeof v.cardLabel === "string") {
      found.push({ slug, kind: "phrase", problems: checkPhrase(v as unknown as Parameters<typeof checkPhrase>[0]) });
    } else if (isObjArray(v.slots) && isObjArray(v.chips) && typeof v.cardTitle === "string") {
      found.push({ slug, kind: "slots", problems: checkSlots(v as unknown as Parameters<typeof checkSlots>[0]) });
    }
  }
  // Sorters export their buckets and cards as two arrays: cards carry an answer and a why, buckets are the ids those answers name.
  const arrays = exported.filter(isObjArray);
  const cards = arrays.find((a) => a.every((c) => typeof c.answer === "string" && isDict(c.why)));
  if (cards) {
    const answers = new Set(cards.map((c) => c.answer));
    const buckets = arrays.find((a) => a !== cards && a.every((b) => typeof b.id === "string") && [...answers].every((id) => a.some((b) => b.id === id)));
    if (buckets) {
      found.push({ slug, kind: "sorter", problems: checkDeck(cards as unknown as Parameters<typeof checkDeck>[0], buckets as unknown as Parameters<typeof checkDeck>[1]) });
    }
  }
  return found;
}

describe("career-brand canvases", () => {
  it("registers the career canvases and finds the data module of each", () => {
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) expect(moduleFor(slug), slug).toBeDefined();
  });

  it("passes the check function of its primitive for every sorter, phrase fixer, budget stack and slot card", () => {
    const all = slugs.flatMap((slug) => checksFor(slug, moduleFor(slug) ?? {}));
    for (const kind of ["stack", "phrase", "slots", "sorter"] as const) {
      expect(all.filter((c) => c.kind === kind).length, `no ${kind} canvas found`).toBeGreaterThan(0);
    }
    for (const c of all) expect(c.problems, `${c.slug} (${c.kind})`).toEqual([]);
  });

  describe.each(slugs)("%s", (slug) => {
    const spec = canvasRegistry[slug as keyof typeof canvasRegistry];

    it("has a title, a purpose and limits", () => {
      expect(spec.title.trim().length).toBeGreaterThan(0);
      expect(spec.purpose.trim().length).toBeGreaterThan(0);
      expect(spec.limits.trim().length).toBeGreaterThan(0);
    });

    it("has no long dash, hex colour or internal word in any learner-facing string", () => {
      const mod = moduleFor(slug) ?? {};
      const found = [
        ...strings({ title: spec.title, purpose: spec.purpose, limits: spec.limits }, "spec"),
        ...Object.entries(mod).flatMap(([name, value]) => strings(value, name)),
      ];
      const seen = new Set<string>();
      for (const [at, text] of found) {
        const key = `${at}=${text}`;
        if (seen.has(key)) continue;
        seen.add(key);
        expect(LONG_DASH.test(text), `${slug} ${at} has an en or em dash: ${text}`).toBe(false);
        expect(HEX.test(text), `${slug} ${at} has a hex colour: ${text}`).toBe(false);
        expect(INTERNAL.test(text), `${slug} ${at} has an internal word: ${text}`).toBe(false);
      }
    });
  });
});
