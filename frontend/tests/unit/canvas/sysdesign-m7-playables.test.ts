import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { checkDeck, sortVerdict, startSort, placeCard, currentCard, wrapWords } from "@/canvas/models/sorter";
import * as lsm from "@/canvas/models/lsm-stepper";
import * as bloom from "@/canvas/models/bloom";
import * as iso from "@/canvas/models/isolation";
import * as tw from "@/canvas/models/two-writers";
import * as sc from "@/canvas/models/db-scaling";
import { STORE_BUCKETS, STORE_CARDS, STORE_VERDICTS, sysdesignM7StoreSorter } from "@/canvas/sysdesign-m7-store-sorter/data";
import { sysdesignM7LsmStepper } from "@/canvas/sysdesign-m7-lsm-stepper/data";
import { sysdesignM7BloomBits } from "@/canvas/sysdesign-m7-bloom-bits/data";
import { sysdesignM7IsolationLab } from "@/canvas/sysdesign-m7-isolation-lab/data";
import { sysdesignM7TwoWriters } from "@/canvas/sysdesign-m7-two-writers/data";
import { sysdesignM7ScalingPath } from "@/canvas/sysdesign-m7-scaling-path/data";

const MAX_VERDICT = 38;
const DASH = String.fromCharCode(0x2014);

describe("7.2 store sorter", () => {
  it("has a valid deck of eight cards with a reason for every wrong bucket", () => {
    expect(STORE_CARDS).toHaveLength(8);
    expect(STORE_BUCKETS).toHaveLength(4);
    expect(checkDeck(STORE_CARDS, STORE_BUCKETS)).toEqual([]);
  });

  it("puts each workload in the family the spec names", () => {
    const answers = Object.fromEntries(STORE_CARDS.map((c) => [c.id, c.answer]));
    expect(answers).toEqual({
      "sell-ticket": "relational",
      "login-session": "key",
      "gate-scans": "wide",
      "friends-of-friends": "graph",
      "search-titles": "graph",
      "venue-report": "relational",
      "whole-order": "key",
      "cooler-sensors": "wide",
    });
  });

  it("fits every reason in two lines of 60 characters", () => {
    for (const c of STORE_CARDS) for (const reason of Object.values(c.why)) expect(wrapWords(reason, 60).length, reason).toBeLessThanOrEqual(2);
  });

  it("says the round's verdict in the spec's words and within 38 characters", () => {
    let s = startSort(STORE_CARDS, STORE_BUCKETS);
    for (const c of STORE_CARDS) s = placeCard(s, STORE_CARDS, c.answer).state;
    expect(sortVerdict(s, STORE_VERDICTS)).toBe("Eight for eight, first try");

    s = startSort(STORE_CARDS, STORE_BUCKETS);
    const first = currentCard(s, STORE_CARDS)!;
    const wrong = STORE_BUCKETS.find((b) => b.id !== first.answer)!.id;
    s = placeCard(s, STORE_CARDS, wrong).state;
    for (let i = 0; i < 8; i++) s = placeCard(s, STORE_CARDS, currentCard(s, STORE_CARDS)!.answer).state;
    expect(sortVerdict(s, STORE_VERDICTS)).toBe("1 card needed a second try");
    expect(STORE_VERDICTS.many.replace("{n}", "8").length).toBeLessThanOrEqual(MAX_VERDICT);
    expect(sortVerdict(s)).toBe("All sorted, 1 took a second try");
  });
});

