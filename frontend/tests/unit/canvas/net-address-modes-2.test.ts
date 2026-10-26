import { isIPv6 } from "node:net";
import { describe, expect, it } from "vitest";
import {
  bitsToNumber,
  blockSize,
  byteToBits,
  cidrRange,
  ipToNumber,
  maskNumber,
  numberToBits,
  numberToIp,
  seededRandom,
  usableCount,
} from "../../../../packages/learning-ui/src/canvas/models/net-address";
import {
  DEFAULT_SPLIT_BLOCK,
  MASK_DRILL_PREFIXES,
  alignedStarts,
  andBits,
  andWorking,
  boundaryScenario,
  checkPlacement,
  compareBits,
  cutByteIndex,
  decompose,
  freeBlocks,
  generateMaskDrill,
  generateSplitDrill,
  hostBitsText,
  hostPartOf,
  hostsPrefix,
  isAlignedCidr,
  localCheck,
  maskByteAt,
  maskConfigSchema,
  overlapConfigSchema,
  planSplit,
  placeInOrder,
  rangeNumbers,
  rangeOf,
  relate,
  relationText,
  roleInBlock,
  sameFirstThree,
  sameSubnet,
  slotOf,
  splitConfigSchema,
  startIsAligned,
  startLabel,
  subnetFacts,
  firstFit,
  windowSlots,
  withHostPart,
} from "../../../../packages/learning-ui/src/canvas/models/net-subnet";
import {
  expandV6,
  generateV6Drill,
  judgeV6,
  parseIpv6,
  shortenV6,
  standardRun,
  v6ConfigSchema,
  zeroRuns,
} from "../../../../packages/learning-ui/src/canvas/models/net-ipv6";
import { checkDrillChoice, type DrillItem } from "../../../../packages/learning-ui/src/canvas/models/net-drill";
import { anyAddrConfigSchema, subnetModeSchema } from "../../../../packages/learning-ui/src/canvas/models/net-modes";

// ================================================================ mask-and

describe("subnet facts: network, broadcast, hosts", () => {
  it("works the campus example 10.20.143.7/20 by hand: 143 is 10001111, the mask part 11110000, the AND 128", () => {
    const f = subnetFacts("10.20.143.7", 20);
    expect(f).toMatchObject({
      mask: "255.255.240.0",
      network: "10.20.128.0",
      last: "10.20.143.255",
      broadcast: "10.20.143.255",
      size: 4096,
      hostCount: 4094,
      firstHost: "10.20.128.1",
      lastHost: "10.20.143.254",
      networkBits: 20,
      hostBits: 12,
    });
    expect(byteToBits(143).join("")).toBe("10001111");
    expect(byteToBits(240).join("")).toBe("11110000");
    expect(byteToBits(143 & 240).join("")).toBe("10000000");
    expect(andWorking("10.20.143.7", 20)).toBe("143 AND 240: 10001111 AND 11110000 = 10000000 = 128");
  });

  it("works the /24 example 192.168.1.23", () => {
    expect(subnetFacts("192.168.1.23", 24)).toMatchObject({ network: "192.168.1.0", broadcast: "192.168.1.255", size: 256, hostCount: 254, firstHost: "192.168.1.1", lastHost: "192.168.1.254" });
    expect(sameSubnet("192.168.1.23", "192.168.1.40", 24)).toBe(true);
    expect(sameSubnet("192.168.1.23", "192.168.2.40", 24)).toBe(false);
  });

  it("makes a /23 reach across two third numbers", () => {
    const f = subnetFacts("192.168.1.23", 23);
    expect(f).toMatchObject({ mask: "255.255.254.0", network: "192.168.0.0", last: "192.168.1.255", size: 512, hostCount: 510, firstHost: "192.168.0.1", lastHost: "192.168.1.254" });
  });

  it("gives a /31 two addresses and no directed broadcast [S70]", () => {
    const f = subnetFacts("192.168.1.4", 31);
    expect(f).toMatchObject({ network: "192.168.1.4", last: "192.168.1.5", broadcast: null, size: 2, hostCount: 2, firstHost: "192.168.1.4", lastHost: "192.168.1.5" });
    expect(f.edge).toContain("no directed broadcast");
    expect(subnetFacts("192.168.1.5", 31).network).toBe("192.168.1.4");
    expect(roleInBlock("192.168.1.4", 31)).toBe("host");
    expect(roleInBlock("192.168.1.5", 31)).toBe("host");
  });

  it("makes a /32 one address that is its own network, broadcast and host, and stays unsigned at the top", () => {
    const f = subnetFacts("255.255.255.255", 32);
    expect(f).toMatchObject({ network: "255.255.255.255", last: "255.255.255.255", broadcast: "255.255.255.255", size: 1, hostCount: 1, firstHost: "255.255.255.255", lastHost: "255.255.255.255" });
    expect(f.edge).toContain("one address");
    expect(roleInBlock("10.0.0.1", 32)).toBe("host");
  });

  it("makes a /0 every address, and a /1 start at an unsigned 128.0.0.0", () => {
    expect(subnetFacts("1.2.3.4", 0)).toMatchObject({ mask: "0.0.0.0", network: "0.0.0.0", last: "255.255.255.255", size: 4_294_967_296, hostCount: 4_294_967_294 });
    expect(subnetFacts("128.0.0.1", 1)).toMatchObject({ network: "128.0.0.0", last: "255.255.255.255" });
  });

  it("is the AND of the address bits and the mask bits, with the host bits set to 1 for the last address", () => {
    const rand = seededRandom(7);
    for (let i = 0; i < 600; i += 1) {
      const n = Math.floor(rand() * 2 ** 32);
      const p = Math.floor(rand() * 33);
      const f = subnetFacts(n, p);
      const anded = bitsToNumber(andBits(numberToBits(n), numberToBits(maskNumber(p))));
      expect(f.networkNumber, `${numberToIp(n)}/${p}`).toBe(anded);
      expect(f.lastNumber - f.networkNumber + 1).toBe(blockSize(p));
      expect(f.networkNumber <= n && n <= f.lastNumber).toBe(true);
      expect(hostPartOf(n, p)).toBe(n - f.networkNumber);
      expect(withHostPart(f.networkNumber, p, 2 ** (32 - p) - 1)).toBe(f.lastNumber);
      expect(withHostPart(f.networkNumber, p, 0)).toBe(f.networkNumber);
      expect(f.hostCount).toBe(usableCount(p));
      expect(Number.isFinite(f.size) && Number.isFinite(f.hostCount)).toBe(true);
      const { start, end } = cidrRange(`${f.network}/${p}`);
      expect([start, end]).toEqual([f.networkNumber, f.lastNumber]);
    }
  });

  it("counts hosts as the addresses strictly between network and broadcast up to /30", () => {
    for (let p = 0; p <= 30; p += 1) {
      const f = subnetFacts("10.20.143.7", p);
      expect(f.hostCount, `/${p}`).toBe(f.lastNumber - f.networkNumber - 1);
      expect(f.firstHost).toBe(numberToIp(f.networkNumber + 1));
      expect(f.lastHost).toBe(numberToIp(f.lastNumber - 1));
    }
  });

  it("names the role of an address in its block", () => {
    expect(roleInBlock("10.20.128.0", 20)).toBe("network");
    expect(roleInBlock("10.20.143.255", 20)).toBe("broadcast");
    expect(roleInBlock("10.20.143.7", 20)).toBe("host");
  });

  it("finds the byte where the prefix cuts, and the mask byte in it", () => {
    const cut: [number, number][] = [[0, 0], [8, 0], [9, 1], [16, 1], [17, 2], [20, 2], [23, 2], [24, 2], [25, 3], [31, 3], [32, 3]];
    for (const [prefix, byte] of cut) expect(cutByteIndex(prefix), `/${prefix}`).toBe(byte);
    expect([maskByteAt(20, 2), maskByteAt(23, 2), maskByteAt(20, 0), maskByteAt(20, 3)]).toEqual([240, 254, 255, 0]);
  });
});

