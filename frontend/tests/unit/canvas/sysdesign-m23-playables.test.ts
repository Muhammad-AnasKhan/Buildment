import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CALL_STEPS,
  PRODUCT_STEPS,
  perSecond,
  rings,
  SEARCH_STEPS,
  searchEstimate,
  searchRates,
  searchTail,
  searchVerdict,
  SHOPPER_STEPS,
} from "@buildment/learning-ui/canvas/models/search-estimate";
import {
  askVerdict,
  buildIndex,
  DEFAULT_QUERY,
  INDEX,
  QUERY_WORDS,
  scoreText,
  search,
  splitWords,
  STEP_CAPTIONS,
  toggleWord,
  tokenize,
  weight,
  wordLabel,
  PRODUCTS,
  type QueryWord,
} from "@buildment/learning-ui/canvas/models/tiny-index";
import { buildTrie, KEYS, MAX_TYPED, nextKeys, press, QUERIES, TRIE, trieVerdict, walk, walkSentence } from "@buildment/learning-ui/canvas/models/trie-walk";
import {
  amberTypos,
  bestHashes,
  BITS_LADDER,
  bloomSizeVerdict,
  filledCells,
  HASH_LADDER,
  hashesFromFraction,
  hashesToFraction,
  memoryMb,
  memoryText,
  oneInText,
  ratioToBest,
  rateText,
  shareSet,
  sharePercent,
  sizeValueText,
  wrongMaybe,
} from "@buildment/learning-ui/canvas/models/bloom-hashes";
import { falsePositiveRate } from "@buildment/learning-ui/canvas/models/bloom";
import {
  band,
  bytesText,
  hllVerdict,
  memoryBytes,
  memoryRatio,
  millionsText,
  percentText,
  ratioText,
  REGISTER_LADDER,
  registersFromFraction,
  registersToFraction,
  registersValueText,
  standardError,
  wobble,
} from "@buildment/learning-ui/canvas/models/hll-registers";
import { sysdesignM23EstimatePlay } from "@buildment/learning-ui/canvas/sysdesign-m23-estimate-play/data";
import { sysdesignM23TinyIndex } from "@buildment/learning-ui/canvas/sysdesign-m23-tiny-index/data";
import { sysdesignM23TrieWalk } from "@buildment/learning-ui/canvas/sysdesign-m23-trie-walk/data";
import { sysdesignM23BloomSize } from "@buildment/learning-ui/canvas/sysdesign-m23-bloom-size/data";
import { sysdesignM23HllRegisters } from "@buildment/learning-ui/canvas/sysdesign-m23-hll-registers/data";

const MAX = 38;