describe("7.3 LSM stepper", () => {
  const at = (step: number, bloomOn = false) => {
    const s = lsm.lsmState(step);
    return { s, files: s.files.length, disk: lsm.diskWrites(s), amp: lsm.formatAmp(s), plain: lsm.readProbe(s, lsm.PROBE_KEY, false).checks, bloom: lsm.readProbe(s, lsm.PROBE_KEY, true).checks, bloomOn };
  };

  it("matches the counters in the spec at every checkpoint", () => {
    expect(at(4)).toMatchObject({ files: 1, disk: 8, amp: "2.00", plain: 1, bloom: 1 });
    expect(lsm.lsmState(4).puts).toBe(4);
    expect(at(8)).toMatchObject({ files: 2, disk: 16, amp: "2.00", plain: 2, bloom: 1 });
    expect(at(12)).toMatchObject({ files: 3, disk: 24, amp: "2.00", plain: 3, bloom: 1 });
    const s14 = at(14);
    expect(s14).toMatchObject({ files: 3, disk: 26, amp: "1.86", plain: 3, bloom: 1 });
    expect(s14.s.puts).toBe(14);
    expect(s14.s.memory).toHaveLength(2);
    expect(at(15)).toMatchObject({ files: 1, disk: 38, amp: "2.71", plain: 1, bloom: 1 });
    const s17 = at(17);
    expect(s17).toMatchObject({ files: 2, disk: 44, amp: "2.75", plain: 2, bloom: 1 });
    expect(s17.s.puts).toBe(16);
    expect(at(18)).toMatchObject({ files: 1, disk: 58, amp: "3.63", plain: 1, bloom: 1 });
  });

  it("finds a key in memory with no file opened, and a new value replaces the old on merge", () => {
    expect(lsm.readProbe(lsm.lsmState(3), lsm.PROBE_KEY, false)).toMatchObject({ inMemory: true, checks: 0 });
    const merged = lsm.lsmState(15);
    expect(merged.files).toHaveLength(1);
    expect(merged.files[0].keys).toHaveLength(12);
    const final = lsm.lsmState(18);
    expect(final.files[0].keys).toHaveLength(14);
    expect(final.files[0].sold.sort()).toEqual(["seat-03", "seat-07"]);
  });

  it("flushes after steps 4, 8, 12 and 17 and never holds more than 4 keys in memory", () => {
    const flushed = Array.from({ length: 18 }, (_, i) => i + 1).filter((n) => lsm.lsmState(n).flushed);
    expect(flushed).toEqual([4, 8, 12, 17]);
    for (let n = 0; n <= 18; n++) expect(lsm.lsmState(n).memory.length).toBeLessThanOrEqual(lsm.MEMTABLE_LIMIT);
  });

  it("clamps steps outside the script and starts empty", () => {
    expect(lsm.lsmState(-3).step).toBe(0);
    expect(lsm.lsmState(99).step).toBe(18);
    expect(lsm.formatAmp(lsm.lsmState(0))).toBe("-");
  });

  it("says the spec's verdicts, each within 38 characters", () => {
    expect(lsm.lsmVerdict(lsm.lsmState(12), false).text).toBe("3 files: a read opens all of them");
    expect(lsm.lsmVerdict(lsm.lsmState(12), true).text).toBe("Bloom filter: opens 1 file of 3");
    expect(lsm.lsmVerdict(lsm.lsmState(15), false).text).toBe("Merged: 1 file, 12 more writes");
    expect(lsm.lsmVerdict(lsm.lsmState(18), false).text).toBe("Fewer files, but 3.63 writes per put");
    for (let n = 0; n <= 18; n++) for (const b of [false, true]) expect(lsm.lsmVerdict(lsm.lsmState(n), b).text.length).toBeLessThanOrEqual(MAX_VERDICT);
  });
});

