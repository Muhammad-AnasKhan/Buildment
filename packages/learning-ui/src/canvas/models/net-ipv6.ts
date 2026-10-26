// The IPv6 text model behind the `v6` mode of the address renderer: parse,
// expand, shorten to the standard form (RFC 5952, [S4]), tell an invalid
// form from a valid but non-standard one, and a generated drill. Pure: no
// React, no clock, no unseeded randomness. It is also the reference for the
// IPv6 exercise in module 9, so the canvas and the graded tests cannot
// disagree.
//
// Rules in one place:
//   - An address is eight groups of sixteen bits, written in hex.
//   - `::` stands for one run of zero groups, at least one group, and may
//     appear once. Without it all eight groups are written.
//   - Standard form (RFC 5952): no leading zeros in a group, lowercase hex,
//     the longest run of two or more zero groups becomes `::` (the first
//     one when two are equally long), and a single zero group stays `0`.
//   - Dotted IPv4 endings such as `::ffff:192.0.2.1` are real but not covered.

import { z } from "zod";
import { between, drillRandom, shuffleWith, withOptions, type DrillItem } from "./net-drill";

export const V6_GROUPS = 8;
export const V6_GROUP_BITS = 16;

export type V6ErrorKind = "chars" | "unsupported" | "colon" | "double-compress" | "group-length" | "count" | "too-many";
export type V6ParseError = { kind: V6ErrorKind; message: string };

export type V6Parse =
  | {
      ok: true;
      /** The eight groups as numbers, 0 to 65535. */
      groups: number[];
      /** The groups as written, without the zero groups `::` stands for. */
      written: string[];
      /** Index of the first group `::` stands for, or null when there is no `::`. */
      compressedAt: number | null;
      /** How many zero groups `::` stands for (0 when there is none). */
      compressedCount: number;
    }
  | { ok: false; error: V6ParseError };

const fail = (kind: V6ErrorKind, message: string): V6Parse => ({ ok: false, error: { kind, message } });

/** Parse an IPv6 address in text. Strict: hex digits and colons only, one `::` at most, groups of one to four digits. */
export function parseIpv6(text: string): V6Parse {
  if (text.includes(".")) return fail("unsupported", "A dotted IPv4 ending is real, but this course writes all eight groups in hex");
  const bad = /[^0-9a-fA-F:]/.exec(text);
  if (bad) {
    const shown = bad[0] === " " ? "A space" : `"${bad[0]}"`;
    return fail("chars", `${shown} is not allowed: an address uses 0 to 9, a to f and colons`);
  }
  if (text.includes(":::")) return fail("colon", "Three colons in a row: a gap is written with exactly two");
  const gaps = text.split("::").length - 1;
  if (gaps > 1) return fail("double-compress", "Two :: in one address: the reader could not tell how many zero groups each one stands for");

  const checkGroups = (groups: string[]): V6Parse | null => {
    if (groups.some((g) => g === "")) return fail("colon", "A single colon at the start or end, or two with nothing between: write :: or a group");
    const long = groups.find((g) => g.length > 4);
    if (long) return fail("group-length", `"${long}" has ${long.length} digits: a group has at most four`);
    return null;
  };

  if (gaps === 0) {
    const groups = text.split(":");
    const problem = checkGroups(groups);
    if (problem) return problem;
    if (groups.length < V6_GROUPS) return fail("count", `Found ${groups.length} groups: without :: an address needs all eight`);
    if (groups.length > V6_GROUPS) return fail("too-many", `Found ${groups.length} groups: an address has eight`);
    return { ok: true, groups: groups.map((g) => parseInt(g, 16)), written: groups, compressedAt: null, compressedCount: 0 };
  }

  const [left, right] = text.split("::");
  const l = left === "" ? [] : left.split(":");
  const r = right === "" ? [] : right.split(":");
  const problem = checkGroups([...l, ...r]);
  if (problem) return problem;
  const writtenCount = l.length + r.length;
  if (writtenCount > V6_GROUPS - 1) return fail("too-many", `:: stands for at least one zero group, so at most seven others can be written; found ${writtenCount}`);
  const k = V6_GROUPS - writtenCount;
  const groups = [...l.map((g) => parseInt(g, 16)), ...Array<number>(k).fill(0), ...r.map((g) => parseInt(g, 16))];
  return { ok: true, groups, written: [...l, ...r], compressedAt: l.length, compressedCount: k };
}

/** One group in hex without leading zeros: 0xdb8 is "db8", 0 is "0". */
export const groupHex = (n: number) => n.toString(16);
/** One group padded to four digits: "0db8". */
export const groupPadded = (n: number) => n.toString(16).padStart(4, "0");

/** The full form: eight groups of four digits. */
export function expandV6(groups: readonly number[]): string {
  return groups.map(groupPadded).join(":");
}

export type ZeroRun = { start: number; length: number };

/** Every maximal run of zero groups, in order, single groups included. */
export function zeroRuns(groups: readonly number[]): ZeroRun[] {
  const runs: ZeroRun[] = [];
  let i = 0;
  while (i < groups.length) {
    if (groups[i] !== 0) {
      i += 1;
      continue;
    }
    let j = i;
    while (j < groups.length && groups[j] === 0) j += 1;
    runs.push({ start: i, length: j - i });
    i = j;
  }
  return runs;
}

