import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LAB_SLUGS } from "@/shared/lab/slugs";
import { labRegistry } from "@/lab/registry";
import { runChallenge } from "@/lab/challenge";
import { compareDesigns } from "@/lab/solution";
import { hldVisualUrlShortener as shortener } from "@/lab/hld-visual-url-shortener/data";
import type { Board, HldLabSpec } from "@/lab/types";
import { checkIdsOf, validateLabSpec } from "@/lab/types";

const labsWithSolution = LAB_SLUGS.map((s) => labRegistry[s]).filter((s): s is HldLabSpec => s.family === "hld" && Boolean(s.solution));
const board = (b: { nodes: Board["nodes"]; edges: Board["edges"] }): Board => ({ nodes: b.nodes.map((n) => ({ ...n, props: { ...(n.props ?? {}) } })), edges: b.edges });
const loadOf = (spec: HldLabSpec) => spec.challenge?.peakLoad ?? spec.levels[0]!.load;

describe("reference solutions", () => {
  it("exist for the shortener, the three tiers lab and the Wasla redirects lab", () => {
    expect(labsWithSolution.map((s) => s.slug).sort()).toEqual(["hld-m20-wasla-redirects", "hld-m4-three-tiers", "hld-visual-url-shortener"]);
  });

  it.each(labsWithSolution.map((s) => [s.slug, s] as const))("%s: the solution is valid and passes every check", (_slug, spec) => {
    expect(validateLabSpec(spec)).toEqual([]);
    const report = runChallenge(spec, board(spec.solution!.board), loadOf(spec));
    expect(report.checks.filter((c) => !c.pass).map((c) => c.id)).toEqual([]);
    expect(report.allPass).toBe(true);
  });

  it("passes all 11 checks of the URL shortener", () => {
    const report = runChallenge(shortener, board(shortener.solution!.board), 3000);
    expect(report.total).toBe(11);
    expect(report.passed).toBe(11);
  });

  it.each(labsWithSolution.map((s) => [s.slug, s] as const))("%s: every part has an explanation naming real checks, and spec.md has a Solution section", (slug, spec) => {
    const ids = new Set(checkIdsOf(spec));
    for (const node of spec.solution!.board.nodes.filter((n) => n.kind !== "client")) {
      const part = spec.solution!.parts[node.id]!;
      expect(part.why.length).toBeGreaterThan(20);
      expect(part.without.length).toBeGreaterThan(20);
      for (const c of part.checks) expect(ids.has(c)).toBe(true);
    }
    const file = resolve(process.cwd(), "src/lab", slug, "spec.md");
    expect(existsSync(file)).toBe(true);
    expect(readFileSync(file, "utf8")).toMatch(/^## Solution/m);
  });

  it("never uses an em or en dash in the explanations", () => {
    const text = labsWithSolution.map((s) => JSON.stringify(s.solution)).join(" ");
    expect(text).not.toMatch(new RegExp(`${String.fromCharCode(0x2014)}|${String.fromCharCode(0x2013)}`));
  });

  it("is rejected when a part is missing its explanation or names an unknown check", () => {
    const parts = Object.fromEntries(Object.entries(shortener.solution!.parts).filter(([id]) => id !== "q"));
    const bad: HldLabSpec = {
      ...shortener,
      solution: { ...shortener.solution!, parts: { ...parts, cache: { why: "A cache that helps with something.", without: "Something goes wrong without it.", checks: ["nope"] } } },
    };
    const problems = validateLabSpec(bad).join("|");
    expect(problems).toMatch(/unknown check "nope"/);
    expect(problems).toMatch(/no explanation for part "q"/);
  });
});

describe("claims made in the three tiers explanations", () => {
  const m4 = labRegistry["hld-m4-three-tiers"] as HldLabSpec;
  const variant = (id: string, props: Record<string, number | string>): Board => {
    const b = board(m4.solution!.board);
    Object.assign(b.nodes.find((n) => n.id === id)!.props!, props);
    return b;
  };
  const steady = (b: Board) => runChallenge(m4, b, 10_000).phases[0]!.result;

  it("a small balancer caps the design at 1,600 a second with p99 over 200 ms", () => {
    const r = steady(variant("lb", { size: "general-small", zones: 1 }));
    expect(r.capacityCeiling).toBe(1600);
    expect(r.p99Ms).toBeGreaterThan(200);
  });

  it("two app servers push p99 past the 200 ms target", () => {
    expect(steady(variant("app", { count: 2 })).p99Ms).toBeGreaterThan(200);
  });

  it("no standby drops availability under 99.9% and saves $0.60 an hour", () => {
    const without = steady(variant("db", { multiAz: 0 }));
    const full = steady(board(m4.solution!.board));
    expect(without.availability).toBeLessThan(0.999);
    expect(full.costPerHour - without.costPerHour).toBeCloseTo(0.6, 2);
  });

  it("a medium database caps the ceiling at 6,000 a second", () => {
    expect(steady(variant("db", { size: "memory-medium" })).capacityCeiling).toBe(6000);
  });
});

describe("compare with mine", () => {
  const start = (): Board => board({ nodes: shortener.startingBoard!.nodes, edges: shortener.startingBoard!.edges });
  const compare = (b: Board) => compareDesigns(shortener, b, runChallenge(shortener, b, 3000));

  it("says nothing differs when the design is the solution", () => {
    const r = compare(board(shortener.solution!.board));
    expect(r.lines).toEqual([]);
    expect(r.headline).toMatch(/matches the reference/);
  });

  it("lists missing parts and links in plain words and ties them to failing checks", () => {
    const r = compare(start());
    const text = r.lines.map((l) => l.text).join("\n");
    expect(text).toMatch(/The reference has a cache\. Your design has none\./);
    expect(text).toMatch(/The reference has a queue\. Your design has none\./);
    expect(text).toMatch(/The reference has a worker\. Your design has none\./);
    expect(r.lines.find((l) => /has a cache/.test(l.text))!.explains).toContain("p99 redirect latency");
    expect(r.lines.find((l) => /has a queue/.test(l.text))!.explains).toContain("Serves the whole peak");
    expect(r.failing).toBeGreaterThan(0);
    expect(r.explained).toBeGreaterThan(0);
  });

  it("gives directions for settings, not the reference's numbers", () => {
    const mine = board(shortener.solution!.board);
    mine.nodes.find((n) => n.id === "app")!.props!.count = 2;
    mine.nodes.find((n) => n.id === "db")!.props!.replicas = 0;
    mine.nodes.find((n) => n.id === "db")!.props!.multiAz = 0;
    const r = compare(mine);
    const text = r.lines.map((l) => l.text).join("\n");
    expect(text).toMatch(/App server: "Instances" is lower than in the reference\./);
    expect(text).toMatch(/Database: "Read replicas" is lower than in the reference\./);
    expect(text).toMatch(/"Standby in a second zone" is off in your design and on in the reference/);
    expect(text).not.toMatch(/\b(3|95|500)\b/);
    expect(r.lines.find((l) => /Read replicas/.test(l.text))!.explains).toEqual(expect.arrayContaining(["Everyone is still served when the cache dies"]));
  });

  it("notes a missing link and an added part", () => {
    const mine = board(shortener.solution!.board);
    mine.edges = mine.edges.filter((e) => !(e.from === "w" && e.to === "db"));
    mine.nodes.push({ id: "extra", kind: "nosql", x: 0, y: 0 });
    const text = compare(mine).lines.map((l) => l.text).join("\n");
    expect(text).toMatch(/links worker to database\. Yours does not\./);
    expect(text).toMatch(/added a nosql store that the reference does not use/);
  });
});