describe("7.3 Bloom bits", () => {
  const rows: [number, number, string, number, string][] = [
    [2, 1, "39.35%", 3, "0.25 GB"],
    [3, 2, "23.68%", 4, "0.375 GB"],
    [4, 3, "14.69%", 7, "0.5 GB"],
    [5, 3, "9.18%", 11, "0.625 GB"],
    [6, 4, "5.61%", 18, "0.75 GB"],
    [8, 6, "2.16%", 46, "1 GB"],
    [10, 7, "0.82%", 122, "1.25 GB"],
    [12, 8, "0.31%", 318, "1.5 GB"],
    [15, 10, "0.07%", 1344, "1.875 GB"],
    [20, 14, "0.0067%", 14895, "2.5 GB"],
  ];

  it.each(rows)("gives the worked values at %i bits", (b, k, rate, oneIn, memory) => {
    expect(bloom.hashCount(b)).toBe(k);
    expect(bloom.formatRate(b)).toBe(rate);
    expect(bloom.oneIn(b)).toBe(oneIn);
    expect(bloom.formatMemory(b)).toBe(memory);
  });

  it("shows about 9 wrong maybes in 100 at 5 bits and none below 0.5%", () => {
    expect(bloom.amberDots(5)).toBe(9);
    expect(bloom.amberDots(10)).toBe(1);
    expect(bloom.amberDots(12)).toBe(0);
    expect(bloom.amberDots(20)).toBe(0);
    expect(bloom.wastedReadsPer1000(10)).toBe(8);
  });

  it("picks the verdict by rate and keeps it within 38 characters", () => {
    expect(bloom.bloomVerdict(5).text).toBe("Many wasted file reads");
    expect(bloom.bloomVerdict(8).text).toBe("About 1 wasted read in 100");
    expect(bloom.bloomVerdict(10).text).toBe("About 1 wasted read in 100");
    expect(bloom.bloomVerdict(12).text).toBe("Few wasted reads, more memory");
    for (const b of bloom.BITS_LADDER) expect(bloom.bloomVerdict(b).text.length).toBeLessThanOrEqual(MAX_VERDICT);
  });

  it("falls fast then flattens, and maps the rail to the ladder", () => {
    const rates = bloom.BITS_LADDER.map(bloom.falsePositiveRate);
    for (let i = 1; i < rates.length; i++) expect(rates[i]).toBeLessThan(rates[i - 1]);
    expect(rates[0] - rates[3]).toBeGreaterThan(rates[3] - rates[9]);
    expect(bloom.bitsFromFraction(0)).toBe(2);
    expect(bloom.bitsFromFraction(1)).toBe(20);
    expect(bloom.bitsFromFraction(bloom.bitsToFraction(10))).toBe(10);
    expect(bloom.bitsFromFraction(Number.NaN)).toBe(2);
    expect(bloom.DEFAULT_BITS).toBe(10);
  });
});