describe("m23 estimate model (23.1)", () => {
  const row = (shoppers: number, searches: number, calls: number, products: number) => searchEstimate({ shoppers, searches, calls, products });

  it("matches the spec's table", () => {
    const table: [number, number, number, number, number, number, number, number, string][] = [
      [50e6, 4, 5, 200e6, 6_944, 34_722, 80, 8, "Suggestions and index size drive it"],
      [10e6, 2, 3, 50e6, 694, 2_083, 20, 2, "One machine could serve this"],
      [100e6, 8, 5, 500e6, 27_778, 138_889, 200, 20, "Suggestions and index size drive it"],
      [25e6, 1, 1, 20e6, 868, 868, 8, 1, "One machine could serve this"],
      [200e6, 4, 5, 200e6, 27_778, 138_889, 80, 8, "Suggestions and index size drive it"],
      [50e6, 4, 2, 200e6, 6_944, 13_889, 80, 8, "Suggestions and index size drive it"],
      [50e6, 4, 5, 1e9, 6_944, 34_722, 400, 40, "Suggestions and index size drive it"],
    ];
    for (const [s, se, c, p, searchPeak, suggestPeak, gb, shards, verdict] of table) {
      const r = row(s, se, c, p);
      expect(Math.round(r.searchPeak), `${s} ${se} ${c} ${p}`).toBe(searchPeak);
      expect(Math.round(r.suggestPeak)).toBe(suggestPeak);
      expect(r.indexGb).toBeCloseTo(gb, 6);
      expect(r.shards).toBe(shards);
      expect(searchVerdict(r).text).toBe(verdict);
    }
  });

  it("writes numbers the way the picture shows them", () => {
    const r = row(50e6, 4, 5, 200e6);
    expect(perSecond(r.searchPeak)).toBe("6,944 /s");
    expect(perSecond(r.suggestPeak)).toBe("34,722 /s");
    expect(r.searchesPerDay).toBe(200e6);
    expect(r.callsPerDay).toBe(1e9);
    expect(searchTail(r)).toBe("6,944 searches a second at peak, 34,722 suggestion calls a second, 80 GB index, 8 shards");
  });

  it("rings the suggestion card at 10,000 and the shards card at 4", () => {
    expect(rings(row(50e6, 4, 5, 200e6))).toEqual({ suggest: true, shards: true });
    expect(rings(row(50e6, 4, 2, 20e6))).toEqual({ suggest: true, shards: false });
    expect(rings(row(10e6, 1, 1, 200e6))).toEqual({ suggest: false, shards: true });
    expect(rings(row(10e6, 2, 3, 50e6))).toEqual({ suggest: false, shards: false });
    // Search alone never rings: 7,000 a second at peak and still only the other two cards matter.
    expect(searchVerdict(row(50e6, 4, 1, 20e6)).text).toBe("One machine could serve this");
    expect(searchVerdict(row(50e6, 4, 5, 20e6)).text).toBe("Suggestions drive the traffic");
    expect(searchVerdict(row(10e6, 1, 1, 200e6)).text).toBe("Index size drives: shard it");
  });

  it("keeps every verdict at 38 characters or fewer and reaches all four", () => {
    const seen = new Set<string>();
    for (const shoppers of SHOPPER_STEPS) for (const searches of SEARCH_STEPS) for (const calls of CALL_STEPS) for (const products of PRODUCT_STEPS) {
      const v = searchVerdict(row(shoppers, searches, calls, products));
      seen.add(v.text);
      expect(v.text.length, v.text).toBeLessThanOrEqual(MAX);
    }
    expect(seen.size).toBe(4);
  });

  it("flows faster for bigger values", () => {
    const small = searchRates(row(10e6, 1, 1, 20e6));
    const big = searchRates(row(200e6, 8, 8, 1e9));
    expect(big.suggestPeak).toBeGreaterThan(small.suggestPeak);
    expect(big.shards).toBeGreaterThan(small.shards);
  });
});

