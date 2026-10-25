import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ADDRESS_MAX,
  BYTE_PLACES,
  DEFAULT_ADDRESS,
  DEFAULT_BYTE_BITS,
  DRILL_SIZE,
  bitsToByte,
  bitsToNumber,
  byteToBits,
  carrySteps,
  checkAnswer,
  explainQuestion,
  flipAddressBit,
  formatAddressNumber,
  generateDrill,
  groupedBits,
  incrementByte,
  ipToNumber,
  numberToBits,
  numberToIp,
  numberToParts,
  parseIpv4,
  placesOn,
  scoreText,
  seedForSet,
  seededRandom,
  setHasEdge,
  sumEquation,
  sumText,
  toggleBit,
  type Bits,
  type DrillQuestion,
} from "@buildment/learning-ui/canvas/models/net-address";
import { netM2AddressBits } from "@buildment/learning-ui/canvas/net-m2-address-bits/data";
import { netM2AddressDrill } from "@buildment/learning-ui/canvas/net-m2-address-drill/data";
import { netM2ByteBits } from "@buildment/learning-ui/canvas/net-m2-byte-bits/data";

const bits = (s: string) => [...s].map(Number) as unknown as Bits;
const errorOf = (text: string) => {
  const r = parseIpv4(text);
  return r.ok ? null : r.error;
};

describe("byte bits", () => {
  it("has place values 128 down to 1", () => {
    expect([...BYTE_PLACES]).toEqual([128, 64, 32, 16, 8, 4, 2, 1]);
  });

  it("reads the default 00010111 as 23, the last part of 192.168.1.23", () => {
    expect(bitsToByte(DEFAULT_BYTE_BITS)).toBe(23);
    expect(placesOn(DEFAULT_BYTE_BITS)).toEqual([16, 4, 2, 1]);
    expect(sumText(DEFAULT_BYTE_BITS)).toBe("16 + 4 + 2 + 1");
    expect(sumEquation(DEFAULT_BYTE_BITS)).toBe("16 + 4 + 2 + 1 = 23");
  });

  it("handles all off and all on", () => {
    expect(bitsToByte(bits("00000000"))).toBe(0);
    expect(sumText(bits("00000000"))).toBe("0");
    expect(placesOn(bits("00000000"))).toEqual([]);
    expect(bitsToByte(bits("11111111"))).toBe(255);
    expect(sumText(bits("11111111"))).toBe("128 + 64 + 32 + 16 + 8 + 4 + 2 + 1");
  });

  it("round trips every byte value", () => {
    for (let v = 0; v <= 255; v += 1) {
      const b = byteToBits(v);
      expect(b).toHaveLength(8);
      expect(bitsToByte(b)).toBe(v);
    }
  });

  it("clamps out-of-range and invalid values instead of returning NaN", () => {
    expect(bitsToByte(byteToBits(256))).toBe(255);
    expect(bitsToByte(byteToBits(-4))).toBe(0);
    expect(bitsToByte(byteToBits(Number.NaN))).toBe(0);
    expect(bitsToByte(byteToBits(Number.POSITIVE_INFINITY))).toBe(0);
  });

  it("toggles one bit without changing the original", () => {
    const start = bits("00010111");
    expect(bitsToByte(toggleBit(start, 0))).toBe(23 + 128);
    expect(bitsToByte(toggleBit(start, 7))).toBe(22);
    expect(bitsToByte(start)).toBe(23);
    expect(toggleBit(start, 8)).toBe(start);
    expect(toggleBit(start, -1)).toBe(start);
  });
});

