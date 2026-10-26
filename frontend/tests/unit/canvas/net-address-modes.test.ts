import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ADDRESS_KINDS,
  CIDR_DRILL_MAX,
  CIDR_DRILL_MIN,
  DRILL_SIZE,
  KIND_BLOCKS,
  addrConfigSchema,
  allocateConfigSchema,
  allocateVerdict,
  allocationRows,
  allocationTotals,
  bestUnused,
  blockSize,
  checkCidrAnswer,
  classify,
  classifyBlock,
  classifyConfigSchema,
  classifyFeedback,
  classifyReason,
  cidrRange,
  explainCidrQuestion,
  formatAddressNumber,
  generateCidrDrill,
  kindCounts,
  maskNumber,
  numberToIp,
  placeBlock,
  prefixConfigSchema,
  prefixFacts,
  prefixNote,
  prefixTable,
  smallestFit,
  usableCount,
  wrapWords,
  type AddressKind,
  type AllocateConfig,
  type CidrQuestion,
} from "@buildment/learning-ui/canvas/models/net-address";
import { netM2AllocateCidr, netM2AllocateCidrConfig } from "@buildment/learning-ui/canvas/net-m2-allocate-cidr/data";
import { netM2AllocateClass, netM2AllocateClassConfig } from "@buildment/learning-ui/canvas/net-m2-allocate-class/data";
import { netM2CidrDrill, netM2CidrDrillConfig } from "@buildment/learning-ui/canvas/net-m2-cidr-drill/data";
import { netM2Classify, netM2ClassifyConfig } from "@buildment/learning-ui/canvas/net-m2-classify/data";
import { netM2Prefix, netM2PrefixConfig } from "@buildment/learning-ui/canvas/net-m2-prefix/data";
import { netM2SceneFreePool } from "@buildment/learning-ui/canvas/net-m2-scene-free-pool/data";
import { netM2SceneSameAddress } from "@buildment/learning-ui/canvas/net-m2-scene-same-address/data";
import { AddressBitsCanvas } from "@buildment/learning-ui/canvas/net-m2-address-bits/AddressBitsCanvas";
import { netM2AddressDrill } from "@buildment/learning-ui/canvas/net-m2-address-drill/data";
import { canvasRegistry } from "@buildment/learning-ui/canvas/registry";
import { loopTime, sceneFrame } from "@buildment/learning-ui/canvas/renderers/scene/frame";
import { actorBox, actorsInside, BOX_H, chipTops, frameCollisions, MAX_SUB_CHARS } from "@buildment/learning-ui/canvas/renderers/scene/geometry";

const EM_DASH = new RegExp(String.fromCharCode(0x5c) + "u2014");
const VENDORS = /claude|anthropic|openai|gpt|gemini|copilot/i;

const slugs = canvasRegistry as Record<string, (typeof canvasRegistry)[keyof typeof canvasRegistry]>;

// ---------------------------------------------------------------- prefixes