describe("m23 tiny index (23.2)", () => {
  it("tokenizes the way the chapter does", () => {
    expect(tokenize("Running Shoes!")).toEqual(["running", "shoe"]);
    expect(tokenize("  Red, WATERPROOF hiking-shoes (size 42) ")).toEqual(["red", "waterproof", "hiking", "shoe", "size", "42"]);
    expect(tokenize("this")).toEqual(["thi"]);
    expect(tokenize("bus")).toEqual(["bus"]);
  });

  it("splits each product into the words of the spec, marking the stripped s", () => {
    expect(PRODUCTS.map((p) => splitWords(p.text).map((s) => s.word))).toEqual([
      ["red", "running", "shoe"],
      ["blue", "running", "short"],
      ["red", "waterproof", "hiking", "shoe"],
    ]);
    expect(splitWords("Red running shoes").map((s) => s.stripped)).toEqual([false, false, true]);
    expect(splitWords("Blue running shorts").map((s) => s.stripped)).toEqual([false, false, true]);
  });

  it("flips the table into the chapter's output", () => {
    expect(INDEX.terms).toEqual(["blue", "hiking", "red", "running", "shoe", "short", "waterproof"]);
    expect(INDEX.terms).toEqual([...QUERY_WORDS]);
    expect(INDEX.postings).toEqual({ blue: [2], hiking: [3], red: [1, 3], running: [1, 2], shoe: [1, 3], short: [2], waterproof: [3] });
    expect(buildIndex().postings).toEqual(INDEX.postings);
  });

  it("weighs rare words more: ln(3 / products that contain the word)", () => {
    for (const w of ["red", "shoe", "running"]) expect(weight(w)).toBeCloseTo(0.405, 3);
    for (const w of ["blue", "short", "waterproof", "hiking"]) expect(weight(w)).toBeCloseTo(1.099, 3);
    expect(weight("unknown")).toBe(0);
  });

  it("matches the spec's table of queries", () => {
    const table: [string[], number[], [number, string][]][] = [
      [["red"], [1, 3], [[1, "0.405"], [3, "0.405"]]],
      [["red", "shoe"], [1, 3], [[1, "0.811"], [3, "0.811"]]],
      [["red", "waterproof", "shoe"], [3], [[3, "1.910"], [1, "0.811"]]],
      [["blue", "red"], [], [[2, "1.099"], [1, "0.405"], [3, "0.405"]]],
      [["running", "shoe"], [1], [[1, "0.811"], [2, "0.405"], [3, "0.405"]]],
      [["hiking"], [3], [[3, "1.099"]]],
      [["waterproof", "hiking"], [3], [[3, "2.197"]]],
      [["running"], [1, 2], [[1, "0.405"], [2, "0.405"]]],
    ];
    for (const [query, and, ranked] of table) {
      const a = search(query);
      expect(a.and, query.join("+")).toEqual(and);
      expect(a.ranked.map((r) => [r.id, r.score.toFixed(3)]), query.join("+")).toEqual(ranked);
    }
    expect(search([]).and).toEqual([]);
    expect(search([]).ranked).toEqual([]);
  });

  it("gives the step captions and the four verdicts, each 38 characters or fewer", () => {
    expect([...STEP_CAPTIONS]).toEqual(["Three products, in plain text", "Words are cleaned and split", "Now each word lists its products"]);
    expect(askVerdict(["hiking"])).toEqual({ text: "Found: product 3 matches every word", tone: "good" });
    expect(askVerdict(["red", "shoe"])).toEqual({ text: "2 products have every word", tone: "good" });
    expect(askVerdict(["blue", "red"])).toEqual({ text: "No product has every word", tone: "warn" });
    expect(askVerdict([])).toEqual({ text: "Tap words to ask a question", tone: "accent" });
    const subsets = 1 << QUERY_WORDS.length;
    for (let mask = 0; mask < subsets; mask++) {
      const q = QUERY_WORDS.filter((_, i) => mask & (1 << i));
      expect(askVerdict(q).text.length).toBeLessThanOrEqual(MAX);
    }
    for (const c of STEP_CAPTIONS) expect(c.length).toBeLessThanOrEqual(MAX);
  });

  it("toggles words and keeps the table order; the default query is red and shoe", () => {
    expect(DEFAULT_QUERY).toEqual(["red", "shoe"]);
    let q: QueryWord[] = [...DEFAULT_QUERY];
    q = toggleWord(q, "blue");
    expect(q).toEqual(["blue", "red", "shoe"]);
    q = toggleWord(q, "red");
    expect(q).toEqual(["blue", "shoe"]);
    expect(toggleWord([], "hiking")).toEqual(["hiking"]);
    expect(wordLabel("waterproof")).toBe("waterproof, in 1 product, adds 1.10");
    expect(wordLabel("red")).toBe("red, in 2 products, adds 0.41");
    expect(scoreText(1.9101)).toBe("1.91");
  });
});

/** The trie of chapter 23.3, copied from the chapter's code block, to check the model against it. */
type ChapterNode = { next: Map<string, ChapterNode>; top: [string, number][] };