describe("the wide mask: where the first-three-numbers shortcut breaks", () => {
  it("says 192.168.0.40 is local for 192.168.1.23/23 while the shortcut says it is not", () => {
    const c = localCheck("192.168.1.23", 23, "192.168.0.40");
    expect(c).toMatchObject({ local: true, shortcutLocal: false, shortcutWrong: true, cutByte: 2, mine: 1, theirs: 0, maskByte: 254, mineAnd: 0, theirsAnd: 0, differsAt: null, network: "192.168.0.0", last: "192.168.1.255" });
    expect(sameFirstThree("192.168.1.23", "192.168.0.40")).toBe(false);
  });

  it("agrees with the shortcut at a /24, and says 192.168.2.40 is not local at a /23", () => {
    expect(localCheck("192.168.1.23", 24, "192.168.1.40")).toMatchObject({ local: true, shortcutLocal: true, shortcutWrong: false });
    expect(localCheck("192.168.1.23", 24, "192.168.0.40")).toMatchObject({ local: false, shortcutWrong: false });
    expect(localCheck("192.168.1.23", 23, "192.168.2.40")).toMatchObject({ local: false, shortcutLocal: false, shortcutWrong: false, theirsAnd: 2 });
  });

  it("reports an earlier number that already differs", () => {
    expect(localCheck("192.168.1.23", 23, "10.168.1.23")).toMatchObject({ local: false, differsAt: 0 });
    expect(localCheck("192.168.1.23", 23, "192.100.1.23")).toMatchObject({ local: false, differsAt: 1 });
  });

  it("breaks the shortcut for a /20 and for a /25 as well", () => {
    expect(localCheck("10.20.143.7", 20, "10.20.130.9")).toMatchObject({ local: true, shortcutWrong: true });
    expect(localCheck("10.20.143.7", 20, "10.20.144.9")).toMatchObject({ local: false, shortcutWrong: false });
    expect(localCheck("10.20.143.7", 25, "10.20.143.200")).toMatchObject({ local: false, shortcutWrong: true });
  });

  it("agrees with the block range for every prefix", () => {
    const rand = seededRandom(11);
    for (let i = 0; i < 400; i += 1) {
      const a = Math.floor(rand() * 2 ** 32);
      const b = rand() < 0.5 ? Math.floor(rand() * 2 ** 32) : Math.min(2 ** 32 - 1, Math.max(0, a + Math.floor(rand() * 4000) - 2000));
      const p = Math.floor(rand() * 33);
      const f = subnetFacts(a, p);
      const inside = b >= f.networkNumber && b <= f.lastNumber;
      expect(sameSubnet(a, b, p), `${numberToIp(a)}/${p} ${numberToIp(b)}`).toBe(inside);
      expect(localCheck(numberToIp(a), p, numberToIp(b)).local).toBe(inside);
    }
  });
});