describe("prefix table, /8 to /32", () => {
  const table = prefixTable();

  it("has one row for every prefix from /8 to /32", () => {
    expect(table.map((r) => r.prefix)).toEqual(Array.from({ length: 25 }, (_, i) => i + 8));
  });

  it("sizes each block as 2^(32-n) and halves it for every extra bit", () => {
    for (const row of table) expect(row.size).toBe(2 ** (32 - row.prefix));
    for (let i = 1; i < table.length; i += 1) expect(table[i].size * 2).toBe(table[i - 1].size);
    expect(blockSize(8)).toBe(16_777_216);
    expect(blockSize(16)).toBe(65_536);
    expect(blockSize(24)).toBe(256);
    expect(blockSize(30)).toBe(4);
  });

  it("takes two addresses off for the network and broadcast up to /30", () => {
    for (const row of table.filter((r) => r.prefix <= 30)) expect(row.usable).toBe(row.size - 2);
    expect(usableCount(8)).toBe(16_777_214);
    expect(usableCount(16)).toBe(65_534);
    expect(usableCount(24)).toBe(254);
    expect(usableCount(30)).toBe(2);
  });

  it("makes /31 two addresses and /32 one, both fully usable", () => {
    expect(table.find((r) => r.prefix === 31)).toMatchObject({ size: 2, usable: 2, mask: "255.255.255.254" });
    expect(table.find((r) => r.prefix === 32)).toMatchObject({ size: 1, usable: 1, mask: "255.255.255.255" });
    expect(prefixNote(31)).toContain("2 addresses");
    expect(prefixNote(32)).toContain("one address");
    expect(prefixNote(24)).toContain("minus 2");
  });

  it("writes the mask in dotted form, with n ones then zeros", () => {
    const masks: Record<number, string> = { 8: "255.0.0.0", 9: "255.128.0.0", 16: "255.255.0.0", 20: "255.255.240.0", 24: "255.255.255.0", 25: "255.255.255.128", 30: "255.255.255.252" };
    for (const [p, mask] of Object.entries(masks)) expect(numberToIp(maskNumber(Number(p)))).toBe(mask);
    for (const row of table) {
      const bits = prefixFacts("10.20.143.7", row.prefix).maskBits;
      expect(bits.slice(0, row.prefix).every((b) => b === 1)).toBe(true);
      expect(bits.slice(row.prefix).every((b) => b === 0)).toBe(true);
    }
    expect(maskNumber(0)).toBe(0);
  });

  it("finds the first and last address of 10.20.143.7 at several lengths", () => {
    const at = (p: number) => {
      const f = prefixFacts("10.20.143.7", p);
      return [f.first, f.last];
    };
    expect(at(8)).toEqual(["10.0.0.0", "10.255.255.255"]);
    expect(at(16)).toEqual(["10.20.0.0", "10.20.255.255"]);
    expect(at(20)).toEqual(["10.20.128.0", "10.20.143.255"]);
    expect(at(24)).toEqual(["10.20.143.0", "10.20.143.255"]);
    expect(at(29)).toEqual(["10.20.143.0", "10.20.143.7"]);
    expect(at(31)).toEqual(["10.20.143.6", "10.20.143.7"]);
    expect(at(32)).toEqual(["10.20.143.7", "10.20.143.7"]);
  });

  it("keeps every block's last minus first equal to its size minus one, with no NaN", () => {
    for (const row of table) {
      const f = prefixFacts("10.20.143.7", row.prefix);
      const { start, end } = cidrRange(`${f.first}/${row.prefix}`);
      expect(end - start + 1).toBe(row.size);
      expect(f.networkBits + f.hostBits).toBe(32);
      expect(Number.isFinite(f.size) && Number.isFinite(f.usable)).toBe(true);
    }
  });

  it("rejects a prefix that is not a whole number from 0 to 32", () => {
    for (const bad of [-1, 33, 1.5, Number.NaN]) {
      expect(() => blockSize(bad)).toThrow(RangeError);
      expect(() => maskNumber(bad)).toThrow(RangeError);
    }
  });
});

// ---------------------------------------------------------------- allocation