/** The run RFC 5952 compresses: the longest of two or more groups, the first when two tie. Null when there is none. */
export function standardRun(groups: readonly number[]): ZeroRun | null {
  let best: ZeroRun | null = null;
  for (const run of zeroRuns(groups)) {
    if (run.length >= 2 && (best === null || run.length > best.length)) best = run;
  }
  return best;
}

/** Write the groups in hex without leading zeros, with the given run (if any) as `::`. */
export function writeV6(groups: readonly number[], run: ZeroRun | null): string {
  if (!run) return groups.map(groupHex).join(":");
  const left = groups.slice(0, run.start).map(groupHex).join(":");
  const right = groups.slice(run.start + run.length).map(groupHex).join(":");
  return `${left}::${right}`;
}

/** The standard short form (RFC 5952, [S4]). */
export function shortenV6(groups: readonly number[]): string {
  return writeV6(groups, standardRun(groups));
}

export type V6Judgement =
  | { status: "invalid"; error: V6ParseError }
  | {
      status: "standard" | "nonstandard";
      groups: number[];
      expanded: string;
      standard: string;
      /** How many zero groups `::` stands for in the text (0 when there is none). */
      zeroGroups: number;
      /** Why a valid form is not the standard one; empty when it is. */
      reasons: string[];
    };

/** Judge a typed form: invalid (with the rule it breaks), valid but not standard (with the reasons), or standard. */
export function judgeV6(text: string): V6Judgement {
  const parsed = parseIpv6(text);
  if (!parsed.ok) return { status: "invalid", error: parsed.error };
  const { groups, written, compressedAt, compressedCount } = parsed;
  const standard = shortenV6(groups);
  const reasons: string[] = [];
  if (/[A-F]/.test(text)) reasons.push("Use lowercase letters: a to f.");
  if (written.some((g) => g.length > 1 && g.startsWith("0"))) reasons.push("Drop the leading zeros in each group.");
  const run = standardRun(groups);
  if (compressedCount === 1) reasons.push(":: must not stand for a single zero group: write 0.");
  if (run) {
    if (compressedCount === 0) {
      reasons.push("Compress the longest run of zero groups with ::.");
    } else if (compressedCount > 1 && !(compressedAt === run.start && compressedCount === run.length)) {
      reasons.push(compressedCount < run.length ? "The :: must cover the whole longest run of zero groups." : "Two runs are equally long: compress the first one.");
    } else if (compressedCount === 1) {
      reasons.push("Compress the longest run of zero groups with ::.");
    }
  }
  if (reasons.length === 0 && text !== standard) reasons.push(`The standard form is ${standard}.`);
  return { status: reasons.length === 0 ? "standard" : "nonstandard", groups, expanded: expandV6(groups), standard, zeroGroups: compressedCount, reasons };
}

export const V6_VIEWS = ["expand", "shorten", "invalid", "drill"] as const;
export type V6View = (typeof V6_VIEWS)[number];

export const v6ConfigSchema = z
  .object({
    mode: z.literal("v6"),
    view: z.enum(V6_VIEWS),
    /**
     * expand: the addresses to step through (each valid); shorten: full-form
     * addresses to step through (each valid); invalid: example forms, valid or not.
     */
    addresses: z.array(z.string().min(2).max(45)).min(1).max(8).optional(),
  })
  .refine((c) => c.view === "drill" || (c.addresses !== undefined && c.addresses.length > 0), { message: "addresses are needed" })
  .refine((c) => c.view === "invalid" || c.view === "drill" || (c.addresses ?? []).every((a) => parseIpv6(a).ok), { message: "every address must be valid" });
export type V6Config = z.infer<typeof v6ConfigSchema>;

// ---------------------------------------------------------------- the drill

const MASKS = ["11001001", "11010001", "10000111", "11111110", "10000000", "00000001", "11000000", "10110011", "11100111", "11000011", "11101111"] as const;
/** Masks with a run of two or more zero groups, so the short form has a `::`. */
const RUN_MASKS = MASKS.filter((m) => zeroRuns([...m].map((c) => (c === "1" ? 1 : 0))).some((r) => r.length >= 2));

function randomGroup(rand: () => number): number {
  const digits = between(rand, 1, 4);
  return digits === 1 ? between(rand, 1, 15) : between(rand, 16 ** (digits - 1), 16 ** digits - 1);
}

function randomV6(rand: () => number, masks: readonly string[]): number[] {
  const mask = masks[between(rand, 0, masks.length - 1)];
  const groups = [...mask].map((c) => (c === "1" ? randomGroup(rand) : 0));
  if (mask[0] === "1" && rand() < 0.6) {
    groups[0] = 0x2001;
    if (mask[1] === "1") groups[1] = 0xdb8;
  }
  return groups;
}

const FORMS = ["Standard", "Valid, not standard", "Invalid"] as const;

const V6_KINDS = ["shorten", "expand", "shorten", "form", "form"] as const;