describe("byte increment and overflow", () => {
  it("carries to the next bit", () => {
    const r = incrementByte(bits("00010111"));
    expect(r.value).toBe(24);
    expect(r.bits.join("")).toBe("00011000");
    expect(r.overflow).toBe(false);
  });

  it("adds one to zero and to 254", () => {
    expect(incrementByte(bits("00000000")).value).toBe(1);
    const r = incrementByte(bits("11111110"));
    expect(r.value).toBe(255);
    expect(r.overflow).toBe(false);
  });

  it("overflows at 255: every bit becomes 0 and the flag is set", () => {
    const r = incrementByte(bits("11111111"));
    expect(r.value).toBe(0);
    expect(r.bits.join("")).toBe("00000000");
    expect(r.overflow).toBe(true);
  });

  it("plays the carry one bit per step, right to left, ending where incrementByte ends", () => {
    for (let v = 0; v <= 255; v += 1) {
      const start = byteToBits(v);
      const { steps, overflow, result } = carrySteps(start);
      let state: Bits = start;
      let lastIndex = 8;
      for (const s of steps) {
        expect(s.index).toBeLessThan(lastIndex);
        lastIndex = s.index;
        state = state.map((b, i) => (i === s.index ? s.bit : b)) as unknown as Bits;
      }
      expect(state.join("")).toBe(result.join(""));
      expect(overflow).toBe(incrementByte(start).overflow);
    }
    expect(carrySteps(bits("11111111")).steps).toHaveLength(8);
    expect(carrySteps(bits("00000000")).steps).toEqual([{ index: 7, bit: 1 }]);
  });
});

describe("parse rules", () => {
  it("accepts a normal address and the zero part", () => {
    const r = parseIpv4("192.168.1.23");
    expect(r).toEqual({ ok: true, parts: [192, 168, 1, 23], number: 3232235799 });
    expect(parseIpv4("10.0.0.0").ok).toBe(true);
    expect(parseIpv4("0.0.0.0")).toEqual({ ok: true, parts: [0, 0, 0, 0], number: 0 });
  });

  it("needs exactly four parts", () => {
    for (const text of ["", "1", "1.2.3", "1.2.3.4.5", "1.2.3.4.", ".1.2.3.4"]) {
      expect(errorOf(text)?.message, text).toBe("An address has four parts");
      expect(errorOf(text)?.kind, text).toBe("parts");
    }
  });

  it("rejects a part above 255 in plain words", () => {
    expect(errorOf("256.1.1.1")).toEqual({ kind: "range", message: "256 is more than one byte can hold" });
    expect(errorOf("1.1.1.999")?.message).toBe("999 is more than one byte can hold");
    expect(parseIpv4("255.255.255.255").ok).toBe(true);
  });

  it("rejects leading zeros except the part 0", () => {
    expect(errorOf("01.2.3.4")).toEqual({ kind: "leading-zero", message: "Leading zeros are not used in this course" });
    expect(errorOf("1.2.3.00")?.kind).toBe("leading-zero");
    expect(errorOf("1.2.3.007")?.kind).toBe("leading-zero");
    expect(parseIpv4("0.0.0.0").ok).toBe(true);
  });

  it("rejects anything that is not digits", () => {
    for (const text of ["a.b.c.d", "1.2.3.-4", "1.2.3.4 ", " 1.2.3.4", "1.2.3.+4", "1..2.3", "1.2.3.4e1", "1.2.3.0x1", "1.2. 3.4", "١.2.3.4"]) {
      const e = errorOf(text);
      expect(e?.kind, text).toBe("digits");
      expect(e?.message).toBe("Each part is digits only");
    }
  });

  it("checks the part count before the parts", () => {
    expect(errorOf("999.1.1")?.kind).toBe("parts");
  });
});