describe("allocation", () => {
  const needs = [30, 300, 700, 2000, 5000];
  const classPicks = [24, 16, 16, 16, 16];
  const cidrPicks = [27, 23, 22, 21, 19];

  it("uses the same five organisations in both slugs", () => {
    expect(netM2AllocateClassConfig.orgs.map((o) => o.need)).toEqual(needs);
    expect(netM2AllocateCidrConfig.orgs.map((o) => o.need)).toEqual(needs);
  });

  it("leaves 254,360 addresses unused when every class is right", () => {
    const rows = allocationRows(netM2AllocateClassConfig, classPicks);
    expect(rows.map((r) => r.unused)).toEqual([224, 65_234, 64_834, 63_534, 60_534]);
    const totals = allocationTotals(netM2AllocateClassConfig, classPicks);
    expect(totals).toMatchObject({ unused: 254_360, placed: 5, routes: 5, complete: true });
    expect(bestUnused(netM2AllocateClassConfig)).toBe(254_360);
  });

  it("leaves 3,768 addresses unused when every CIDR block is the smallest that fits", () => {
    const rows = allocationRows(netM2AllocateCidrConfig, cidrPicks);
    expect(rows.map((r) => r.usable)).toEqual([30, 510, 1022, 2046, 8190]);
    expect(rows.map((r) => r.unused)).toEqual([0, 210, 322, 46, 3190]);
    expect(allocationTotals(netM2AllocateCidrConfig, cidrPicks)).toMatchObject({ unused: 3768, routes: 5, complete: true });
    expect(bestUnused(netM2AllocateCidrConfig)).toBe(3768);
  });

  it("finds the smallest block that fits each need", () => {
    expect(needs.map((n) => smallestFit(n, netM2AllocateCidrConfig.choices))).toEqual(cidrPicks);
    expect(needs.map((n) => smallestFit(n, netM2AllocateClassConfig.choices))).toEqual(classPicks);
    expect(smallestFit(9000, netM2AllocateCidrConfig.choices)).toBeNull();
    expect(smallestFit(30, [{ prefix: 27 }])).toBe(27);
    expect(smallestFit(31, [{ prefix: 27 }])).toBeNull();
  });

  it("refuses a block that is too small and changes nothing", () => {
    const empty = needs.map(() => null);
    const refused = placeBlock(netM2AllocateClassConfig, empty, 1, 24);
    expect(refused).toMatchObject({ refused: true, message: "300 computers do not fit in 254" });
    expect(refused.picks).toEqual(empty);
    const cidr = placeBlock(netM2AllocateCidrConfig, empty, 4, 20);
    expect(cidr.refused).toBe(true);
    expect(cidr.message).toBe("5,000 computers do not fit in 4,094");
    // The exact fit: 30 computers in a /27 with 30 usable.
    expect(placeBlock(netM2AllocateCidrConfig, empty, 0, 27)).toMatchObject({ refused: false, picks: [27, null, null, null, null] });
  });

  it("allows a bigger block and the unused count rises", () => {
    const empty = needs.map(() => null);
    const roomy = placeBlock(netM2AllocateCidrConfig, empty, 1, 22);
    expect(roomy.refused).toBe(false);
    expect(allocationRows(netM2AllocateCidrConfig, roomy.picks)[1].unused).toBe(722);
    expect(roomy.message).toBe("Law firm: /22 holds 1,022, 722 unused");
  });

  it("says the right thing in the verdict at each stage, within about 42 characters", () => {
    const empty = needs.map(() => null);
    const cfg = netM2AllocateCidrConfig;
    expect(allocateVerdict(cfg, empty, null)).toEqual({ text: "Give each organisation a block", tone: "accent" });
    expect(allocateVerdict(netM2AllocateClassConfig, empty, null).text).toBe("Give each organisation a class");
    expect(allocateVerdict(cfg, [27, null, null, null, null], null)).toEqual({ text: "1 of 5 placed, 0 unused", tone: "accent" });
    expect(allocateVerdict(cfg, cidrPicks, null)).toEqual({ text: "3,768 unused: the least possible", tone: "good" });
    expect(allocateVerdict(netM2AllocateClassConfig, classPicks, null)).toEqual({ text: "254,360 unused: classes cannot do better", tone: "warn" });
    expect(allocateVerdict(cfg, [27, 22, 22, 21, 19], null)).toEqual({ text: "4,280 unused; 3,768 is possible", tone: "warn" });
    expect(allocateVerdict(cfg, empty, "300 computers do not fit in 254")).toEqual({ text: "300 computers do not fit in 254", tone: "bad" });
    for (const picks of [empty, [27, null, null, null, null], cidrPicks, [19, 19, 19, 19, 19], [27, 22, 22, 21, 19]]) {
      expect(allocateVerdict(cfg, picks, null).text.length).toBeLessThanOrEqual(42);
    }
    expect(allocateVerdict(netM2AllocateClassConfig, classPicks, null).text.length).toBeLessThanOrEqual(42);
  });

  it("counts one routing table entry per block placed", () => {
    for (let k = 0; k <= 5; k += 1) {
      const picks = cidrPicks.map((p, i) => (i < k ? p : null));
      expect(allocationTotals(netM2AllocateCidrConfig, picks).routes).toBe(k);
    }
  });

  it("walks every placement without a NaN, in both modes", () => {
    for (const cfg of [netM2AllocateClassConfig, netM2AllocateCidrConfig] as AllocateConfig[]) {
      for (let row = 0; row < cfg.orgs.length; row += 1) {
        for (const { prefix } of cfg.choices) {
          const r = placeBlock(cfg, cfg.orgs.map(() => null), row, prefix);
          expect(Number.isFinite(allocationTotals(cfg, r.picks).unused)).toBe(true);
        }
      }
    }
  });
});

// ---------------------------------------------------------------- classify