describe("mask-and parameters", () => {
  const base = { mode: "mask-and" as const, address: "10.20.143.7", prefix: 20 };

  it("accept the five views and survive a JSON round trip", () => {
    const configs = [
      { ...base, view: "bits" as const, min: 8, max: 32 },
      { ...base, view: "and" as const },
      { ...base, view: "broadcast" as const },
      { mode: "mask-and" as const, view: "wide" as const, address: "192.168.1.23", prefix: 23, destination: "192.168.0.40" },
      { mode: "mask-and" as const, view: "drill" as const },
    ];
    for (const c of configs) {
      expect(maskConfigSchema.safeParse(c).success, c.view).toBe(true);
      expect(subnetModeSchema.parse(JSON.parse(JSON.stringify(c)))).toEqual(c);
      expect(anyAddrConfigSchema.safeParse(c).success).toBe(true);
    }
  });

  it("reject settings that would break the picture", () => {
    expect(maskConfigSchema.safeParse({ ...base, view: "and", address: "10.20.143.256" }).success).toBe(false);
    expect(maskConfigSchema.safeParse({ ...base, view: "and", prefix: 33 }).success).toBe(false);
    expect(maskConfigSchema.safeParse({ ...base, view: "and", prefix: undefined }).success).toBe(false);
    expect(maskConfigSchema.safeParse({ ...base, view: "bits", min: 24, max: 30 }).success).toBe(false);
    expect(maskConfigSchema.safeParse({ ...base, view: "bits" }).success).toBe(false);
    expect(maskConfigSchema.safeParse({ ...base, view: "wide" }).success).toBe(false);
    expect(maskConfigSchema.safeParse({ ...base, view: "other" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------- the mask drill

/** Re-derive the right answer of a mask question from its own text, not from the generator. */
function mask(item: DrillItem): { network: string; last: string; prefix: number; address: string } {
  const source = item.kind === "same-subnet" ? /Same network as ([\d.]+)\/(\d+)\?/.exec(item.prompt) : /^([\d.]+)\/(\d+)$/.exec(item.subject);
  if (!source) throw new Error(`cannot read ${item.prompt} / ${item.subject}`);
  const f = subnetFacts(source[1], Number(source[2]));
  return { network: f.network, last: f.last, prefix: f.prefix, address: f.address };
}

describe("the mask drill", () => {
  it("asks the same five questions for the same set number", () => {
    for (const set of [1, 2, 3, 17, 250]) expect(generateMaskDrill(set)).toEqual(generateMaskDrill(set));
    expect(generateMaskDrill(1)).not.toEqual(generateMaskDrill(2));
  });

  it("asks network twice, broadcast twice and same-subnet once, and no kind repeats a prefix inside a set", () => {
    for (let set = 1; set <= 60; set += 1) {
      const items = generateMaskDrill(set);
      expect(items).toHaveLength(5);
      expect(items.map((i) => i.kind).sort()).toEqual(["broadcast", "broadcast", "network", "network", "same-subnet"]);
      const prefixes = items.map((i) => mask(i).prefix);
      expect(new Set(prefixes).size).toBe(5);
      for (const p of prefixes) expect(MASK_DRILL_PREFIXES as readonly number[]).toContain(p);
    }
  });

  it("puts a /20 or /23 in every set, where the first three numbers fail", () => {
    for (let set = 1; set <= 60; set += 1) {
      expect(generateMaskDrill(set).some((i) => [20, 23].includes(mask(i).prefix)), `set ${set}`).toBe(true);
    }
  });

  it("has exactly one right option, and it is the one the model computes", () => {
    for (let set = 1; set <= 80; set += 1) {
      for (const item of generateMaskDrill(set)) {
        const m = mask(item);
        expect(new Set(item.options).size, `${item.prompt} ${item.subject}`).toBe(item.options.length);
        if (item.kind === "network") {
          expect(item.options[item.answer]).toBe(m.network);
          expect(item.options).toHaveLength(3);
        } else if (item.kind === "broadcast") {
          expect(item.options[item.answer]).toBe(m.last);
          expect(item.options).toHaveLength(3);
        } else {
          expect(item.options).toEqual(["Yes, same network", "No, other network"]);
          expect(item.answer === 0).toBe(sameSubnet(m.address, item.subject, m.prefix));
        }
        expect(item.explain.length).toBeGreaterThan(10);
        expect(item.explain).not.toMatch(/NaN|undefined/);
      }
    }
  });

  it("offers the first-three-numbers shortcut as a wrong option whenever it differs from the answer", () => {
    let seen = 0;
    for (let set = 1; set <= 80; set += 1) {
      for (const item of generateMaskDrill(set)) {
        if (item.kind !== "network" && item.kind !== "broadcast") continue;
        const m = mask(item);
        const parts = m.address.split(".");
        const shortcut = item.kind === "network" ? `${parts[0]}.${parts[1]}.${parts[2]}.0` : `${parts[0]}.${parts[1]}.${parts[2]}.255`;
        const right = item.options[item.answer];
        if (shortcut !== right) {
          expect(item.options, `${item.prompt} ${item.subject}`).toContain(shortcut);
          seen += 1;
        }
      }
    }
    expect(seen).toBeGreaterThan(100);
  });

  it("checks a choice by index", () => {
    const item = generateMaskDrill(1)[0];
    expect(checkDrillChoice(item, item.answer)).toBe(true);
    expect(checkDrillChoice(item, (item.answer + 1) % item.options.length)).toBe(false);
  });
});

// ================================================================ split

describe("sizing a network from its host count", () => {
  it("gives 100 devices a /25 (126 usable), 50 a /26 (62) and 20 a /27 (30)", () => {
    expect([100, 50, 20].map(hostsPrefix)).toEqual([25, 26, 27]);
    expect([25, 26, 27].map(usableCount)).toEqual([126, 62, 30]);
  });

  it("fits 126 devices in a /25 but needs a /24 for 127, and 31 hosts need a /26", () => {
    expect(hostsPrefix(126)).toBe(25);
    expect(hostsPrefix(127)).toBe(24);
    expect(hostsPrefix(31)).toBe(26);
    expect(hostsPrefix(30)).toBe(27);
  });

  it("stops at /30 for ordinary networks, and refuses nonsense", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(hostsPrefix)).toEqual([30, 30, 29, 29, 29, 29, 28]);
    for (const bad of [0, -1, 1.5, Number.NaN]) expect(() => hostsPrefix(bad)).toThrow(RangeError);
    expect(() => hostsPrefix(2 ** 31)).toThrow(RangeError);
  });
});

describe("cutting 192.168.10.0/24 for 100, 50 and 20 hosts", () => {
  const needs = [
    { name: "Staff", hosts: 100 },
    { name: "Lab", hosts: 50 },
    { name: "Printers", hosts: 20 },
  ];

  it("places the largest first: /25, /26, /27, and leaves 192.168.10.224/27 free", () => {
    const plan = planSplit(DEFAULT_SPLIT_BLOCK, needs);
    expect(plan.fits).toBe(true);
    expect(plan.placements.map((p) => p.cidr)).toEqual(["192.168.10.0/25", "192.168.10.128/26", "192.168.10.192/27"]);
    expect(plan.placements.map((p) => [p.start - ipToNumber("192.168.10.0"), p.end - ipToNumber("192.168.10.0")])).toEqual([[0, 127], [128, 191], [192, 223]]);
    expect(plan.placements.map((p) => p.usable)).toEqual([126, 62, 30]);
    expect(plan.placements.map((p) => p.spare)).toEqual([26, 12, 10]);
    expect(plan.free.map((f) => f.cidr)).toEqual(["192.168.10.224/27"]);
    expect(plan.unplaced).toEqual([]);
  });

  it("gives the same plan whatever order the needs are listed in", () => {
    const a = planSplit(DEFAULT_SPLIT_BLOCK, needs).placements.map((p) => p.cidr);
    expect(planSplit(DEFAULT_SPLIT_BLOCK, [needs[2], needs[0], needs[1]]).placements.map((p) => p.cidr)).toEqual(a);
    expect(planSplit(DEFAULT_SPLIT_BLOCK, [needs[1], needs[2], needs[0]]).placements.map((p) => p.cidr)).toEqual(a);
  });

  it("never lets two placements overlap, starts each on its own boundary, and accounts for every address", () => {
    const plan = planSplit(DEFAULT_SPLIT_BLOCK, needs);
    for (const p of plan.placements) expect(startIsAligned(p.start, p.prefix)).toBe(true);
    const all = [...plan.placements, ...plan.free].sort((a, b) => a.start - b.start);
    expect(all[0].start).toBe(ipToNumber("192.168.10.0"));
    for (let i = 1; i < all.length; i += 1) expect(all[i].start).toBe(all[i - 1].end + 1);
    expect(all[all.length - 1].end).toBe(ipToNumber("192.168.10.255"));
  });

  it("reports a need that does not fit instead of placing it", () => {
    const plan = planSplit(DEFAULT_SPLIT_BLOCK, [...needs, { name: "Guests", hosts: 100 }]);
    expect(plan.fits).toBe(false);
    // Largest first: Staff and Guests take both halves, so Lab and Printers have no room.
    expect(plan.unplaced.map((n) => n.name)).toEqual(["Lab", "Printers"]);
    expect(planSplit(DEFAULT_SPLIT_BLOCK, [{ name: "Big", hosts: 300 }]).fits).toBe(false);
  });

  it("is the one worked example of the chapter in the schema", () => {
    const config = { mode: "split" as const, view: "size" as const, block: DEFAULT_SPLIT_BLOCK, needs, choices: [24, 25, 26, 27, 28] };
    expect(splitConfigSchema.safeParse(config).success).toBe(true);
  });
});

describe("boundaries and refusals", () => {
  const taken = [{ name: "Staff", start: ipToNumber("192.168.10.0"), prefix: 25 }];
  const at = (offset: number) => ipToNumber("192.168.10.0") + offset;

  it("lets a /26 start only at .0, .64, .128 or .192", () => {
    expect(alignedStarts(DEFAULT_SPLIT_BLOCK, 26).map((s) => startLabel(DEFAULT_SPLIT_BLOCK, s))).toEqual([".0", ".64", ".128", ".192"]);
    expect(alignedStarts(DEFAULT_SPLIT_BLOCK, 25).map((s) => startLabel(DEFAULT_SPLIT_BLOCK, s))).toEqual([".0", ".128"]);
    expect(alignedStarts(DEFAULT_SPLIT_BLOCK, 27)).toHaveLength(8);
    expect(alignedStarts(DEFAULT_SPLIT_BLOCK, 23)).toEqual([]);
    for (let offset = 0; offset < 256; offset += 1) expect(startIsAligned(at(offset), 26), `.${offset}`).toBe(offset % 64 === 0);
  });

  it("refuses a /26 at .100 with the reason: not a boundary, and it overlaps the first /25", () => {
    const check = checkPlacement(DEFAULT_SPLIT_BLOCK, taken, 26, at(100));
    expect(check.ok).toBe(false);
    expect(check.reasons).toEqual(["unaligned", "overlap"]);
    expect(check.message).toBe("A /26 holds 64 addresses, so it can start only at .0, .64, .128 or .192. .100 is not one of them. Its last 6 bits are 100100, not all zero.");
    expect(check.lines[1]).toBe("It would overlap Staff (.0 to .127).");
  });

  it("accepts .128 and .192, and refuses .64 only because the /25 is there", () => {
    expect(checkPlacement(DEFAULT_SPLIT_BLOCK, taken, 26, at(128))).toMatchObject({ ok: true, reasons: [] });
    expect(checkPlacement(DEFAULT_SPLIT_BLOCK, taken, 26, at(192)).ok).toBe(true);
    expect(checkPlacement(DEFAULT_SPLIT_BLOCK, taken, 26, at(64))).toMatchObject({ ok: false, reasons: ["overlap"] });
    expect(checkPlacement(DEFAULT_SPLIT_BLOCK, [], 26, at(64)).ok).toBe(true);
  });

  it("refuses a block that runs outside the parent", () => {
    const check = checkPlacement(DEFAULT_SPLIT_BLOCK, [], 26, at(256));
    expect(check.ok).toBe(false);
    expect(check.reasons).toContain("outside");
    expect(check.message).toContain("outside 192.168.10.0/24");
  });

  it("reads the host bits of a start", () => {
    expect(hostBitsText(at(100), 26)).toBe("100100");
    expect(hostBitsText(at(64), 26)).toBe("000000");
    expect(hostBitsText(at(130), 25)).toBe("0000010");
  });

  it("picks the moving block of the boundary beat: the second largest, after the largest is placed", () => {
    const s = boundaryScenario(DEFAULT_SPLIT_BLOCK, [{ name: "Lab", hosts: 50 }, { name: "Staff", hosts: 100 }]);
    expect(s.taken).toEqual({ name: "Staff", start: ipToNumber("192.168.10.0"), prefix: 25 });
    expect(s.moving).toEqual({ name: "Lab", hosts: 50, prefix: 26 });
    expect(() => boundaryScenario(DEFAULT_SPLIT_BLOCK, [{ name: "One", hosts: 5 }])).toThrow(RangeError);
  });
});

describe("placing blocks in an order", () => {
  const needs = [
    { name: "Staff", hosts: 100 },
    { name: "Lab", hosts: 50 },
    { name: "Printers", hosts: 20 },
  ];

  it("leaves one free piece, 192.168.10.224/27, when the biggest goes first", () => {
    const r = placeInOrder(DEFAULT_SPLIT_BLOCK, needs, [0, 1, 2]);
    expect(r.placements.map((p) => p.cidr)).toEqual(["192.168.10.0/25", "192.168.10.128/26", "192.168.10.192/27"]);
    expect(r.free.map((f) => f.cidr)).toEqual(["192.168.10.224/27"]);
    expect(r.holes).toEqual([]);
    expect(r.refused).toBeNull();
  });

  it("puts only the 100-device block at .0 to .127 first, with the other half free", () => {
    const r = placeInOrder(DEFAULT_SPLIT_BLOCK, needs, [0]);
    expect(r.placements[0]).toMatchObject({ cidr: "192.168.10.0/25", start: ipToNumber("192.168.10.0"), end: ipToNumber("192.168.10.127") });
    expect(r.free.map((f) => f.cidr)).toEqual(["192.168.10.128/25"]);
  });

  it("leaves a hole when the smallest goes first: 192.168.10.32/27 stays between the blocks", () => {
    const r = placeInOrder(DEFAULT_SPLIT_BLOCK, needs, [2, 1, 0]);
    expect(r.placements.map((p) => p.cidr)).toEqual(["192.168.10.0/27", "192.168.10.64/26", "192.168.10.128/25"]);
    expect(r.holes.map((h) => h.cidr)).toEqual(["192.168.10.32/27"]);
    expect(r.refused).toBeNull();
  });

  it("refuses a block when no aligned room is left", () => {
    const r = placeInOrder(DEFAULT_SPLIT_BLOCK, [...needs, { name: "More", hosts: 100 }], [0, 3, 1]);
    expect(r.refused).toBe(1);
    expect(r.placements.map((p) => p.cidr)).toEqual(["192.168.10.0/25", "192.168.10.128/25"]);
  });

  it("finds the lowest aligned free start", () => {
    const first = [{ start: ipToNumber("192.168.10.0"), prefix: 25 }];
    expect(firstFit(DEFAULT_SPLIT_BLOCK, first, 26)).toBe(ipToNumber("192.168.10.128"));
    expect(firstFit(DEFAULT_SPLIT_BLOCK, first, 25)).toBe(ipToNumber("192.168.10.128"));
    expect(firstFit(DEFAULT_SPLIT_BLOCK, [...first, { start: ipToNumber("192.168.10.128"), prefix: 25 }], 30)).toBeNull();
  });

  it("cuts a leftover run into the fewest aligned blocks", () => {
    expect(decompose(1, 255).map((b) => `${b.start}/${b.prefix}`)).toEqual(["1/32", "2/31", "4/30", "8/29", "16/28", "32/27", "64/26", "128/25"]);
    expect(decompose(0, 255).map((b) => b.prefix)).toEqual([24]);
    expect(decompose(0, 2 ** 32 - 1).map((b) => b.prefix)).toEqual([0]);
    expect(freeBlocks(DEFAULT_SPLIT_BLOCK, []).map((b) => b.cidr)).toEqual([DEFAULT_SPLIT_BLOCK]);
    expect(freeBlocks(DEFAULT_SPLIT_BLOCK, [{ start: ipToNumber("192.168.10.0"), end: ipToNumber("192.168.10.255") }])).toEqual([]);
  });
});

describe("the split drill", () => {
  it("asks the same five questions for the same set number", () => {
    for (const set of [1, 2, 9, 100]) expect(generateSplitDrill(set)).toEqual(generateSplitDrill(set));
    expect(generateSplitDrill(1)).not.toEqual(generateSplitDrill(2));
  });

  it("has exactly one right option in every question, checked against the model", () => {
    for (let set = 1; set <= 120; set += 1) {
      const items = generateSplitDrill(set);
      expect(items.map((i) => i.kind).sort()).toEqual(["next", "size", "size", "start", "start"]);
      for (const item of items) {
        const label = `set ${set}: ${item.prompt} ${item.subject}`;
        expect(new Set(item.options).size, label).toBe(item.options.length);
        expect(item.options, label).toHaveLength(3);
        const right = item.options[item.answer];
        if (item.kind === "size") {
          const hosts = Number(/^(\d+) hosts$/.exec(item.subject)?.[1]);
          expect(right, label).toBe(`/${hostsPrefix(hosts)}`);
          for (const [k, o] of item.options.entries()) {
            const p = Number(o.slice(1));
            if (k !== item.answer) expect(usableCount(p) < hosts || p < hostsPrefix(hosts), label).toBe(true);
          }
        } else if (item.kind === "start") {
          const p = Number(/^\/(\d+)$/.exec(item.subject)?.[1]);
          for (const [k, o] of item.options.entries()) {
            const n = ipToNumber(o);
            expect(startIsAligned(n, p), `${label} ${o}`).toBe(k === item.answer);
            expect(n >= ipToNumber("192.168.10.0") && n <= ipToNumber("192.168.10.255")).toBe(true);
          }
        } else {
          const m = /^A \/(\d+) is placed at \.0\. Where does a \/(\d+) go next\?$/.exec(item.prompt);
          expect(m, label).not.toBeNull();
          const [first, second] = [Number(m![1]), Number(m![2])];
          const expected = firstFit(DEFAULT_SPLIT_BLOCK, [{ start: ipToNumber("192.168.10.0"), prefix: first }], second);
          expect(ipToNumber(right), label).toBe(expected);
          for (const [k, o] of item.options.entries()) {
            if (k === item.answer) continue;
            const check = checkPlacement(DEFAULT_SPLIT_BLOCK, [{ name: "first", start: ipToNumber("192.168.10.0"), prefix: first }], second, ipToNumber(o));
            expect(check.ok, `${label} ${o}`).toBe(false);
          }
        }
        expect(item.explain).not.toMatch(/NaN|undefined/);
      }
    }
  });

  it("keeps every prefix inside the /24 and above /24", () => {
    for (let set = 1; set <= 60; set += 1) {
      for (const item of generateSplitDrill(set)) {
        for (const o of item.options) if (item.kind === "size") expect(Number(o.slice(1))).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

// ================================================================ overlap

describe("ranges of blocks", () => {
  it("puts 172.17.0.0/16 at 2,886,795,264 to 2,886,860,799 and 172.17.5.0/24 inside it at 2,886,796,544 to 2,886,796,799", () => {
    const docker = rangeOf("172.17.0.0/16");
    const office = rangeOf("172.17.5.0/24");
    expect([docker.start, docker.end, docker.size]).toEqual([2_886_795_264, 2_886_860_799, 65_536]);
    expect([office.start, office.end, office.size]).toEqual([2_886_796_544, 2_886_796_799, 256]);
    expect(rangeNumbers(docker)).toBe("2,886,795,264 to 2,886,860,799");
    expect(relate(docker, office)).toMatchObject({ kind: "contains", overlap: { start: 2_886_796_544, end: 2_886_796_799, size: 256 }, adjacent: false });
    expect(relate(office, docker).kind).toBe("inside");
    expect(relationText({ name: "Docker", range: docker }, { name: "Office", range: office })).toContain("Office 172.17.5.0/24 sits inside Docker 172.17.0.0/16");
    expect(relationText({ name: "Office", range: office }, { name: "Docker", range: docker })).toContain("every address of Office is also in Docker");
  });

  it("sorts the three pairs of the predict: the second pair overlaps, the other two only touch or stay apart", () => {
    const r = (a: string, b: string) => relate(rangeOf(a), rangeOf(b));
    expect(r("10.0.0.0/16", "10.1.0.0/16")).toMatchObject({ kind: "apart", overlap: null, adjacent: true });
    expect(r("10.0.0.0/8", "10.1.0.0/16")).toMatchObject({ kind: "contains" });
    expect(r("192.168.1.0/25", "192.168.1.128/25")).toMatchObject({ kind: "apart", overlap: null, adjacent: true });
    expect(r("192.168.0.0/16", "192.168.77.0/24").kind).toBe("contains");
    expect(r("172.17.5.0/24", "172.17.5.0/24").kind).toBe("same");
    expect(r("10.0.0.0/8", "192.168.0.0/16")).toMatchObject({ kind: "apart", adjacent: false });
  });

  it("refuses a block written with host bits set", () => {
    expect(isAlignedCidr("172.17.5.1/24")).toBe(false);
    expect(isAlignedCidr("172.17.5.0/24")).toBe(true);
    for (const bad of ["172.17.5.0", "172.17.5.0/33", "172.17.5.0/x", "172.17.5/24", "300.1.1.0/24"]) expect(isAlignedCidr(bad), bad).toBe(false);
    expect(() => rangeOf("172.17.5.1/24")).toThrow(RangeError);
  });

  it("never lets two valid blocks overlap partly: they nest or share nothing, and the bits say so", () => {
    const rand = seededRandom(23);
    let nested = 0;
    let apart = 0;
    for (let i = 0; i < 3000; i += 1) {
      const make = () => {
        const p = 8 + Math.floor(rand() * 25);
        const base = rand() < 0.5 ? 0xac110000 + Math.floor(rand() * 2 ** 18) : Math.floor(rand() * 2 ** 32);
        const size = blockSize(p);
        return rangeOf(`${numberToIp(Math.floor(base / size) * size)}/${p}`);
      };
      const a = make();
      const b = rand() < 0.5 ? make() : (() => {
        // A block inside a: same start, longer prefix, or a later start inside.
        const p = Math.min(32, a.prefix + Math.floor(rand() * 8));
        const size = blockSize(p);
        const start = a.start + Math.floor((rand() * a.size) / size) * size;
        return rangeOf(`${numberToIp(start)}/${p}`);
      })();
      const rel = relate(a, b);
      if (rel.overlap) {
        expect(["same", "contains", "inside"]).toContain(rel.kind);
        const contained = (a.start <= b.start && a.end >= b.end) || (b.start <= a.start && b.end >= a.end);
        expect(contained, `${a.cidr} ${b.cidr}`).toBe(true);
        nested += 1;
      } else {
        expect(rel.kind).toBe("apart");
        apart += 1;
      }
      const bits = compareBits(a, b);
      expect(bits.nested, `${a.cidr} ${b.cidr}`).toBe(rel.overlap !== null);
      expect(bits.shared).toBe(Math.min(a.prefix, b.prefix));
      if (!bits.nested) expect(bits.firstDiff).toBeLessThan(bits.shared);
      expect(relate(b, a).overlap !== null).toBe(rel.overlap !== null);
    }
    expect(nested).toBeGreaterThan(500);
    expect(apart).toBeGreaterThan(500);
  });

  it("finds the first differing bit of two blocks that do not nest", () => {
    const docker = rangeOf("172.17.0.0/16");
    expect(compareBits(docker, rangeOf("172.17.5.0/24"))).toEqual({ shared: 16, firstDiff: null, nested: true });
    // 17 is 00010001 and 18 is 00010010: they first differ at bit 8 + 6 = 14.
    expect(compareBits(docker, rangeOf("172.18.5.0/24"))).toEqual({ shared: 16, firstDiff: 14, nested: false });
    expect(compareBits(docker, rangeOf("172.16.0.0/12"))).toEqual({ shared: 12, firstDiff: null, nested: true });
    expect(compareBits(docker, rangeOf("10.0.0.0/8"))).toMatchObject({ shared: 8, firstDiff: 0 });
  });
});

describe("sliding a block across a window", () => {
  it("counts the places a block can sit, and keeps the index inside", () => {
    const slots = windowSlots("172.16.0.0/14", 24);
    expect(slots.count).toBe(1024);
    expect(slots.start(0)).toBe(ipToNumber("172.16.0.0"));
    expect(slots.start(261)).toBe(ipToNumber("172.17.5.0"));
    expect(slots.start(99999)).toBe(ipToNumber("172.19.255.0"));
    expect(slots.start(-4)).toBe(ipToNumber("172.16.0.0"));
    expect(slotOf("172.16.0.0/14", 24, ipToNumber("172.17.5.0"))).toBe(261);
    expect(windowSlots("172.16.0.0/12", 12)).toMatchObject({ count: 1 });
    expect(windowSlots("172.16.0.0/12", 24).count).toBe(4096);
  });

  it("snaps a start to its own slot when the size changes", () => {
    const start = ipToNumber("172.17.5.0");
    const slot16 = slotOf("172.16.0.0/12", 16, start);
    expect(windowSlots("172.16.0.0/12", 16).start(slot16)).toBe(ipToNumber("172.17.0.0"));
    expect(slotOf("172.16.0.0/12", 12, start)).toBe(0);
  });
});

describe("overlap parameters", () => {
  const line = { mode: "overlap" as const, view: "line" as const, fixedName: "Docker", fixed: "172.17.0.0/16", movingName: "Office", moving: "172.17.5.0/24", window: "172.16.0.0/14" };

  it("accept both views and survive a JSON round trip", () => {
    const nest = { ...line, view: "nest" as const, window: "172.16.0.0/12", minPrefix: 12, maxPrefix: 28 };
    for (const c of [line, nest]) {
      expect(overlapConfigSchema.safeParse(c).success, c.view).toBe(true);
      expect(subnetModeSchema.parse(JSON.parse(JSON.stringify(c)))).toEqual(c);
    }
  });

  it("reject a block with host bits, a block outside the window, and a nest without prefix bounds", () => {
    expect(overlapConfigSchema.safeParse({ ...line, moving: "172.17.5.1/24" }).success).toBe(false);
    expect(overlapConfigSchema.safeParse({ ...line, moving: "10.0.0.0/24" }).success).toBe(false);
    expect(overlapConfigSchema.safeParse({ ...line, view: "nest" }).success).toBe(false);
    expect(overlapConfigSchema.safeParse({ ...line, view: "nest", minPrefix: 8, maxPrefix: 28 }).success).toBe(false);
    expect(overlapConfigSchema.safeParse({ ...line, window: "172.16.0.0/14x" }).success).toBe(false);
  });
});

// ================================================================ v6

describe("reading IPv6 text", () => {
  it("expands 2001:db8:4a1:20::5c into eight groups, with :: standing for three zero groups", () => {
    const p = parseIpv6("2001:db8:4a1:20::5c");
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(p.written).toEqual(["2001", "db8", "4a1", "20", "5c"]);
    expect(p.compressedCount).toBe(3);
    expect(p.compressedAt).toBe(4);
    expect(expandV6(p.groups)).toBe("2001:0db8:04a1:0020:0000:0000:0000:005c");
  });

  it("expands fe80:: and the phone's link-local address", () => {
    const phone = parseIpv6("fe80::1c2b:3aff:fe4d:5e6f");
    expect(phone.ok && phone.compressedCount).toBe(3);
    expect(phone.ok && expandV6(phone.groups)).toBe("fe80:0000:0000:0000:1c2b:3aff:fe4d:5e6f");
    const bare = parseIpv6("fe80::");
    expect(bare.ok && bare.compressedCount).toBe(7);
    expect(bare.ok && expandV6(bare.groups)).toBe("fe80:0000:0000:0000:0000:0000:0000:0000");
    expect(parseIpv6("::").ok && (parseIpv6("::") as { compressedCount: number }).compressedCount).toBe(8);
    expect(parseIpv6("::1").ok && expandV6((parseIpv6("::1") as { groups: number[] }).groups)).toBe("0000:0000:0000:0000:0000:0000:0000:0001");
  });

  it("counts 128 bits: eight groups of sixteen", () => {
    const p = parseIpv6("2001:db8::1");
    expect(p.ok && p.groups.length).toBe(8);
    expect(p.ok && p.groups.length * 16).toBe(128);
  });

  it("refuses two :: with the rule", () => {
    const p = parseIpv6("2001:db8::1::5c");
    expect(p).toMatchObject({ ok: false, error: { kind: "double-compress" } });
    expect(!p.ok && p.error.message).toContain("Two ::");
  });

  it("refuses each other broken form with its own words", () => {
    const kind = (text: string) => {
      const p = parseIpv6(text);
      return p.ok ? "ok" : p.error.kind;
    };
    expect(kind("2001:db8:0:0:0:0:5c")).toBe("count");
    expect(kind("2001:db8:0:0:0:0:0:1:5c")).toBe("too-many");
    expect(kind("1:2:3:4:5:6:7::8")).toBe("too-many");
    expect(kind("2001:db8::12345")).toBe("group-length");
    expect(kind("2001:db8:g::1")).toBe("chars");
    expect(kind("2001:db8:: 1")).toBe("chars");
    expect(kind("2001:db8:::1")).toBe("colon");
    expect(kind(":2001:db8::1")).toBe("colon");
    expect(kind("2001:db8::1:")).toBe("colon");
    expect(kind("2001:db8:0:0:0:0:0:")).toBe("colon");
    expect(kind("::ffff:192.0.2.1")).toBe("unsupported");
    expect(kind("")).toBe("colon");
    expect(kind("1:2:3:4:5:6:7::")).toBe("ok");
    expect(kind("::2:3:4:5:6:7:8")).toBe("ok");
  });

  it("agrees with the platform's own parser on 5000 random strings", () => {
    const rand = seededRandom(31);
    const alphabet = "0123456789abcdefABCDEF::::";
    let valid = 0;
    for (let i = 0; i < 5000; i += 1) {
      const len = 1 + Math.floor(rand() * 41);
      let text = "";
      for (let k = 0; k < len; k += 1) text += alphabet[Math.floor(rand() * alphabet.length)];
      const ours = parseIpv6(text).ok;
      expect(ours, text).toBe(isIPv6(text));
      if (ours) valid += 1;
    }
    // Also structured strings, which random text rarely reaches.
    for (let i = 0; i < 3000; i += 1) {
      const groups = Array.from({ length: 8 }, () => (rand() < 0.4 ? "0" : Math.floor(rand() * 65536).toString(16)));
      const start = Math.floor(rand() * 8);
      const len = Math.floor(rand() * (9 - start));
      let text = [...groups.slice(0, start), "", ...groups.slice(start + len)].join(":");
      if (rand() < 0.2) text += ":x";
      if (rand() < 0.1) text = text.replace(/:/, "::");
      expect(parseIpv6(text).ok, text).toBe(isIPv6(text));
      if (parseIpv6(text).ok) valid += 1;
    }
    expect(valid).toBeGreaterThan(500);
  });
});

describe("the standard short form (RFC 5952)", () => {
  const short = (full: string) => {
    const p = parseIpv6(full);
    if (!p.ok) throw new Error(full);
    return shortenV6(p.groups);
  };

  it("shortens the examples of the chapter", () => {
    expect(short("2001:0db8:0000:0000:0001:0000:0000:0001")).toBe("2001:db8::1:0:0:1");
    expect(short("fe80:0000:0000:0000:1c2b:3aff:fe4d:5e6f")).toBe("fe80::1c2b:3aff:fe4d:5e6f");
    expect(short("2001:0db8:04a1:0020:0000:0000:0000:005c")).toBe("2001:db8:4a1:20::5c");
    expect(short("fe80:0000:0000:0000:0000:0000:0000:0000")).toBe("fe80::");
    expect(short("0000:0000:0000:0000:0000:0000:0000:0001")).toBe("::1");
    expect(short("0000:0000:0000:0000:0000:0000:0000:0000")).toBe("::");
  });

  it("compresses the longest run, the first when two tie, and leaves a single zero as 0", () => {
    expect(short("2001:0db8:0000:0001:0000:0000:0000:0001")).toBe("2001:db8:0:1::1");
    expect(short("2001:0db8:0000:0000:0001:0000:0000:0001")).toBe("2001:db8::1:0:0:1");
    expect(short("2001:0db8:0000:0001:0001:0001:0001:0001")).toBe("2001:db8:0:1:1:1:1:1");
    expect(short("2001:0db8:0001:0001:0001:0001:0001:0000")).toBe("2001:db8:1:1:1:1:1:0");
    expect(short("2001:0db8:0000:0001:0000:0001:0000:0001")).toBe("2001:db8:0:1:0:1:0:1");
  });

  it("writes lowercase hex without leading zeros", () => {
    expect(short("2001:0DB8:00AB:0000:0000:0000:0000:ABCD")).toBe("2001:db8:ab::abcd");
    expect(short("ABCD:EF01:2345:6789:ABCD:EF01:2345:6789")).toBe("abcd:ef01:2345:6789:abcd:ef01:2345:6789");
  });

  it("finds the standard run and every run", () => {
    expect(zeroRuns([1, 0, 0, 2, 0, 3, 0, 0])).toEqual([{ start: 1, length: 2 }, { start: 4, length: 1 }, { start: 6, length: 2 }]);
    expect(standardRun([1, 0, 0, 2, 0, 3, 0, 0])).toEqual({ start: 1, length: 2 });
    expect(standardRun([1, 0, 2, 0, 3, 0, 4, 5])).toBeNull();
    expect(standardRun([0, 0, 0, 1, 0, 0, 0, 1])).toEqual({ start: 0, length: 3 });
  });

  it("matches the URL standard's serialiser on 4000 random addresses, and round trips", () => {
    const rand = seededRandom(5);
    for (let i = 0; i < 4000; i += 1) {
      const groups = Array.from({ length: 8 }, () => (rand() < 0.45 ? 0 : rand() < 0.5 ? Math.floor(rand() * 16) : Math.floor(rand() * 65536)));
      const ours = shortenV6(groups);
      const oracle = new URL(`http://[${expandV6(groups)}]/`).hostname.slice(1, -1);
      expect(ours, expandV6(groups)).toBe(oracle);
      const back = parseIpv6(ours);
      expect(back.ok && back.groups).toEqual(groups);
      const again = back.ok ? shortenV6(back.groups) : "";
      expect(again).toBe(ours);
      expect(judgeV6(ours).status).toBe("standard");
      expect(judgeV6(expandV6(groups)).status).toBe(zeroRuns(groups).length === 0 && groups.every((g) => g >= 0x1000) ? "standard" : "nonstandard");
    }
  });
});

describe("invalid is not the same as non-standard", () => {
  it("refuses 2001:db8::1::5c as invalid", () => {
    expect(judgeV6("2001:db8::1::5c")).toMatchObject({ status: "invalid", error: { kind: "double-compress" } });
  });

  it("calls 2001:0DB8:0:0:0:0:0:5C valid but not standard, and says why", () => {
    const j = judgeV6("2001:0DB8:0:0:0:0:0:5C");
    expect(j.status).toBe("nonstandard");
    if (j.status === "invalid") return;
    expect(j.standard).toBe("2001:db8::5c");
    expect(j.expanded).toBe("2001:0db8:0000:0000:0000:0000:0000:005c");
    expect(j.reasons).toEqual(["Use lowercase letters: a to f.", "Drop the leading zeros in each group.", "Compress the longest run of zero groups with ::."]);
  });

  it("calls 2001:db8:0:0:0::5c valid but not standard because :: does not cover the whole run", () => {
    const j = judgeV6("2001:db8:0:0:0::5c");
    expect(j.status).toBe("nonstandard");
    expect(j.status !== "invalid" && j.reasons).toEqual(["The :: must cover the whole longest run of zero groups."]);
    expect(j.status !== "invalid" && j.standard).toBe("2001:db8::5c");
  });

  it("never lets :: stand for a single zero group, and still accepts it as valid", () => {
    const j = judgeV6("2001:db8::1:1:1:1:1");
    expect(j.status).toBe("nonstandard");
    expect(j.status !== "invalid" && j.zeroGroups).toBe(1);
    expect(j.status !== "invalid" && j.reasons).toEqual([":: must not stand for a single zero group: write 0."]);
    expect(j.status !== "invalid" && j.standard).toBe("2001:db8:0:1:1:1:1:1");
    expect(judgeV6("2001:db8:0:1:1:1:1:1").status).toBe("standard");
  });

  it("asks for the first run when two are equally long", () => {
    const j = judgeV6("2001:db8:0:0:1::1");
    expect(j.status).toBe("nonstandard");
    expect(j.status !== "invalid" && j.standard).toBe("2001:db8::1:0:0:1");
    const later = judgeV6("2001:db8:0:0:1:0:0:1");
    expect(later.status).toBe("nonstandard");
    expect(judgeV6("2001:db8::1:0:0:1").status).toBe("standard");
    const tie = judgeV6("2001:db8:0:0:1::1");
    expect(tie.status !== "invalid" && tie.reasons).toContain("Two runs are equally long: compress the first one.");
  });

  it("agrees with the shortener: a form is standard exactly when it equals the short form", () => {
    const rand = seededRandom(77);
    let nonstandard = 0;
    for (let i = 0; i < 3000; i += 1) {
      const groups = Array.from({ length: 8 }, () => (rand() < 0.5 ? 0 : Math.floor(rand() * 65536)));
      const std = shortenV6(groups);
      const runs = zeroRuns(groups);
      const variants = [std, std.toUpperCase(), expandV6(groups), groups.map((g) => g.toString(16)).join(":")];
      for (const r of runs) {
        const left = groups.slice(0, r.start).map((g) => g.toString(16)).join(":");
        const right = groups.slice(r.start + r.length).map((g) => g.toString(16)).join(":");
        variants.push(`${left}::${right}`);
        if (r.length > 1) variants.push(`${groups.slice(0, r.start + 1).map((g) => g.toString(16)).join(":")}::${right}`);
      }
      for (const text of variants) {
        const j = judgeV6(text);
        expect(j.status === "invalid", text).toBe(false);
        if (j.status === "invalid") continue;
        expect(j.status === "standard", `${text} vs ${std}`).toBe(text === std);
        expect(j.reasons.length === 0, text).toBe(j.status === "standard");
        expect(j.standard).toBe(std);
        if (j.status === "nonstandard") nonstandard += 1;
      }
    }
    expect(nonstandard).toBeGreaterThan(1000);
  });
});

describe("IPv6 parameters", () => {
  const expand = { mode: "v6" as const, view: "expand" as const, addresses: ["2001:db8:4a1:20::5c", "fe80::"] };

  it("accept the four views and survive a JSON round trip", () => {
    const configs = [
      expand,
      { mode: "v6" as const, view: "shorten" as const, addresses: ["2001:0db8:0000:0000:0001:0000:0000:0001"] },
      { mode: "v6" as const, view: "invalid" as const, addresses: ["2001:db8::1::5c", "2001:0DB8:0:0:0:0:0:5C"] },
      { mode: "v6" as const, view: "drill" as const },
    ];
    for (const c of configs) {
      expect(v6ConfigSchema.safeParse(c).success, c.view).toBe(true);
      expect(subnetModeSchema.parse(JSON.parse(JSON.stringify(c)))).toEqual(c);
    }
  });

  it("reject missing addresses and addresses that cannot be expanded", () => {
    expect(v6ConfigSchema.safeParse({ mode: "v6", view: "expand" }).success).toBe(false);
    expect(v6ConfigSchema.safeParse({ ...expand, addresses: ["2001:db8::1::5c"] }).success).toBe(false);
    expect(v6ConfigSchema.safeParse({ ...expand, addresses: [] }).success).toBe(false);
    expect(v6ConfigSchema.safeParse({ mode: "v6", view: "shorten", addresses: ["not an address"] }).success).toBe(false);
    expect(anyAddrConfigSchema.safeParse({ mode: "nope" }).success).toBe(false);
  });
});

describe("the IPv6 drill", () => {
  it("asks the same five questions for the same set number", () => {
    for (const set of [1, 2, 5, 99]) expect(generateV6Drill(set)).toEqual(generateV6Drill(set));
    expect(generateV6Drill(1)).not.toEqual(generateV6Drill(2));
  });

  it("asks two short-form, one full-form and two form questions, with one right option each", () => {
    for (let set = 1; set <= 150; set += 1) {
      const items = generateV6Drill(set);
      expect(items.map((i) => i.kind).sort()).toEqual(["expand", "form", "form", "shorten", "shorten"]);
      for (const item of items) {
        const label = `set ${set}: ${item.prompt} ${item.subject}`;
        expect(new Set(item.options).size, label).toBe(item.options.length);
        expect(item.explain).not.toMatch(/NaN|undefined/);
        const right = item.options[item.answer];
        if (item.kind === "shorten") {
          const p = parseIpv6(item.subject);
          expect(p.ok, label).toBe(true);
          if (p.ok) expect(right, label).toBe(shortenV6(p.groups));
          expect(item.options, label).toHaveLength(3);
          for (const [k, o] of item.options.entries()) if (k !== item.answer) expect(judgeV6(o).status === "standard", `${label} ${o}`).toBe(false);
        } else if (item.kind === "expand") {
          const p = parseIpv6(item.subject);
          expect(p.ok, label).toBe(true);
          if (p.ok) expect(right, label).toBe(expandV6(p.groups));
          expect(item.options, label).toHaveLength(3);
          expect(item.explain).toMatch(/:: stands for \d+ zero groups/);
        } else {
          expect(item.options).toEqual(["Standard", "Valid, not standard", "Invalid"]);
          const j = judgeV6(item.subject);
          expect(item.answer, label).toBe(j.status === "invalid" ? 2 : j.status === "standard" ? 0 : 1);
        }
      }
    }
  });

  it("covers all three kinds of form across the sets", () => {
    const seen = new Set<number>();
    for (let set = 1; set <= 60; set += 1) for (const item of generateV6Drill(set)) if (item.kind === "form") seen.add(item.answer);
    expect([...seen].sort()).toEqual([0, 1, 2]);
  });

  it("uses documentation and link-local style addresses", () => {
    let docs = 0;
    for (let set = 1; set <= 40; set += 1) for (const item of generateV6Drill(set)) if (/^2001:(0db8|db8)/i.test(item.subject)) docs += 1;
    expect(docs).toBeGreaterThan(10);
  });
});