describe("ipToNumber and numberToIp", () => {
  it("converts the default address", () => {
    expect(ipToNumber(DEFAULT_ADDRESS)).toBe(3232235799);
    expect(numberToIp(3232235799)).toBe(DEFAULT_ADDRESS);
    expect(ipToNumber([192, 168, 1, 23])).toBe(3232235799);
  });

  it("handles 0, 2^31 and 2^32 - 1 as unsigned, never negative", () => {
    expect(ipToNumber("0.0.0.0")).toBe(0);
    expect(ipToNumber("128.0.0.0")).toBe(2 ** 31);
    expect(ipToNumber("128.0.0.0")).toBe(2147483648);
    expect(ipToNumber("255.255.255.255")).toBe(2 ** 32 - 1);
    expect(ipToNumber("255.255.255.255")).toBe(4294967295);
    expect(numberToIp(0)).toBe("0.0.0.0");
    expect(numberToIp(2 ** 31)).toBe("128.0.0.0");
    expect(numberToIp(2 ** 32 - 1)).toBe("255.255.255.255");
    expect(ADDRESS_MAX).toBe(2 ** 32 - 1);
  });

  it("round trips boundary and sampled addresses both ways", () => {
    const samples = [0, 1, 255, 256, 65535, 65536, 2 ** 24 - 1, 2 ** 24, 2 ** 31 - 1, 2 ** 31, 2 ** 31 + 1, 2 ** 32 - 2, 2 ** 32 - 1];
    const rand = seededRandom(7);
    for (let i = 0; i < 500; i += 1) samples.push(Math.floor(rand() * 2 ** 32));
    for (const n of samples) {
      const ip = numberToIp(n);
      expect(ipToNumber(ip), ip).toBe(n);
      expect(bitsToNumber(numberToBits(n))).toBe(n);
      expect(numberToParts(n).join(".")).toBe(ip);
    }
  });

  it("throws on invalid input instead of returning NaN", () => {
    expect(() => ipToNumber("256.0.0.1")).toThrow("256 is more than one byte can hold");
    expect(() => ipToNumber("1.2.3")).toThrow("An address has four parts");
    expect(() => ipToNumber([1, 2, 3])).toThrow(RangeError);
    expect(() => ipToNumber([1, 2, 3, 256])).toThrow(RangeError);
    expect(() => numberToIp(-1)).toThrow(RangeError);
    expect(() => numberToIp(2 ** 32)).toThrow(RangeError);
    expect(() => numberToIp(1.5)).toThrow(RangeError);
    expect(() => numberToIp(Number.NaN)).toThrow(RangeError);
  });

  it("lays 32 bits out as four bytes, top bit first", () => {
    const all = numberToBits(ipToNumber(DEFAULT_ADDRESS));
    expect(all).toHaveLength(32);
    expect(all.join("")).toBe("11000000" + "10101000" + "00000001" + "00010111");
    expect(() => bitsToNumber(bits("0101"))).toThrow(RangeError);
  });

  it("flips one address bit and stays unsigned", () => {
    const n = ipToNumber(DEFAULT_ADDRESS);
    expect(numberToIp(flipAddressBit(n, 31))).toBe("192.168.1.22");
    expect(numberToIp(flipAddressBit(0, 0))).toBe("128.0.0.0");
    expect(flipAddressBit(0, 0)).toBe(2147483648);
    expect(flipAddressBit(2 ** 32 - 1, 0)).toBe(2 ** 31 - 1);
    expect(flipAddressBit(flipAddressBit(n, 12), 12)).toBe(n);
    expect(flipAddressBit(n, 32)).toBe(n);
    expect(flipAddressBit(n, -1)).toBe(n);
  });

  it("formats numbers with thousands separators", () => {
    expect(formatAddressNumber(3232235799)).toBe("3,232,235,799");
    expect(formatAddressNumber(0)).toBe("0");
    expect(formatAddressNumber(999)).toBe("999");
    expect(formatAddressNumber(1000)).toBe("1,000");
    expect(formatAddressNumber(4294967295)).toBe("4,294,967,295");
    expect(formatAddressNumber(2147483648)).toBe("2,147,483,648");
  });
});