describe("classify", () => {
  const expected: Record<AddressKind, string[]> = {
    private: ["192.168.1.23", "10.20.143.7", "172.17.0.3", "172.31.255.254"],
    public: ["172.32.0.1", "192.169.1.1", "1.1.1.1"],
    shared: ["100.72.14.9"],
    special: ["127.0.0.1", "169.254.10.20", "203.0.113.45", "0.0.0.0"],
  };

  it("puts the twelve addresses of the canvas in the stated buckets", () => {
    expect([...netM2ClassifyConfig.addresses].sort()).toEqual(Object.values(expected).flat().sort());
    expect(netM2ClassifyConfig.addresses).toHaveLength(12);
    for (const kind of ADDRESS_KINDS) for (const ip of expected[kind]) expect(classify(ip), ip).toBe(kind);
    expect(kindCounts(netM2ClassifyConfig.addresses)).toEqual({ public: 3, private: 4, shared: 1, special: 4 });
  });

  it("agrees with the exercise's test list at every block edge", () => {
    const cases: [string, AddressKind][] = [
      ["172.16.0.0", "private"], ["172.31.255.255", "private"], ["172.15.255.255", "public"], ["172.32.0.0", "public"],
      ["100.64.0.0", "shared"], ["100.127.255.255", "shared"], ["100.128.0.0", "public"], ["100.63.255.255", "public"],
      ["127.0.0.1", "special"], ["169.254.1.1", "special"], ["203.0.113.45", "special"], ["0.0.0.0", "special"],
      ["255.255.255.255", "special"], ["240.0.0.1", "special"], ["198.19.255.255", "special"], ["198.20.0.0", "public"],
      ["192.169.1.1", "public"], ["1.1.1.1", "public"], ["10.0.0.0", "private"], ["10.255.255.255", "private"],
      ["192.168.0.0", "private"], ["192.168.255.255", "private"],
    ];
    for (const [ip, kind] of cases) expect(classify(ip), ip).toBe(kind);
    expect(classify(3232235799)).toBe("private");
  });

  it("throws on a string that is not an address", () => {
    for (const bad of ["192.168.1.256", "1.2.3", "01.2.3.4", ""]) expect(() => classify(bad), bad).toThrow(RangeError);
  });

  it("has a valid block for every row of the list, none overlapping another kind", () => {
    for (const block of KIND_BLOCKS) {
      const r = cidrRange(block.cidr);
      expect(r.end).toBeGreaterThanOrEqual(r.start);
      expect(classifyBlock(r.start)?.kind).toBe(block.kind);
      expect(classifyBlock(r.end)?.kind).toBe(block.kind);
    }
  });

  it("says why, including the near misses", () => {
    expect(classifyFeedback("172.32.0.1", "private")).toEqual({
      right: false,
      text: "Not private. 172.32.0.1 is just past 172.31.255.255, where the private block ends",
    });
    expect(classifyFeedback("192.169.1.1", "private").text).toBe("Not private. 192.169.1.1 is just past 192.168.255.255, where the private block ends");
    expect(classifyFeedback("192.168.1.23", "public").text).toBe("Not public. 192.168.1.23 is inside 192.168.0.0/16, a private block (RFC 1918)");
    expect(classifyFeedback("1.1.1.1", "special").text).toBe("Not special. 1.1.1.1 is in no private, shared or special block, so it is public");
    expect(classifyFeedback("100.72.14.9", "private").text).toContain("100.64.0.0/10");
    expect(classifyFeedback("10.20.143.7", "private")).toEqual({ right: true, text: "Yes. 10.20.143.7 is inside 10.0.0.0/8, a private block (RFC 1918)" });
  });

  it("keeps every message to two lines of the picture, for every address and every try", () => {
    for (const ip of netM2ClassifyConfig.addresses) {
      for (const kind of ADDRESS_KINDS) {
        const { text } = classifyFeedback(ip, kind);
        expect(wrapWords(text, 50).length, text).toBeLessThanOrEqual(2);
        expect(text).not.toMatch(EM_DASH);
      }
      expect(classifyReason(ip).length).toBeGreaterThan(10);
    }
  });

  it("wraps at spaces", () => {
    expect(wrapWords("aaa bbb ccc", 7)).toEqual(["aaa bbb", "ccc"]);
    expect(wrapWords("averyveryverylongword x", 5)).toEqual(["averyveryverylongword", "x"]);
    expect(wrapWords("", 10)).toEqual([]);
  });
});

// ---------------------------------------------------------------- CIDR drill