function chapterTrie(queries: readonly (readonly [string, number])[], k = 3) {
  const root: ChapterNode = { next: new Map(), top: [] };
  for (const [text, count] of queries) {
    let node = root;
    for (const ch of text) {
      if (!node.next.has(ch)) node.next.set(ch, { next: new Map(), top: [] });
      node = node.next.get(ch) as ChapterNode;
      node.top.push([text, count]);
      node.top.sort((a, b) => b[1] - a[1]);
      if (node.top.length > k) node.top.pop();
    }
  }
  return root;
}
function chapterSuggest(root: ChapterNode, prefix: string) {
  let node: ChapterNode | undefined = root;
  for (const ch of prefix) {
    node = node.next.get(ch);
    if (!node) return [];
  }
  return node.top.map(([text]) => text);
}
const countNodes = (node: ChapterNode): number => 1 + [...node.next.values()].reduce((n, c) => n + countNodes(c), 0);

describe("m23 trie walk (23.3)", () => {
  it("has 50 nodes for 71 characters, as the chapter says", () => {
    expect(TRIE.nodes).toBe(50);
    expect(TRIE.characters).toBe(71);
    expect(countNodes(chapterTrie(QUERIES))).toBe(50);
    expect(QUERIES.reduce((n, [t]) => n + t.length, 0)).toBe(71);
  });

  it("answers every prefix of every query exactly as the chapter code does", () => {
    const root = chapterTrie(QUERIES);
    const prefixes = new Set<string>(["", "x", "sx", "shx", "shoex", "w", "wa", "shoes ", "shoes r", "shower c"]);
    for (const [text] of QUERIES) for (let i = 1; i <= text.length; i++) prefixes.add(text.slice(0, i));
    for (const p of prefixes) {
      expect(walk(p).answer.map(([t]) => t), `"${p}"`).toEqual(chapterSuggest(root, p));
    }
  });

  it("filters the list by prefix and keeps the best three by count", () => {
    for (const p of ["s", "sh", "she", "sho", "shoe", "shoes", "wa", "shower"]) {
      const expected = QUERIES.filter(([t]) => t.startsWith(p)).sort((a, b) => b[1] - a[1]).slice(0, 3);
      expect(walk(p).answer, p).toEqual(expected);
    }
  });

  it("matches the spec's table", () => {
    const text = (p: string) => walk(p).answer.map(([t, c]) => `${t} ${c}`);
    expect(text("s")).toEqual(["shoes 9200", "shirt 7000", "shorts 4100"]);
    expect(text("sh")).toEqual(["shoes 9200", "shirt 7000", "shorts 4100"]);
    expect(text("she")).toEqual(["sheets 2600"]);
    expect(text("shi")).toEqual(["shirt 7000"]);
    expect(text("sho")).toEqual(["shoes 9200", "shorts 4100", "shoes red 3100"]);
    expect(text("shoe")).toEqual(["shoes 9200", "shoes red 3100", "shoelaces 900"]);
    expect(text("shoes")).toEqual(["shoes 9200", "shoes red 3100"]);
    expect(text("shoes ")).toEqual(["shoes red 3100"]);
    expect(text("shor")).toEqual(["shorts 4100"]);
    expect(text("show")).toEqual(["shower curtain 1800"]);
    expect(text("shou")).toEqual(["shoulder bag 1500"]);
    expect(text("w")).toEqual(["watch 5200"]);
    expect(text("wa")).toEqual(["watch 5200"]);
    expect(text("x")).toEqual([]);
  });

  it("reads nothing below the node, counts one step for each letter and stops at a missing child", () => {
    const w = walk("shoe");
    expect(w.steps).toBe(4);
    expect(w.readBelow).toBe(0);
    expect(w.node?.prefix).toBe("shoe");
    const dead = walk("shx");
    expect(dead.node).toBeNull();
    expect(dead.dead).toBe("x");
    expect(dead.steps).toBe(3);
    expect(dead.path.map((n) => n.prefix)).toEqual(["", "s", "sh"]);
    expect(walk("shxyz").dead).toBe("x");
    expect(walk("").steps).toBe(0);
  });

  it("lights only the letters that have a child at the current node", () => {
    expect([...nextKeys(walk(""))].sort()).toEqual(["s", "w"]);
    expect([...nextKeys(walk("sh"))].sort()).toEqual(["e", "i", "o"]);
    expect([...nextKeys(walk("sho"))].sort()).toEqual(["e", "r", "u", "w"]);
    expect([...nextKeys(walk("shoes"))]).toEqual([" "]);
    expect([...nextKeys(walk("shirt"))]).toEqual([]);
    expect([...nextKeys(walk("zz"))]).toEqual([]);
    for (const k of nextKeys(walk("sho"))) expect(KEYS).toContain(k);
  });

  it("presses keys: adds a letter, caps the box, backspace removes one", () => {
    expect(press("sh", "o")).toBe("sho");
    expect(press("shoes", " ")).toBe("shoes ");
    expect(press("", "back")).toBe("");
    expect(press("sho", "back")).toBe("sh");
    expect(press("a".repeat(MAX_TYPED), "s")).toHaveLength(MAX_TYPED);
    // Backspace after a missing letter walks back onto the trie.
    expect(walk(press("shx", "back")).node?.prefix).toBe("sh");
  });

  it("gives the three verdicts and a sentence for the live region", () => {
    expect(trieVerdict(walk(""))).toEqual({ text: "Type a letter to walk down", tone: "accent" });
    expect(trieVerdict(walk("sho"))).toEqual({ text: "Answer read from 1 node", tone: "good" });
    expect(trieVerdict(walk("x"))).toEqual({ text: "No query starts with this", tone: "warn" });
    expect(walkSentence(walk("she"))).toBe('Typed "she", 3 steps, read below the node: 0. Answer: sheets 2600.');
    expect(walkSentence(walk("x"))).toContain("No query starts with this");
  });

  it("builds the same tree for other k", () => {
    const t = buildTrie(QUERIES, 10);
    expect(walk("s", t).answer).toHaveLength(8);
  });
});