describe("7.4 isolation lab", () => {
  const levels: iso.LevelId[] = ["read-committed", "repeatable-read", "serializable"];

  it("ends each story as PostgreSQL 18.6 did", () => {
    const end = (s: iso.StoryId, l: iso.LevelId) => iso.script(s, l);
    expect(end("lost-app", "read-committed")).toMatchObject({ final: "130", verdict: { text: "Lost update: 150 was erased" } });
    expect(end("lost-app", "repeatable-read")).toMatchObject({ final: "150", verdict: { text: "Refused with 40001: retry" } });
    expect(end("lost-app", "serializable")).toMatchObject({ final: "150", verdict: { text: "Refused with 40001: retry" } });
    expect(end("lost-sql", "read-committed")).toMatchObject({ final: "180", verdict: { text: "No loss: 100 + 50 + 30 = 180" } });
    expect(end("lost-sql", "repeatable-read").verdict.text).toBe("Refused with 40001: retry");
    expect(end("lost-sql", "serializable").verdict.text).toBe("Refused with 40001: retry");
    expect(end("skew", "read-committed")).toMatchObject({ final: "0 open", verdict: { text: "Write skew: no gate stays open" } });
    expect(end("skew", "repeatable-read")).toMatchObject({ final: "0 open", verdict: { text: "Write skew: no gate stays open" } });
    expect(end("skew", "serializable")).toMatchObject({ final: "1 open", verdict: { text: "Refused: one gate stays open" } });
    for (const l of levels) expect(end("dirty", l)).toMatchObject({ verdict: { text: "No dirty read in PostgreSQL" } });
    expect(end("dirty", "read-uncommitted")).toMatchObject({ verdict: { text: "Dirty read: saw a change that vanished" } });
  });

  it("gives the error code and text of each refusal", () => {
    const last = (s: iso.StoryId, l: iso.LevelId) => {
      const sc2 = iso.script(s, l);
      return iso.message(sc2, iso.stepCount(sc2));
    };
    expect(last("lost-app", "repeatable-read")).toContain("ERROR 40001: could not serialize access due to concurrent update");
    expect(last("lost-sql", "serializable")).toContain("Retrying gives 180");
    expect(last("skew", "serializable")).toContain("could not serialize access due to read/write dependencies among transactions");
    expect(last("lost-app", "read-committed")).not.toContain("40001");
  });

  it("has the script lengths in the spec and a waiting statement before T1 commits", () => {
    expect(iso.stepCount(iso.script("lost-app", "read-committed"))).toBe(8);
    expect(iso.stepCount(iso.script("lost-sql", "read-committed"))).toBe(8);
    expect(iso.stepCount(iso.script("skew", "read-committed"))).toBe(8);
    expect(iso.stepCount(iso.script("dirty", "read-committed"))).toBe(4);
    const a = iso.script("lost-app", "read-committed");
    expect(a.rows.find((r) => r.style === "wait")?.step).toBe(6);
    expect(a.rows.find((r) => r.style === "commit")?.step).toBe(7);
  });

  it("offers Read Uncommitted for the dirty read story only, and falls back otherwise", () => {
    expect(iso.levelsFor("dirty")).toContain("read-uncommitted");
    for (const s of ["lost-app", "lost-sql", "skew"] as iso.StoryId[]) expect(iso.levelsFor(s)).not.toContain("read-uncommitted");
    expect(iso.validLevel("skew", "read-uncommitted")).toBe("read-committed");
    expect(iso.script("skew", "read-uncommitted").level).toBe("read-committed");
  });

  it("draws a write dashed until its commit, solid after, and struck after a rollback", () => {
    const a = iso.script("lost-app", "read-committed");
    const write = a.rows.find((r) => r.style === "write")!;
    expect(iso.rowLook(write, 2)).toBe("ghost");
    expect(iso.rowLook(write, 5)).toBe("pending");
    expect(iso.rowLook(write, 7)).toBe("settled");
    const d = iso.script("dirty", "read-committed");
    const dw = d.rows.find((r) => r.style === "write")!;
    expect(iso.rowLook(dw, 3)).toBe("pending");
    expect(iso.rowLook(dw, 4)).toBe("undone");
    const sk = iso.script("skew", "serializable");
    expect(iso.rowLook(sk.rows.find((r) => r.step === 6)!, 8)).toBe("undone");
  });

  it("tracks the database value over time", () => {
    const a = iso.script("lost-app", "read-committed");
    expect(iso.dbAt(a, 0).value).toBe("100");
    expect(iso.dbAt(a, 5).value).toBe("100");
    expect(iso.dbAt(a, 7).value).toBe("150");
    expect(iso.dbAt(a, 8).value).toBe("130");
    const d = iso.script("dirty", "read-uncommitted");
    expect(iso.dbAt(d, 3).value).toBe("left 1");
    expect(iso.dbAt(d, 4).value).toBe("left 1");
  });

  it("keeps every banner within 38 characters and every message within two lines", () => {
    for (const story of iso.STORIES) {
      for (const l of iso.levelsFor(story.id)) {
        const s = iso.script(story.id, l);
        for (let step = 0; step <= iso.stepCount(s); step++) {
          expect(iso.banner(s, step).text.length, `${story.id} ${l} ${step}`).toBeLessThanOrEqual(MAX_VERDICT);
          expect(wrapWords(iso.message(s, step), 60).length).toBeLessThanOrEqual(2);
          for (const r of s.rows) {
            expect(r.text.length).toBeLessThanOrEqual(22);
            expect(r.ghost.length).toBeLessThanOrEqual(22);
          }
        }
      }
    }
  });
});