describe("CIDR drill", () => {
  const sets = Array.from({ length: 80 }, (_, i) => i + 1);

  it("is deterministic for a set number and differs between sets", () => {
    for (const s of sets) expect(generateCidrDrill(s)).toEqual(generateCidrDrill(s));
    expect(JSON.stringify(generateCidrDrill(1))).not.toBe(JSON.stringify(generateCidrDrill(2)));
    expect(JSON.stringify(generateCidrDrill(7))).toBe(JSON.stringify(generateCidrDrill(7)));
  });

  it("asks five questions: three sizes and two masks", () => {
    for (const s of sets) {
      const qs = generateCidrDrill(s);
      expect(qs).toHaveLength(DRILL_SIZE);
      expect(qs.filter((q) => q.kind === "prefix-size")).toHaveLength(3);
      expect(qs.filter((q) => q.kind === "prefix-mask")).toHaveLength(2);
    }
  });

  it("uses a different prefix for every question in a set, within /9 to /30", () => {
    for (const s of sets) {
      const prefixes = generateCidrDrill(s).map((q) => q.prefix);
      expect(new Set(prefixes).size, `set ${s}`).toBe(prefixes.length);
      for (const p of prefixes) {
        expect(p).toBeGreaterThanOrEqual(CIDR_DRILL_MIN);
        expect(p).toBeLessThanOrEqual(CIDR_DRILL_MAX);
      }
    }
  });

  it("offers the answer and the two neighbouring prefixes, three different options", () => {
    for (const s of sets) {
      for (const q of generateCidrDrill(s)) {
        const own = q.kind === "prefix-size" ? blockSize(q.prefix) : numberToIp(maskNumber(q.prefix));
        const lower = q.kind === "prefix-size" ? blockSize(q.prefix - 1) : numberToIp(maskNumber(q.prefix - 1));
        const upper = q.kind === "prefix-size" ? blockSize(q.prefix + 1) : numberToIp(maskNumber(q.prefix + 1));
        expect(q.answer).toBe(own);
        expect([...q.options].sort()).toEqual([own, lower, upper].sort());
        expect(new Set<number | string>(q.options).size).toBe(3);
      }
    }
  });

  it("moves the right answer around the three positions", () => {
    const positions = new Set<number>();
    for (const s of sets) for (const q of generateCidrDrill(s)) positions.add((q.options as (number | string)[]).indexOf(q.answer));
    expect(positions).toEqual(new Set([0, 1, 2]));
  });

  it("checks answers and rejects the neighbours", () => {
    for (const s of sets.slice(0, 30)) {
      for (const q of generateCidrDrill(s)) {
        expect(checkCidrAnswer(q, q.answer)).toBe(true);
        for (const o of q.options as (number | string)[]) if (o !== q.answer) expect(checkCidrAnswer(q, o)).toBe(false);
      }
    }
  });

  it("explains in short words", () => {
    const size: CidrQuestion = { kind: "prefix-size", prefix: 20, options: [4096, 2048, 8192], answer: 4096 };
    const mask: CidrQuestion = { kind: "prefix-mask", prefix: 20, options: ["255.255.240.0", "255.255.224.0", "255.255.248.0"], answer: "255.255.240.0" };
    expect(explainCidrQuestion(size)).toBe("32 - 20 = 12 host bits, so 4,096");
    expect(explainCidrQuestion(mask)).toBe("20 ones, 12 zeros: 255.255.240.0");
    for (const s of sets) for (const q of generateCidrDrill(s)) expect(explainCidrQuestion(q).length).toBeLessThanOrEqual(44);
  });

  it("leaves the 2.2 drill untouched", () => {
    expect(netM2AddressDrill.title).toBe("Byte and address drill");
  });
});

// ---------------------------------------------------------------- the parameters are plain data