const part = (groups: readonly number[], from: number, to: number) => groups.slice(from, to).map(groupHex).join(":");

/** Two `::` in one address, one for each of two runs: never valid. */
function writeTwoGaps(groups: readonly number[], a: ZeroRun, b: ZeroRun): string {
  return `${part(groups, 0, a.start)}::${part(groups, a.start + a.length, b.start)}::${part(groups, b.start + b.length, groups.length)}`;
}

/**
 * Five questions for a set, the same every time for the same set number: two
 * on the short form, one on the full form and two that ask whether a written
 * form is standard, valid but not standard, or invalid. The labels come from
 * `judgeV6`, so the drill and the typing canvas cannot disagree.
 */
export function generateV6Drill(setNumber: number): DrillItem[] {
  const rand = drillRandom(setNumber, 0x85ebca6b);
  const kinds = shuffleWith(V6_KINDS, rand);
  let formIndex = 0;
  return kinds.map((kind): DrillItem => {
    if (kind === "shorten") {
      const groups = randomV6(rand, MASKS);
      const answer = shortenV6(groups);
      const std = standardRun(groups);
      const runs = zeroRuns(groups);
      const wrong: string[] = [];
      // Leading zeros kept
      wrong.push(std ? `${groups.slice(0, std.start).map(groupPadded).join(":")}::${groups.slice(std.start + std.length).map(groupPadded).join(":")}` : groups.map(groupPadded).join(":"));
      // A different run compressed, a single zero group included
      const other = runs.find((r) => !std || r.start !== std.start);
      if (other) wrong.push(writeV6(groups, other));
      // Nothing compressed
      if (std) wrong.push(groups.map(groupHex).join(":"));
      // :: left one zero group short of the whole run
      if (std) wrong.push(`${part(groups, 0, std.start + 1)}::${part(groups, std.start + std.length, groups.length)}`);
      // Uppercase
      wrong.push(answer.toUpperCase());
      // Two runs compressed: two ::
      if (runs.length >= 2) wrong.push(writeTwoGaps(groups, runs[0], runs[1]));
      const rule = std ? "Drop leading zeros and compress the longest zero run" : "Drop leading zeros; a single zero group stays 0, never ::";
      return withOptions(kind, "Standard short form of", expandV6(groups), answer, shuffleWith(wrong, rand), `${rule}: ${answer}`, rand);
    }
    if (kind === "expand") {
      const groups = randomV6(rand, RUN_MASKS);
      const short = shortenV6(groups);
      const parsed = parseIpv6(short);
      const k = parsed.ok ? parsed.compressedCount : 0;
      const written = parsed.ok ? parsed.written.length : 0;
      const answer = expandV6(groups);
      const zeroAt = groups.indexOf(0);
      const fewer = expandV6(groups.filter((_, i) => i !== zeroAt));
      const more = expandV6([...groups.slice(0, zeroAt), 0, ...groups.slice(zeroAt)]);
      const padRight = groups.map((g) => g.toString(16).padEnd(4, "0")).join(":");
      return withOptions(kind, "Full form of", short, answer, shuffleWith([fewer, more, padRight], rand), `${written} groups are written, so :: stands for ${k} zero groups (${k * V6_GROUP_BITS} bits): ${answer}`, rand);
    }
    // form: standard, valid but not standard, or invalid, in a seeded order of categories
    const category = (formIndex + between(rand, 0, 2)) % 3;
    formIndex += 1;
    const groups = randomV6(rand, RUN_MASKS);
    const text = formText(category, groups, rand);
    const verdict = judgeV6(text);
    const answer = verdict.status === "invalid" ? 2 : verdict.status === "standard" ? 0 : 1;
    const explain =
      verdict.status === "invalid" ? verdict.error.message : verdict.status === "standard" ? "Lowercase, no leading zeros, the longest zero run as ::" : `${verdict.reasons[0]} Standard: ${verdict.standard}`;
    return { kind, prompt: "Is this form standard, valid but not standard, or invalid?", subject: text, options: [...FORMS], answer, explain };
  });
}

/** A written form of the requested category; `judgeV6` has the last word on which one it really is. */
function formText(category: number, groups: readonly number[], rand: () => number): string {
  const standard = shortenV6(groups);
  const run = standardRun(groups) as ZeroRun;
  if (category === 0) return standard;
  if (category === 1) {
    const choices = [
      standard.toUpperCase(),
      expandV6(groups),
      groups.map(groupHex).join(":"),
      `${part(groups, 0, run.start + 1)}::${part(groups, run.start + run.length, groups.length)}`,
    ].filter((c) => c !== standard);
    return choices[between(rand, 0, choices.length - 1)] ?? expandV6(groups);
  }
  const runs = zeroRuns(groups);
  const choices = [
    `${expandV6(groups)}:1`,
    standard.replace(/^[0-9a-f]+/, (m) => `1${m.padStart(4, "0")}`),
    standard.replace(/[0-9a-f]/, "g"),
    part(groups, 0, 7),
    ...(runs.length >= 2 ? [writeTwoGaps(groups, runs[0], runs[1])] : []),
  ];
  return choices[between(rand, 0, choices.length - 1)];
}