describe("m23 bloom size (23.4)", () => {
  it("agrees with the chapter 7.3 model at the best hash count", () => {
    for (const b of BITS_LADDER) expect(wrongMaybe(b, bestHashes(b)), `b = ${b}`).toBeCloseTo(falsePositiveRate(b), 12);
  });

  it("matches the spec's table", () => {
    const table: [number, number, string, number, string, string][] = [
      [10, 7, "0.82%", 1.0, "50.3%", "125 MB"],
      [10, 1, "9.52%", 11.61, "9.5%", "125 MB"],
      [10, 4, "1.18%", 1.44, "33.0%", "125 MB"],
      [10, 10, "1.02%", 1.24, "63.2%", "125 MB"],
      [10, 14, "1.90%", 2.32, "75.3%", "125 MB"],
      [10, 20, "5.46%", 6.66, "86.5%", "125 MB"],
      [5, 3, "9.18%", 1.0, "45.1%", "62.5 MB"],
      [15, 10, "0.07%", 1.0, "48.7%", "187.5 MB"],
      [15, 1, "6.45%", 86.69, "6.4%", "187.5 MB"],
      [20, 14, "0.0067%", 1.0, "50.3%", "250 MB"],
    ];
    for (const [b, k, fp, ratio, share, mem] of table) {
      expect(rateText(wrongMaybe(b, k)), `${b}/${k}`).toBe(fp);
      expect(ratioToBest(b, k), `${b}/${k}`).toBeCloseTo(ratio, 2);
      expect(sharePercent(b, k), `${b}/${k}`).toBe(share);
      expect(memoryText(b)).toBe(mem);
    }
    expect([2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(bestHashes)).toEqual([1, 2, 3, 3, 4, 6, 7, 8, 10, 14]);
  });

  it("fills cells and amber typos from the rates", () => {
    expect(filledCells(10, 7)).toBe(25);
    expect(filledCells(10, 20)).toBe(43);
    expect(amberTypos(10, 7)).toBe(1);
    expect(amberTypos(10, 1)).toBe(10);
    expect(amberTypos(20, 14)).toBe(0);
    expect(amberTypos(2, 20)).toBe(100);
    expect(memoryMb(10)).toBe(125);
    expect(oneInText(wrongMaybe(10, 7))).toBe("about 1 typo in 122");
    expect(oneInText(0.999)).toBe("nearly every typo");
    expect(shareSet(10, 7)).toBeCloseTo(0.503, 3);
  });

  it("gives the five verdicts, each 38 characters or fewer", () => {
    expect(bloomSizeVerdict(10, 1)).toEqual({ text: "Too few hashes: typos slip through", tone: "warn" });
    expect(bloomSizeVerdict(10, 14)).toEqual({ text: "Too many hashes: the row fills up", tone: "warn" });
    expect(bloomSizeVerdict(10, 7)).toEqual({ text: "Near the best hash count, few errors", tone: "good" });
    expect(bloomSizeVerdict(8, 6)).toEqual({ text: "Best hashes, but add more bits", tone: "warn" });
    expect(bloomSizeVerdict(6, 4)).toEqual({ text: "Best hashes, still too many errors", tone: "bad" });
    const seen = new Set<string>();
    for (const b of BITS_LADDER) for (const k of HASH_LADDER) {
      const v = bloomSizeVerdict(b, k);
      seen.add(v.text);
      expect(v.text.length, v.text).toBeLessThanOrEqual(MAX);
    }
    expect(seen.size).toBe(5);
  });

  it("maps the hash rail to whole numbers from 1 to 20", () => {
    expect(HASH_LADDER).toHaveLength(20);
    expect(hashesFromFraction(0)).toBe(1);
    expect(hashesFromFraction(1)).toBe(20);
    for (const k of HASH_LADDER) expect(hashesFromFraction(hashesToFraction(k))).toBe(k);
    expect(hashesFromFraction(Number.NaN)).toBe(1);
  });

  it("writes the slider sentence", () => {
    const t = sizeValueText(10, 7);
    expect(t).toContain("10 bits per word, 7 hashes");
    expect(t).toContain("0.82%");
    expect(t).toContain("125 MB");
    expect(t).toContain("Near the best hash count, few errors");
  });
});

describe("m23 HyperLogLog registers (23.4)", () => {
  it("matches the spec's table", () => {
    const table: [number, string, string, [number, number], [number, number]][] = [
      [16, "12 B", "26%", [37, 63], [24, 76]],
      [64, "48 B", "13%", [43.5, 56.5], [37, 63]],
      [256, "192 B", "6.5%", [46.75, 53.25], [43.5, 56.5]],
      [1024, "768 B", "3.25%", [48.375, 51.625], [46.75, 53.25]],
      [4096, "3 KB", "1.63%", [49.1875, 50.8125], [48.375, 51.625]],
      [16384, "12 KB", "0.81%", [49.59375, 50.40625], [49.1875, 50.8125]],
    ];
    for (const [m, mem, err, one, two] of table) {
      expect(bytesText(memoryBytes(m)), `${m}`).toBe(mem);
      expect(percentText(standardError(m)), `${m}`).toBe(err);
      const b1 = band(m, 1);
      const b2 = band(m, 2);
      expect(b1.lo / 1e6).toBeCloseTo(one[0], 4);
      expect(b1.hi / 1e6).toBeCloseTo(one[1], 4);
      expect(b2.lo / 1e6).toBeCloseTo(two[0], 4);
      expect(b2.hi / 1e6).toBeCloseTo(two[1], 4);
    }
    expect([1024, 4096, 16384].map((m) => millionsText(band(m, 1).lo))).toEqual(["48.38", "49.19", "49.59"]);
    expect(millionsText(band(1024, 1).hi)).toBe("51.63");
  });

  it("compares the sketch with the exact 400 MB", () => {
    expect(memoryBytes(16384)).toBe(12288);
    expect(memoryRatio(16384)).toBe(32552);
    expect(ratioText(16384)).toBe("1 / 32,552 of the exact memory");
    expect(bytesText(400_000_000)).toBe("400 MB");
  });

  it("gives the three verdicts, each 38 characters or fewer", () => {
    expect(hllVerdict(16)).toEqual({ text: "Too rough to trust", tone: "bad" });
    expect(hllVerdict(256)).toEqual({ text: "Too rough to trust", tone: "bad" });
    expect(hllVerdict(1024)).toEqual({ text: "Fine for a dashboard", tone: "warn" });
    expect(hllVerdict(4096)).toEqual({ text: "Fine for a dashboard", tone: "warn" });
    expect(hllVerdict(16384)).toEqual({ text: "Under 1% error in 12 KB", tone: "good" });
    for (const m of REGISTER_LADDER) expect(hllVerdict(m).text.length).toBeLessThanOrEqual(MAX);
  });

  it("maps the rail to the six rungs", () => {
    expect(registersFromFraction(0)).toBe(16);
    expect(registersFromFraction(1)).toBe(16384);
    for (const m of REGISTER_LADDER) expect(registersFromFraction(registersToFraction(m))).toBe(m);
    expect(registersFromFraction(Number.NaN)).toBe(16);
  });

  it("wobbles inside two standard errors and shrinks with the registers", () => {
    for (const m of REGISTER_LADDER) {
      for (let t = 0; t < 60; t += 0.37) {
        const e = Math.abs(wobble(m, t) - 50e6) / 50e6;
        expect(e).toBeLessThanOrEqual(1.4 * standardError(m) + 1e-12);
      }
    }
    expect(registersValueText(16384)).toContain("0.81%");
  });
});

describe("m23 playable specs", () => {
  const specs = [sysdesignM23EstimatePlay, sysdesignM23TinyIndex, sysdesignM23TrieWalk, sysdesignM23BloomSize, sysdesignM23HllRegisters];
  const html = (s: (typeof specs)[number]) => renderToString(createElement(s.component, { title: s.title, purpose: s.purpose, limits: s.limits })).replaceAll("<!-- -->", "");

  it("are custom canvases with a title, purpose and limits", () => {
    for (const s of specs) {
      expect(s.kind).toBe("custom");
      expect(s.title.length).toBeGreaterThan(5);
      expect(s.purpose.length).toBeGreaterThan(40);
      expect(s.limits.length).toBeGreaterThan(40);
    }
  });

  it("server-render a picture with the limits fold", () => {
    for (const s of specs) {
      const out = html(s);
      expect(out, s.title).toContain("<svg");
      expect(out, s.title).toContain("What this picture leaves out");
    }
  });

  it("show the default state on the server", () => {
    expect(html(sysdesignM23EstimatePlay)).toContain("Suggestions and index size drive it");
    expect(html(sysdesignM23EstimatePlay)).toContain("34,722 /s");
    expect(html(sysdesignM23TinyIndex)).toContain("Three products, in plain text");
    expect(html(sysdesignM23TrieWalk)).toContain("Type a letter to walk down");
    expect(html(sysdesignM23BloomSize)).toContain("Near the best hash count, few errors");
    expect(html(sysdesignM23BloomSize)).toContain("125 MB");
    expect(html(sysdesignM23HllRegisters)).toContain("Fine for a dashboard");
    expect(html(sysdesignM23HllRegisters)).toContain("1 / 520,833 of the exact memory");
  });

  it("use theme tokens only: no hex colours, no em dashes, no forbidden SVG parts", () => {
    const canvas = path.resolve(__dirname, "../../../../packages/learning-ui/src/canvas");
    const files = [
      ...["sysdesign-m23-estimate-play", "sysdesign-m23-tiny-index", "sysdesign-m23-trie-walk", "sysdesign-m23-bloom-size", "sysdesign-m23-hll-registers"].flatMap((d) =>
        fs.readdirSync(path.join(canvas, d)).map((f) => path.join(canvas, d, f))
      ),
      ...["search-estimate", "tiny-index", "trie-walk", "bloom-hashes", "hll-registers"].map((m) => path.join(canvas, "models", `${m}.ts`)),
    ];
    expect(files.length).toBeGreaterThanOrEqual(15);
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, f).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(src, f).not.toContain("—");
      expect(src, f).not.toMatch(/foreignObject|<animate|<use\b|<image\b/);
    }
  });
});