describe("canvas parameters", () => {
  const configs = [netM2AllocateClassConfig, netM2AllocateCidrConfig, netM2PrefixConfig, netM2CidrDrillConfig, netM2ClassifyConfig];

  it("pass the schema of their mode, and survive a trip through JSON", () => {
    for (const cfg of configs) {
      expect(addrConfigSchema.safeParse(cfg).success, cfg.mode).toBe(true);
      expect(JSON.parse(JSON.stringify(cfg))).toEqual(cfg);
      expect(addrConfigSchema.parse(JSON.parse(JSON.stringify(cfg)))).toEqual(cfg);
    }
    expect(allocateConfigSchema.safeParse(netM2AllocateClassConfig).success).toBe(true);
    expect(prefixConfigSchema.safeParse(netM2PrefixConfig).success).toBe(true);
    expect(classifyConfigSchema.safeParse(netM2ClassifyConfig).success).toBe(true);
  });

  it("hold no function and no element anywhere", () => {
    const walk = (v: unknown, path: string) => {
      expect(typeof v, path).not.toBe("function");
      if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
    };
    for (const cfg of configs) walk(cfg, cfg.mode);
  });

  it("reject parameters that would break the picture", () => {
    const base = netM2AllocateCidrConfig;
    expect(addrConfigSchema.safeParse({ ...base, flavour: "other" }).success).toBe(false);
    expect(addrConfigSchema.safeParse({ ...base, orgs: [{ name: "x", need: 0 }] }).success).toBe(false);
    expect(addrConfigSchema.safeParse({ ...base, orgs: [] }).success).toBe(false);
    expect(addrConfigSchema.safeParse({ ...base, choices: [{ prefix: 24, label: "a" }, { prefix: 24, label: "b" }] }).success).toBe(false);
    expect(addrConfigSchema.safeParse({ ...base, choices: [{ prefix: 31, label: "a" }, { prefix: 24, label: "b" }] }).success).toBe(false);
    expect(addrConfigSchema.safeParse({ ...netM2PrefixConfig, address: "10.20.143.256" }).success).toBe(false);
    expect(addrConfigSchema.safeParse({ ...netM2PrefixConfig, initial: 40 }).success).toBe(false);
    expect(addrConfigSchema.safeParse({ ...netM2PrefixConfig, min: 30, max: 30, initial: 30 }).success).toBe(false);
    expect(addrConfigSchema.safeParse({ ...netM2ClassifyConfig, addresses: ["1.1.1.1", "1.1.1.1", "2.2.2.2", "3.3.3.3"] }).success).toBe(false);
    expect(addrConfigSchema.safeParse({ ...netM2ClassifyConfig, addresses: ["1.1.1.1", "x", "2.2.2.2", "3.3.3.3"] }).success).toBe(false);
    expect(addrConfigSchema.safeParse({ mode: "nope" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------- the seven slugs

const PLAYABLE = {
  "net-m2-allocate-class": netM2AllocateClass,
  "net-m2-allocate-cidr": netM2AllocateCidr,
  "net-m2-prefix": netM2Prefix,
  "net-m2-cidr-drill": netM2CidrDrill,
  "net-m2-classify": netM2Classify,
} as const;
const SCENES = { "net-m2-scene-free-pool": netM2SceneFreePool, "net-m2-scene-same-address": netM2SceneSameAddress } as const;

describe("the seven slugs", () => {
  it("are registered", () => {
    for (const [slug, spec] of [...Object.entries(PLAYABLE), ...Object.entries(SCENES)]) expect(slugs[slug], slug).toBe(spec);
  });

  it("write no em dash and no AI vendor in the words learners read, and state their limits", () => {
    for (const spec of [...Object.values(PLAYABLE), ...Object.values(SCENES)]) {
      const text = `${spec.title} ${spec.purpose} ${spec.limits}`;
      expect(text).not.toMatch(EM_DASH);
      expect(text).not.toMatch(VENDORS);
      expect(spec.limits.length).toBeGreaterThan(40);
    }
  });

  const props = (s: { title: string; purpose: string; limits: string }) => ({ title: s.title, purpose: s.purpose, limits: s.limits });
  const render = (spec: (typeof PLAYABLE)[keyof typeof PLAYABLE]) => renderToString(createElement(spec.component, props(spec)));

  it("render their starting state on the server with a verdict, a live summary and a fold", () => {
    const expectedVerdict: Record<string, string> = {
      "net-m2-allocate-class": "Give each organisation a class",
      "net-m2-allocate-cidr": "Give each organisation a block",
      "net-m2-prefix": "/24: 256 addresses, mask 255.255.255.0",
      "net-m2-cidr-drill": "Question 1 of 5",
      "net-m2-classify": "0 of 12 sorted",
    };
    for (const [slug, spec] of Object.entries(PLAYABLE)) {
      const html = render(spec);
      expect(html, slug).toContain(expectedVerdict[slug]);
      expect(html).toContain("<svg");
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain("What this picture leaves out");
      expect(html).not.toMatch(/="NaN"|>NaN</);
      expect(html).not.toMatch(EM_DASH);
      expect(html).not.toMatch(/dangerouslySetInnerHTML|<foreignObject|<script|javascript:/);
      // Theme tones only: no colour written as a hex value on any shape.
      expect(html).not.toMatch(/(fill|stroke|color)="#/i);
      expect(html).not.toMatch(/(fill|stroke|color):\s*#/i);
    }
  });

  it("print no label smaller than 13 units", () => {
    for (const [slug, spec] of Object.entries(PLAYABLE)) {
      for (const m of render(spec).matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)) expect(Number(m[1]), `${slug}: ${m[0]}`).toBeGreaterThanOrEqual(13);
    }
  });

  it("name every button and mark the toggles with aria-pressed", () => {
    for (const [slug, spec] of Object.entries(PLAYABLE)) {
      const html = render(spec);
      for (const m of html.matchAll(/<g role="button"[^>]*>/g)) expect(m[0], slug).toMatch(/aria-label="[^"]+"/);
    }
    expect(render(netM2AllocateCidr)).toContain('aria-pressed="true"');
    expect(render(netM2AllocateCidr)).toContain('aria-pressed="false"');
    expect(render(netM2Classify)).toContain('aria-pressed="false"');
    expect(render(netM2Prefix)).toContain('role="slider"');
    expect(render(netM2Prefix)).toContain('aria-valuenow="24"');
  });

  it("keep to two controls outside the picture", () => {
    // Native buttons outside the svg: count them in the markup after the figure's picture.
    for (const [slug, spec] of Object.entries(PLAYABLE)) {
      const html = render(spec);
      const after = html.slice(html.indexOf("</svg>"));
      expect((after.match(/<button/g) ?? []).length, slug).toBeLessThanOrEqual(2);
    }
  });

  it("show the numbers of the spec in the starting pictures", () => {
    const prefix = render(netM2Prefix);
    for (const text of ["10.20.143.7", "255.255.255.0", "10.20.143.0", "10.20.143.255", ">256<", ">254<"]) expect(prefix, text).toContain(text);
    const cidr = render(netM2AllocateCidr);
    for (const text of ["Print shop", "Retailer", "5,000 computers", "/19", "8,190", "routing table entries"]) expect(cidr, text).toContain(text);
    const cls = render(netM2AllocateClass);
    for (const text of ["Class C", "Class B", "65,534", "254"]) expect(cls, text).toContain(text);
    const classify = render(netM2Classify);
    for (const ip of netM2ClassifyConfig.addresses) expect(classify, ip).toContain(ip);
    expect(classify).toContain("Public");
    expect(classify).toContain("Special");
    const drill = render(netM2CidrDrill);
    expect(drill).toContain("Set 1");
    expect(drill).toMatch(/How many addresses are in this block\?|Which mask goes with this prefix\?/);
  });

  it("fall back to a quiet message when the settings are missing or wrong, never a crash", () => {
    const base = { title: "t", purpose: "p", limits: "l" };
    for (const mode of ["allocate", "prefix", "classify"] as const) {
      expect(renderToString(createElement(AddressBitsCanvas, { ...base, mode })), mode).toContain("could not load");
    }
    const wrongMode = renderToString(createElement(AddressBitsCanvas, { ...base, mode: "prefix", config: netM2ClassifyConfig }));
    expect(wrongMode).toContain("could not load");
    // The 2.2 drill still opens without any settings.
    expect(renderToString(createElement(AddressBitsCanvas, { ...base, mode: "drill" }))).toContain("Question 1 of 5");
  });
});

// ---------------------------------------------------------------- the two scenes

describe("the two scenes", () => {
  const dayOfYear = (y: number, m: number, d: number) => (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86_400_000;
  const yearValue = (y: number, m: number, d: number) => y + dayOfYear(y, m, d) / 365;

  it("never draw two boxes over each other, keep actors inside, and keep the top clear", () => {
    for (const [slug, spec] of Object.entries(SCENES)) {
      const scene = spec.scene;
      expect(actorsInside(scene), slug).toBe(true);
      for (const a of scene.actors) expect(a.y - BOX_H / 2 - 5, `${slug}: ${a.id}`).toBeGreaterThanOrEqual(44);
      for (let t = 0; t <= scene.loop; t += 0.1) {
        expect(frameCollisions(scene, sceneFrame(scene, t)), `${slug} at ${t}s`).toEqual([]);
      }
    }
  });

  it("keep every second line, say text and verdict short enough for its box", () => {
    for (const [slug, spec] of Object.entries(SCENES)) {
      for (const a of spec.scene.actors) expect((a.sub ?? "").length, `${slug}: ${a.sub}`).toBeLessThanOrEqual(MAX_SUB_CHARS);
      for (const e of spec.scene.events) {
        if (e.kind === "say") expect(e.text.length, `${slug}: ${e.text}`).toBeLessThanOrEqual(MAX_SUB_CHARS);
        if (e.kind === "verdict") expect(e.text.length, `${slug}: ${e.text}`).toBeLessThanOrEqual(38);
      }
      for (const a of spec.scene.actors) expect(a.label.length, `${slug}: ${a.label}`).toBeLessThanOrEqual(10);
    }
  });

  it("place a message label only where it is clear of every card", () => {
    for (const [slug, spec] of Object.entries(SCENES)) {
      const scene = spec.scene;
      for (let t = 0; t <= scene.loop; t += 0.1) {
        const frame = sceneFrame(scene, t);
        const tops = chipTops(scene, frame);
        frame.packets.forEach((p, i) => {
          const top = tops[i];
          if (top === null) return;
          const left = p.x - (p.label.length * 6.6 + 16) / 2;
          const right = p.x + (p.label.length * 6.6 + 16) / 2;
          for (const a of frame.actors) {
            const c = actorBox(a);
            const hit = left < c.right && c.left < right && p.y + top < c.bottom && c.top < p.y + top + 20;
            expect(hit, `${slug} at ${t}s: "${p.label}" over ${a.label}`).toBe(false);
          }
        });
      }
    }
  });

  it("end on their verdict, which is also the reduced-motion frame", () => {
    const pool = netM2SceneFreePool.scene;
    const poolEnd = sceneFrame(pool, loopTime(pool, 1e6));
    expect(poolEnd.verdict).toEqual({ text: "Pool empty. The web still works.", tone: "good" });
    const same = netM2SceneSameAddress.scene;
    expect(sceneFrame(same, loopTime(same, 1e6)).verdict).toEqual({ text: "Same address, different homes.", tone: "accent" });
  });

  it("put the four registry dates on the year strip at their true places, one beat each", () => {
    const tags = netM2SceneFreePool.scene.events.filter((e) => e.kind === "tag");
    expect(tags.map((e) => e.label)).toEqual(["3 Feb 2011", "15 Apr 2011", "24 Sep 2015", "25 Nov 2019"]);
    const truth = [yearValue(2011, 2, 3), yearValue(2011, 4, 15), yearValue(2015, 9, 24), yearValue(2019, 11, 25)];
    tags.forEach((e, i) => {
      if (e.kind === "tag") expect(Math.abs(e.value - truth[i]), e.label).toBeLessThan(0.01);
    });
    const times = tags.map((e) => e.at);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    expect(new Set(times).size).toBe(4);
    // Each date lands together with its registry on the pool's status line.
    const says = netM2SceneFreePool.scene.events.filter((e) => e.kind === "say" && e.actor === "pool");
    for (const [i, name] of ["IANA", "APNIC", "ARIN", "RIPE"].entries()) {
      expect(says.some((e) => e.kind === "say" && e.at === times[i] && e.text.startsWith(name)), name).toBe(true);
    }
  });

  it("keep the website answering after the pool is empty, and drain the pool while it does", () => {
    const scene = netM2SceneFreePool.scene;
    const emptyAt = Math.max(...scene.events.filter((e) => e.kind === "tag").map((e) => e.at));
    const requestsAfter = scene.events.filter((e) => e.kind === "fly" && e.from === "visitor" && e.at > emptyAt);
    expect(requestsAfter.length).toBeGreaterThan(0);
    const wait = scene.events.find((e) => e.kind === "wait");
    expect(wait && wait.kind === "wait" && wait.actor).toBe("pool");
    expect(sceneFrame(scene, 3).waits[0].progress).toBeGreaterThan(0);
    expect(sceneFrame(scene, 3).waits[0].progress).toBeLessThan(1);
    expect(sceneFrame(scene, 9).waits[0]).toMatchObject({ progress: 1, label: "all gone" });
    expect(sceneFrame(scene, 12.5).actors.find((a) => a.id === "site")).toMatchObject({ sub: "still answering", tone: "good" });
  });

  it("show three homes with the same private address, and a packet to it refused", () => {
    const scene = netM2SceneSameAddress.scene;
    const laptops = scene.actors.filter((a) => a.id.startsWith("l"));
    expect(laptops).toHaveLength(3);
    expect(new Set(laptops.map((a) => a.sub))).toEqual(new Set(["192.168.1.23"]));
    expect(classify("192.168.1.23")).toBe("private");
    const routerAddresses = scene.actors.filter((a) => a.id.startsWith("r")).map((a) => a.sub ?? "");
    expect(new Set(routerAddresses).size).toBe(3);
    for (const ip of routerAddresses) expect(classify(ip), ip).toBe("special");
    const refused = scene.events.find((e) => e.kind === "fly" && e.tone === "bad");
    expect(refused && refused.kind === "fly" && refused.label).toBe("to 192.168.1.23");
    expect(sceneFrame(scene, 8).actors.find((a) => a.id === "net")).toMatchObject({ sub: "drops it", tone: "bad" });
    expect(sceneFrame(scene, 8).actors.find((a) => a.id === "l2")?.sub).toBe("sees nothing");
  });
});