describe("drill generator", () => {
  const sets = Array.from({ length: 60 }, (_, i) => i + 1);

  it("is deterministic for a given set number and differs between sets", () => {
    for (const s of sets) expect(generateDrill(s)).toEqual(generateDrill(s));
    expect(JSON.stringify(generateDrill(1))).not.toBe(JSON.stringify(generateDrill(2)));
    expect(seedForSet(3)).toBe(seedForSet(3));
    expect(seedForSet(3)).not.toBe(seedForSet(4));
    const a = seededRandom(5);
    const b = seededRandom(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("asks five questions: two byte to bits, two bits to byte, one real or not", () => {
    for (const s of sets) {
      const qs = generateDrill(s);
      expect(qs).toHaveLength(DRILL_SIZE);
      const count = (k: DrillQuestion["kind"]) => qs.filter((q) => q.kind === k).length;
      expect(count("byte-to-bits")).toBe(2);
      expect(count("bits-to-byte")).toBe(2);
      expect(count("real-or-not")).toBe(1);
    }
  });

  it("never repeats a question inside a set", () => {
    for (const s of sets) {
      const keys = generateDrill(s).map((q) => (q.kind === "real-or-not" ? q.text : `${q.value}`));
      expect(new Set(keys).size, `set ${s}`).toBe(keys.length);
    }
  });

  it("puts 0 or 255 in at least one of every three sets", () => {
    const hasEdge = (s: number) => generateDrill(s).some((q) => q.kind !== "real-or-not" && (q.value === 0 || q.value === 255));
    for (let s = 1; s <= 60; s += 1) {
      expect(setHasEdge(s) ? hasEdge(s) : true, `set ${s}`).toBe(true);
      expect([s, s + 1, s + 2].some(hasEdge), `sets ${s}..${s + 2}`).toBe(true);
    }
    expect(new Set(sets.filter(setHasEdge).flatMap((s) => generateDrill(s).flatMap((q) => (q.kind !== "real-or-not" && (q.value === 0 || q.value === 255) ? [q.value] : [])))).size).toBe(2);
  });

  it("builds three different bits-to-byte options with the answer among them", () => {
    for (const s of sets) {
      for (const q of generateDrill(s)) {
        if (q.kind !== "bits-to-byte") continue;
        expect(bitsToByte(q.bits)).toBe(q.value);
        expect(new Set(q.options).size).toBe(3);
        expect(q.options).toContain(q.value);
        for (const o of q.options) {
          expect(o).toBeGreaterThanOrEqual(0);
          expect(o).toBeLessThanOrEqual(255);
        }
      }
    }
  });

  it("keeps distractors the same length as the answer where it can", () => {
    let same = 0;
    let total = 0;
    for (const s of sets) {
      for (const q of generateDrill(s)) {
        if (q.kind !== "bits-to-byte") continue;
        for (const o of q.options) {
          total += 1;
          if (String(o).length === String(q.value).length) same += 1;
        }
      }
    }
    expect(same / total).toBeGreaterThan(0.8);
  });

  it("includes the misread and the reversed reading as distractors when they exist", () => {
    // Across many sets the reversed value shows up whenever it has the same digits as the answer.
    let seen = 0;
    for (const s of Array.from({ length: 200 }, (_, i) => i + 1)) {
      for (const d of generateDrill(s)) {
        if (d.kind !== "bits-to-byte") continue;
        const rev = bitsToByte([...d.bits].reverse() as Bits);
        if (rev !== d.value && String(rev).length === String(d.value).length && d.options.includes(rev)) seen += 1;
      }
    }
    expect(seen).toBeGreaterThan(0);
  });

  it("makes real-or-not strings that match their label, using the same parse rules", () => {
    let real = 0;
    let fake = 0;
    for (const s of Array.from({ length: 100 }, (_, i) => i + 1)) {
      for (const q of generateDrill(s)) {
        if (q.kind !== "real-or-not") continue;
        const parsed = parseIpv4(q.text);
        expect(parsed.ok, q.text).toBe(q.real);
        if (!parsed.ok) expect(parsed.error.kind).toBe("range");
        if (q.real) real += 1;
        else fake += 1;
      }
    }
    expect(real).toBeGreaterThan(20);
    expect(fake).toBeGreaterThan(20);
  });
});

describe("answer checking and feedback", () => {
  const byteQ: DrillQuestion = { kind: "byte-to-bits", value: 150 };
  const pickQ: DrillQuestion = { kind: "bits-to-byte", bits: bits("10010110"), value: 150, options: [105, 150, 22] };
  const realQ: DrillQuestion = { kind: "real-or-not", text: "192.168.256.1", real: false };

  it("checks tapped bits for byte to bits", () => {
    expect(checkAnswer(byteQ, bits("10010110"))).toBe(true);
    expect(checkAnswer(byteQ, bits("10010111"))).toBe(false);
    expect(checkAnswer(byteQ, bits("00000000"))).toBe(false);
    expect(checkAnswer({ kind: "byte-to-bits", value: 0 }, bits("00000000"))).toBe(true);
    expect(checkAnswer({ kind: "byte-to-bits", value: 255 }, bits("11111111"))).toBe(true);
    expect(checkAnswer(byteQ, bits("1001011"))).toBe(false);
  });

  it("checks the picked number for bits to byte", () => {
    expect(checkAnswer(pickQ, 150)).toBe(true);
    expect(checkAnswer(pickQ, 105)).toBe(false);
    expect(checkAnswer(pickQ, true)).toBe(false);
  });

  it("checks real or not", () => {
    expect(checkAnswer(realQ, false)).toBe(true);
    expect(checkAnswer(realQ, true)).toBe(false);
    expect(checkAnswer({ kind: "real-or-not", text: "10.0.0.1", real: true }, true)).toBe(true);
    expect(checkAnswer(realQ, 150)).toBe(false);
  });

  it("accepts the right answer for every generated question and rejects a wrong one", () => {
    for (const s of Array.from({ length: 40 }, (_, i) => i + 1)) {
      for (const q of generateDrill(s)) {
        if (q.kind === "byte-to-bits") {
          expect(checkAnswer(q, byteToBits(q.value))).toBe(true);
          expect(checkAnswer(q, toggleBit(byteToBits(q.value), 3))).toBe(false);
        } else if (q.kind === "bits-to-byte") {
          expect(checkAnswer(q, q.value)).toBe(true);
          for (const o of q.options) if (o !== q.value) expect(checkAnswer(q, o)).toBe(false);
        } else {
          expect(checkAnswer(q, q.real)).toBe(true);
          expect(checkAnswer(q, !q.real)).toBe(false);
        }
      }
    }
  });

  it("explains in words, with place values summed", () => {
    expect(explainQuestion({ kind: "byte-to-bits", value: 23 })).toBe("16 + 4 + 2 + 1 = 23");
    expect(explainQuestion(pickQ)).toBe("128 + 16 + 4 + 2 = 150");
    expect(explainQuestion({ kind: "byte-to-bits", value: 0 })).toBe("0 = 0");
    expect(explainQuestion({ kind: "byte-to-bits", value: 255 })).toBe("128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255");
    expect(explainQuestion(realQ)).toBe("256 is more than one byte can hold, so it cannot exist");
    expect(explainQuestion({ kind: "real-or-not", text: "10.0.0.1", real: true })).toBe("Four parts, each 0 to 255, so it can exist");
  });

  it("formats the score and grouped bits", () => {
    expect(scoreText(4)).toBe("4 of 5 by hand");
    expect(scoreText(0)).toBe("0 of 5 by hand");
    expect(groupedBits(bits("10010110"))).toBe("1001 0110");
  });
});

describe("the three canvases", () => {
  it("never write an em dash in the words learners read", () => {
    for (const spec of [netM2ByteBits, netM2AddressBits, netM2AddressDrill]) {
      expect(`${spec.title} ${spec.purpose} ${spec.limits}`).not.toMatch(/\u2014/);
      expect(spec.limits.length).toBeGreaterThan(20);
    }
  });

  it("render the starting state on the server with the verdict and a fold", () => {
    const props = (s: { title: string; purpose: string; limits: string }) => ({ title: s.title, purpose: s.purpose, limits: s.limits });
    const byte = renderToString(createElement(netM2ByteBits.component, props(netM2ByteBits)));
    expect(byte).toContain("23 in one byte");
    expect(byte).toContain("Bit worth 16, on");
    expect(byte).toContain("Add 1");
    const address = renderToString(createElement(netM2AddressBits.component, props(netM2AddressBits)));
    expect(address).toContain("192.168.1.23 is the number 3,232,235,799");
    expect(address).toContain("What this picture leaves out");
    const drill = renderToString(createElement(netM2AddressDrill.component, props(netM2AddressDrill)));
    expect(drill).toContain("Question 1 of 5");
    for (const html of [byte, address, drill]) {
      expect(html).toContain("<svg");
      expect(html).not.toMatch(/="NaN"|>NaN</);
      expect(html).not.toMatch(/\u2014/);
      expect(html).not.toMatch(/dangerouslySetInnerHTML|<foreignObject|<script/);
    }
  });
});