describe("7.5 two writers", () => {
  it("matches the worked values at 50 ms of think time", () => {
    expect(tw.run("none", 50)).toMatchObject({ lostUpdates: 1, retries: 0, finish: 54 });
    expect(tw.run("lock", 50)).toMatchObject({ lostUpdates: 0, retries: 0, waited: 50, finish: 104 });
    expect(tw.run("version", 50)).toMatchObject({ lostUpdates: 0, retries: 1, wasted: 50, finish: 105 });
  });

  it("finishes all three at 4 ms with no loss when nobody thinks", () => {
    for (const s of ["none", "lock", "version"] as tw.Strategy[]) expect(tw.run(s, 0)).toMatchObject({ lostUpdates: 0, retries: 0, finish: 4 });
  });

  it("follows the formulas for every think time", () => {
    for (const T of tw.THINK_LADDER) {
      expect(tw.run("none", T).finish).toBe(T > 0 ? 4 + T : 4);
      expect(tw.run("lock", T).finish).toBe(4 + 2 * T);
      expect(tw.run("version", T).finish).toBe(T > 0 ? 5 + 2 * T : 4);
      expect(tw.run("none", T).lostUpdates).toBe(T > 0 ? 1 : 0);
      expect(tw.run("lock", T).lostUpdates).toBe(0);
      expect(tw.run("version", T).lostUpdates).toBe(0);
    }
  });

  it("shows the row going 100, 150, 130 for the lost update and 100, 150, 180 otherwise", () => {
    expect(tw.run("none", 25).row.map((c) => c.value)).toEqual([100, 150, 130]);
    expect(tw.run("none", 25).row[2].lost).toBe(true);
    expect(tw.run("lock", 25).row.map((c) => c.value)).toEqual([100, 150, 180]);
    expect(tw.run("version", 25).row.map((c) => c.value)).toEqual([100, 150, 180]);
  });

  it("draws the wait for the lock, and the refused write followed by a second read, think and write", () => {
    const lock = tw.run("lock", 25);
    expect(lock.b[0]).toMatchObject({ kind: "wait", from: 2, to: 27 });
    const v = tw.run("version", 25);
    expect(v.b.map((s) => s.kind)).toEqual(["read", "think", "refused", "read", "think", "write"]);
    expect(v.b[2].from).toBe(28);
  });

  it("says the spec's verdicts within 38 characters", () => {
    expect(tw.run("none", 25).verdict.text).toBe("One update lost");
    expect(tw.run("none", 0).verdict.text).toBe("No overlap, no loss (this time)");
    expect(tw.run("lock", 25).verdict.text).toBe("B waited, nothing lost");
    expect(tw.run("version", 25).verdict.text).toBe("B repeated its work, nothing lost");
    expect(tw.run("version", 0).verdict.text).toBe("No collision, no retry");
    for (const s of ["none", "lock", "version"] as tw.Strategy[]) for (const T of tw.THINK_LADDER) expect(tw.run(s, T).verdict.text.length).toBeLessThanOrEqual(MAX_VERDICT);
  });

  it("spreads chips apart, keeps them inside the plot, and picks round ticks", () => {
    const xs = tw.spreadChips([80, 232, 235], 40, 70, 408);
    expect(xs[1] - xs[0]).toBeGreaterThanOrEqual(40);
    expect(xs[2] - xs[1]).toBeGreaterThanOrEqual(40);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(90);
    const tight = tw.spreadChips([400, 405, 408], 40, 70, 408);
    expect(Math.max(...tight)).toBeLessThanOrEqual(388);
    expect(tight[1] - tight[0]).toBeGreaterThanOrEqual(40);
    expect(tw.niceTicks(206).length).toBeLessThanOrEqual(7);
    expect(tw.niceTicks(6)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(tw.thinkFromFraction(0.5)).toBe(25);
    expect(tw.thinkToFraction(100)).toBe(1);
  });
});

describe("7.6 scaling path", () => {
  const cfg = (patch: Partial<sc.Config>): sc.Config => ({ ...sc.DEFAULT_CONFIG, ...patch });
  const units = (c: sc.Config) => Math.round(sc.load(c).primaryUnits);
  const pct = (c: sc.Config) => Math.round(sc.load(c).primaryUtil * 100);

  it("matches the worked values at 3,000 requests a second", () => {
    expect(units(cfg({}))).toBe(9600);
    expect(pct(cfg({}))).toBe(240);
    expect(units(cfg({ index: true }))).toBe(4200);
    expect(pct(cfg({ index: true }))).toBe(105);
    expect(units(cfg({ index: true, cache: true }))).toBe(1770);
    expect(pct(cfg({ index: true, cache: true }))).toBe(44);
  });

  it("matches the worked values at 12,000 and 25,000", () => {
    const base = { traffic: 12000, index: true, cache: true };
    expect(units(cfg(base))).toBe(7080);
    expect(pct(cfg(base))).toBe(177);
    const withReplicas = sc.load(cfg({ ...base, replicas: 2 }));
    expect(withReplicas.primaryUnits).toBe(6000);
    expect(Math.round(withReplicas.primaryUtil * 100)).toBe(150);
    expect(withReplicas.replicaUnits).toBe(540);
    expect(Math.round((withReplicas.replicaUtil ?? 0) * 100)).toBe(14);
    expect(units(cfg({ ...base, partitions: 2 }))).toBe(3540);
    expect(pct(cfg({ ...base, partitions: 2 }))).toBe(89);
    expect(sc.load(cfg({ ...base, partitions: 2, replicas: 2 })).primaryUnits).toBe(3000);
    expect(pct(cfg({ ...base, partitions: 2, replicas: 2 }))).toBe(75);
    const big = { traffic: 25000, index: true, cache: true };
    expect(units(cfg(big))).toBe(14750);
    expect(pct(cfg(big))).toBe(369);
    expect(units(cfg({ ...big, partitions: 4 }))).toBe(3688);
    expect(pct(cfg({ ...big, partitions: 4 }))).toBe(92);
  });

  it("leaves the primary full when a read replica is added for a write problem", () => {
    const before = cfg({ traffic: 12000, index: true, cache: true });
    const after = cfg({ traffic: 12000, index: true, cache: true, replicas: 3 });
    expect(sc.load(after).primaryUtil).toBeGreaterThan(1);
    expect(sc.verdict(before, sc.load(before)).text).toBe("Writes 177%: partition the data");
    expect(sc.verdict(after, sc.load(after)).text).toBe("Writes 150%: partition the data");
  });

  it("names the step that fixes the worst part, in the order of the path", () => {
    const v = (c: sc.Config) => sc.verdict(c, sc.load(c)).text;
    expect(v(cfg({}))).toBe("Primary 240%: add an index");
    expect(v(cfg({ index: true }))).toBe("Primary 105%: add a cache");
    expect(v(cfg({ index: true, cache: true }))).toBe("Every part has room");
    expect(v(cfg({ traffic: 12000, index: true, cache: true, partitions: 2 }))).toBe("Every part has room");
    expect(v(cfg({ traffic: 25000, index: true, cache: true }))).toBe("Writes 369%: partition the data");
    expect(v(cfg({ traffic: 25000, index: true, cache: true, partitions: 4 }))).toBe("Every part has room");
  });

  it("asks for a read replica when reads, not writes, fill the primary", () => {
    const c = cfg({ traffic: 3000, index: true, cache: true, scenario: true, searchIndex: true });
    // Searches on a search store: only the cached reads and writes remain.
    expect(sc.verdict(c, sc.load(c)).text).toBe("Every part has room");
    const heavy = cfg({ traffic: 6000, index: true, cache: false });
    const l = sc.load(heavy);
    expect(l.primaryUnits).toBe(5400 * 1 + 600 * 5);
    expect(sc.verdict(heavy, l).text).toBe("Primary 210%: add a cache");
    const cached = cfg({ traffic: 6000, index: false, cache: true });
    expect(sc.verdict(cached, sc.load(cached)).text).toMatch(/^Reads [0-9]+%: add a read replica$/);
  });

  it("adds the search box: searches overload the database until they get an index", () => {
    const without = cfg({ scenario: true, index: true, cache: true });
    const l = sc.load(without);
    // 270 searches a second at 20 units, plus 2,430 reads cached to 243, plus 300 writes at 5.
    expect(l.searchUnits).toBe(5400);
    expect(l.primaryUnits).toBe(5400 + 243 + 1500);
    expect(sc.verdict(without, l).text).toBe("Searches overload: add a search index");
    const withIndex = cfg({ scenario: true, index: true, cache: true, searchIndex: true });
    const l2 = sc.load(withIndex);
    expect(l2.searchUnits).toBe(0);
    expect(l2.primaryUnits).toBe(243 + 1500);
    expect(Math.round((l2.searchStoreUtil ?? 0) * 100)).toBe(5);
    expect(sc.verdict(withIndex, l2).text).toBe("Every part has room");
    expect(sc.load(cfg({ searchIndex: true })).searchStoreUtil).toBeNull();
  });

  it("counts cost: machines, the cache and a search store, with a bigger machine counted twice", () => {
    expect(sc.load(cfg({})).cost).toBe(1);
    expect(sc.load(cfg({ cache: true, replicas: 2, partitions: 2 })).cost).toBe(1 + 2 + 2);
    expect(sc.load(cfg({ bigger: true })).cost).toBe(2);
    expect(sc.load(cfg({ bigger: true })).capacity).toBe(8000);
    expect(sc.load(cfg({ scenario: true, searchIndex: true })).cost).toBe(2);
  });

  it("labels each part fine under 70%, busy up to 100% and full above", () => {
    expect(sc.status(0.44)).toMatchObject({ pct: 44, word: "fine", tone: "good" });
    expect(sc.status(0.7)).toMatchObject({ word: "busy", tone: "warn" });
    expect(sc.status(1)).toMatchObject({ word: "busy" });
    expect(sc.status(1.05)).toMatchObject({ pct: 105, word: "full", tone: "bad" });
    expect(sc.statusText(sc.status(2.4))).toBe("240% full");
  });

  it("keeps every verdict within 38 characters across all traffic and step choices", () => {
    for (const traffic of sc.TRAFFIC_LADDER)
      for (const index of [false, true])
        for (const cache of [false, true])
          for (const replicas of [0, 1, 2, 3])
            for (const partitions of sc.PARTITION_LADDER)
              for (const bigger of [false, true])
                for (const scenario of [false, true])
                  for (const searchIndex of [false, true]) {
                    const c: sc.Config = { traffic, index, cache, replicas, partitions, bigger, scenario, searchIndex };
                    const l = sc.load(c);
                    expect(Number.isFinite(l.primaryUtil)).toBe(true);
                    const v = sc.verdict(c, l);
                    expect(v.text.length, `${JSON.stringify(c)} ${v.text}`).toBeLessThanOrEqual(MAX_VERDICT);
                  }
  });

  it("can reach 12,000 requests a second with an index, a cache and two partitions", () => {
    const c = cfg({ traffic: sc.GOAL_TRAFFIC, index: true, cache: true, partitions: 2 });
    expect(sc.verdict(c, sc.load(c)).tone).toBe("good");
    expect(sc.stepsOn(c)).toBe(3);
  });

  it("cycles replicas 0 to 3 and partitions 1, 2, 4, 8", () => {
    expect([0, 1, 2, 3].map(sc.nextReplicas)).toEqual([1, 2, 3, 0]);
    expect([1, 2, 4, 8].map(sc.nextPartitions)).toEqual([2, 4, 8, 1]);
    expect(sc.trafficFromFraction(0)).toBe(500);
    expect(sc.trafficFromFraction(1)).toBe(50000);
    expect(sc.trafficToFraction(sc.DEFAULT_TRAFFIC)).toBeCloseTo(2 / 6, 5);
    expect(sc.withCommas(12000)).toBe("12,000");
  });
});

describe("the Module 7 playables as canvas specs", () => {
  const specs = [
    ["store sorter", sysdesignM7StoreSorter],
    ["lsm stepper", sysdesignM7LsmStepper],
    ["bloom bits", sysdesignM7BloomBits],
    ["isolation lab", sysdesignM7IsolationLab],
    ["two writers", sysdesignM7TwoWriters],
    ["scaling path", sysdesignM7ScalingPath],
  ] as const;

  it.each(specs)("renders %s on the server with its picture and its limits fold", (_name, spec) => {
    const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
    expect(html).toContain("<svg");
    expect(html).toContain("What this picture leaves out");
    expect(html).not.toMatch(/foreignObject|<animate|<use |<image/);
    expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
  });

  it.each(specs)("writes %s without an em dash", (_name, spec) => {
    expect(`${spec.title}${spec.purpose}${spec.limits}`).not.toContain(DASH);
  });
});
