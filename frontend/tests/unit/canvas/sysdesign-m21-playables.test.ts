import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ACTION_HOPS,
  ACTION_IDS,
  actionCaption,
  actionPills,
  actionRate,
  actionVerdict,
  actionWords,
  BLOCKS,
  HOPS,
  hopKey,
  speedClass,
} from "@buildment/learning-ui/canvas/models/feed-actions";
import {
  chainRates,
  feedEstimate,
  feedTail,
  feedVerdict,
  FOLLOW_STEPS,
  OPEN_STEPS,
  perSecondText,
  rateInWords,
  ring,
  USER_STEPS,
} from "@buildment/learning-ui/canvas/models/feed-estimate";
import {
  edgesOf,
  fanout,
  fanoutValueText,
  fanoutVerdict,
  followsPerReader,
  GROUPS,
  lineName,
  percentOne,
  slowestText,
  stopLabel,
  writesPerDay,
} from "@buildment/learning-ui/canvas/models/fanout-line";
import { engagement, HALF_LIVES, rankPosts, rankValueText, rankVerdict } from "@buildment/learning-ui/canvas/models/rank-score";
import { sysdesignM21EstimatePlay } from "@buildment/learning-ui/canvas/sysdesign-m21-estimate-play/data";
import { sysdesignM21ActionMap } from "@buildment/learning-ui/canvas/sysdesign-m21-action-map/data";
import { sysdesignM21FanoutPlay } from "@buildment/learning-ui/canvas/sysdesign-m21-fanout-play/data";
import { sysdesignM21RankPlay } from "@buildment/learning-ui/canvas/sysdesign-m21-rank-play/data";

const MAX = 38;

describe("m21 estimate model (21.1)", () => {
  const row = (users: number, opens: number, follows: number) => feedEstimate({ users, opens, follows });

  it("matches the spec's table", () => {
    const base = row(50e6, 10, 150);
    expect(Math.round(base.opensPeak)).toBe(17_361);
    expect(Math.round(base.postsPeak)).toBe(347);
    expect(base.lookupsPeak / 1e6).toBeCloseTo(2.6, 1);
    expect(base.storageBytes).toBe(320e9);
    expect(base.readsPerPost).toBe(50);

    expect(Math.round(row(10e6, 10, 150).opensPeak)).toBe(3_472);
    expect(Math.round(row(10e6, 10, 150).postsPeak)).toBe(69);
    expect(row(10e6, 10, 150).lookupsPeak).toBeCloseTo(521_000, -3);
    expect(row(10e6, 10, 150).storageBytes).toBe(64e9);
    expect(Math.round(row(25e6, 10, 150).opensPeak)).toBe(8_681);
    expect(Math.round(row(25e6, 10, 150).postsPeak)).toBe(174);
    expect(row(25e6, 10, 150).lookupsPeak / 1e6).toBeCloseTo(1.3, 1);
    expect(row(25e6, 10, 150).storageBytes).toBe(160e9);
    expect(Math.round(row(100e6, 10, 150).opensPeak)).toBe(34_722);
    expect(Math.round(row(100e6, 10, 150).postsPeak)).toBe(694);
    expect(row(100e6, 10, 150).lookupsPeak / 1e6).toBeCloseTo(5.21, 2);
    expect(row(100e6, 10, 150).storageBytes).toBe(640e9);

    expect(Math.round(row(50e6, 2, 150).opensPeak)).toBe(3_472);
    expect(row(50e6, 2, 150).lookupsPeak).toBeCloseTo(521_000, -3);
    expect(row(50e6, 2, 150).readsPerPost).toBe(10);
    expect(Math.round(row(50e6, 1, 150).opensPeak)).toBe(1_736);
    expect(row(50e6, 1, 150).lookupsPeak).toBeCloseTo(260_000, -3);
    expect(row(50e6, 1, 150).readsPerPost).toBe(5);
    expect(Math.round(row(50e6, 5, 150).opensPeak)).toBe(8_681);
    expect(row(50e6, 5, 150).readsPerPost).toBe(25);
    expect(Math.round(row(50e6, 20, 150).opensPeak)).toBe(34_722);
    expect(row(50e6, 20, 150).lookupsPeak / 1e6).toBeCloseTo(5.21, 2);
    expect(row(50e6, 20, 150).readsPerPost).toBe(100);
    expect(row(50e6, 10, 50).lookupsPeak).toBeCloseTo(868_000, -3);
    expect(row(50e6, 10, 500).lookupsPeak / 1e6).toBeCloseTo(8.68, 2);
    expect(Math.round(row(10e6, 1, 50).opensPeak)).toBe(347);
    expect(Math.round(row(10e6, 1, 50).postsPeak)).toBe(69);
    expect(row(10e6, 1, 50).lookupsPeak).toBeCloseTo(17_400, -2);
    expect(row(10e6, 1, 50).readsPerPost).toBe(5);
  });

  it("rings the lookups, then the peak opens, then nothing", () => {
    expect(ring(row(50e6, 10, 150))).toBe("lookups");
    expect(ring(row(10e6, 1, 50))).toBe("none");
    // 100,000 lookups or more wins over the opens card.
    expect(ring(row(10e6, 5, 50))).toBe("opens");
    expect(ring(row(10e6, 5, 500))).toBe("lookups");
  });

  it("picks the verdict from reads per post and keeps every verdict short", () => {
    expect(feedVerdict(row(50e6, 10, 150))).toEqual({ text: "Reads dwarf posts: build ahead", tone: "warn" });
    expect(feedVerdict(row(50e6, 5, 150)).text).toBe("Reads dwarf posts: build ahead");
    expect(feedVerdict(row(50e6, 2, 150))).toEqual({ text: "Reads lead: building ahead pays", tone: "warn" });
    expect(feedVerdict(row(50e6, 1, 150))).toEqual({ text: "Close: building on read could work", tone: "good" });
    for (const users of USER_STEPS) for (const opens of OPEN_STEPS) for (const follows of FOLLOW_STEPS) {
      expect(feedVerdict(row(users, opens, follows)).text.length).toBeLessThanOrEqual(MAX);
    }
  });

  it("writes rates as the spec's cards and sentences", () => {
    expect(perSecondText(17_361.1)).toBe("17,361 /s");
    expect(perSecondText(2_604_166)).toBe("2.6M /s");
    expect(perSecondText(347.2)).toBe("347 /s");
    expect(rateInWords(2_604_166)).toBe("2.6 million");
    expect(feedTail(row(50e6, 10, 150))).toBe("17,361 feed opens a second at peak, 347 posts a second, 2.6 million lookups a second if built on read");
  });

  it("flows faster for bigger values and stays within the dot speed range", () => {
    const small = chainRates(row(10e6, 1, 50));
    const big = chainRates(row(100e6, 20, 500));
    expect(big.lookups).toBeGreaterThan(small.lookups);
    expect(big.opensPeak).toBeGreaterThan(small.opensPeak);
    for (const v of [...Object.values(small), ...Object.values(big)]) {
      expect(v).toBeGreaterThanOrEqual(0.3);
      expect(v).toBeLessThanOrEqual(6);
    }
  });
});

describe("m21 action map model (21.2)", () => {
  it("computes the four peak rates", () => {
    expect(Math.round(actionRate("feed"))).toBe(17_361);
    expect(Math.round(actionRate("profile"))).toBe(8_681);
    expect(Math.round(actionRate("publish"))).toBe(347);
    expect(Math.round(actionRate("follow"))).toBe(174);
  });

  it("puts the spec's pill on each touched block", () => {
    const text = (a: Parameters<typeof actionPills>[0]) => Object.fromEntries(actionPills(a).map((p) => [p.block, p.text]));
    expect(text("feed")).toEqual({ gateway: "17,361 /s", feed: "17,361 /s", timelines: "17,361 reads/s", posts: "17,361 reads/s" });
    expect(text("profile")).toEqual({ gateway: "8,681 /s", post: "8,681 /s", posts: "8,681 reads/s" });
    expect(text("publish")).toEqual({
      gateway: "347 /s",
      post: "347 /s",
      timelines: "52,000 writes/s",
      posts: "347 writes/s",
      follows: "347 reads/s",
      queue: "347 events/s",
      workers: "347 jobs/s",
    });
    expect(text("follow")).toEqual({ gateway: "174 /s", follows: "347 writes/s" });
  });

  it("warns on the publish timelines pill and tags it 21.3", () => {
    const timelines = actionPills("publish").find((p) => p.block === "timelines");
    expect(timelines?.tone).toBe("warn");
    expect(timelines?.tag).toBe("21.3");
    for (const a of ACTION_IDS) for (const p of actionPills(a)) {
      expect(p.text.length, p.text).toBeLessThanOrEqual(15);
      if (!(a === "publish" && p.block === "timelines")) expect(p.tag).toBeUndefined();
    }
  });

  it("touches only blocks that the lit links reach, and only real links", () => {
    const hops = new Set(HOPS.map(hopKey));
    const ends = new Map(HOPS.map((h) => [hopKey(h), h]));
    for (const a of ACTION_IDS) {
      const touched = new Set(actionPills(a).map((p) => p.block));
      const reached = new Set<string>(["gateway"]);
      for (const key of ACTION_HOPS[a]) {
        expect(hops.has(key), key).toBe(true);
        const h = ends.get(key)!;
        reached.add(h.from);
        reached.add(h.to);
      }
      expect([...touched].sort()).toEqual([...reached].sort());
    }
  });

  it("uses three dot speeds by rate", () => {
    expect(speedClass(347)).toBe(1);
    expect(speedClass(999)).toBe(1);
    expect(speedClass(1_000)).toBe(2);
    expect(speedClass(8_681)).toBe(2);
    expect(speedClass(10_000)).toBe(2);
    expect(speedClass(17_361)).toBe(3);
    expect(speedClass(52_000)).toBe(3);
  });

  it("keeps the verdicts the spec gives, all within 38 characters", () => {
    expect(ACTION_IDS.map((a) => actionVerdict(a).text)).toEqual([
      "Open feed: few blocks, very often",
      "Open profile: one read path",
      "Publish: many blocks, 350 a second",
      "Follow: two small writes",
    ]);
    expect(actionVerdict("publish").tone).toBe("warn");
    for (const a of ACTION_IDS) expect(actionVerdict(a).text.length).toBeLessThanOrEqual(MAX);
  });

  it("reads each pill out in words and keeps captions short", () => {
    expect(actionWords("feed")).toContain("Timeline cache and store: 17,361 list reads a second");
    expect(actionWords("publish")).toContain("52,000 timeline writes if each author has 150 followers a second");
    for (const a of ACTION_IDS) for (const line of actionCaption(a)) expect(line.length, line).toBeLessThanOrEqual(56);
  });

  it("places eight blocks on the grid without overlap", () => {
    expect(BLOCKS.length).toBe(8);
    for (let i = 0; i < BLOCKS.length; i++) for (let j = i + 1; j < BLOCKS.length; j++) {
      const a = BLOCKS[i];
      const b = BLOCKS[j];
      const apart = Math.abs(a.x - b.x) >= 112 + 16 || Math.abs(a.y - b.y) >= 60 + 12;
      expect(apart, `${a.id} and ${b.id}`).toBe(true);
    }
  });
});

describe("m21 fan-out model (21.3)", () => {
  it("builds the group table", () => {
    expect(GROUPS.map(edgesOf)).toEqual([8e9, 4e9, 1e9, 1e9, 1e9]);
    expect(GROUPS.map((g) => writesPerDay(g) / 1e9)).toEqual([0.88, 1, 1, 2, 4].map((n) => expect.closeTo(n, 5)));
    expect(GROUPS.map(followsPerReader)).toEqual([80, 40, 10, 10, 10]);
    expect(GROUPS.reduce((a, g) => a + edgesOf(g), 0)).toBe(15e9);
    expect(GROUPS.reduce((a, g) => a + g.accounts * g.postsPerDay, 0)).toBeCloseTo(9.9e6, -5);
  });

  it("matches the spec's table at each line position", () => {
    const at = (pushed: number) => fanout(pushed);
    const nobody = at(5);
    expect(Math.round(nobody.writesPerSecond)).toBe(308_333);
    expect(Math.round(nobody.planShare * 100)).toBe(206);
    expect(nobody.lookups).toBe(1);
    expect(percentOne(nobody.slowShare)).toBe("1.0%");
    expect(slowestText(nobody.slowestSeconds)).toBe("133 s");

    const celebrity = at(4);
    expect(Math.round(celebrity.writesPerSecond)).toBe(169_444);
    expect(Math.round(celebrity.planShare * 100)).toBe(113);
    expect(celebrity.lookups).toBe(11);
    expect(percentOne(celebrity.slowShare)).toBe("10.5%");
    expect(slowestText(celebrity.slowestSeconds)).toBe("0.7 s");

    const big = at(3);
    expect(Math.round(big.writesPerSecond)).toBe(100_000);
    expect(Math.round(big.planShare * 100)).toBe(67);
    expect(big.lookups).toBe(21);
    expect(percentOne(big.slowShare)).toBe("19.0%");
    expect(slowestText(big.slowestSeconds)).toBe("0.07 s");

    const popular = at(2);
    expect(Math.round(popular.writesPerSecond)).toBe(65_278);
    expect(Math.round(popular.planShare * 100)).toBe(44);
    expect(popular.lookups).toBe(31);
    expect(percentOne(popular.slowShare)).toBe("26.8%");
    expect(slowestText(popular.slowestSeconds)).toBe("under 0.01 s");

    const local = at(1);
    expect(Math.round(local.writesPerSecond)).toBe(30_556);
    expect(Math.round(local.planShare * 100)).toBe(20);
    expect(local.lookups).toBe(71);
    expect(percentOne(local.slowShare)).toBe("51.0%");
    expect(slowestText(local.slowestSeconds)).toBe("under 0.01 s");

    const everyone = at(0);
    expect(everyone.writesPerSecond).toBe(0);
    expect(everyone.planShare).toBe(0);
    expect(everyone.lookups).toBe(151);
    expect(percentOne(everyone.slowShare)).toBe("78.1%");
    expect(slowestText(everyone.slowestSeconds)).toContain("none");
  });

  it("passes both limits only at the Big position", () => {
    const ok = [0, 1, 2, 3, 4, 5].filter((n) => !fanout(n).writesOver && !fanout(n).readsOver);
    expect(ok).toEqual([3]);
  });

  it("gives the verdict the spec lists for each state, within 38 characters", () => {
    expect(fanoutVerdict(fanout(5))).toEqual({ text: "Writes too heavy: pull more accounts", tone: "bad" });
    expect(fanoutVerdict(fanout(4)).text).toBe("Writes too heavy: pull more accounts");
    expect(fanoutVerdict(fanout(3))).toEqual({ text: "Both within limits: the hybrid works", tone: "good" });
    expect(fanoutVerdict(fanout(2))).toEqual({ text: "Reads too slow: push more accounts", tone: "bad" });
    expect(fanoutVerdict(fanout(0)).text).toBe("Reads too slow: push more accounts");
    // Not reachable with these groups: both gauges over their limits.
    expect(fanoutVerdict({ ...fanout(5), readsOver: true }).text).toBe("Both over: widen the budget");
    for (let n = 0; n <= 5; n++) expect(fanoutVerdict(fanout(n)).text.length).toBeLessThanOrEqual(MAX);
    expect("Both over: widen the budget".length).toBeLessThanOrEqual(MAX);
  });

  it("names the line and writes the slider's value text", () => {
    expect(lineName(5)).toBe("push everyone");
    expect(lineName(0)).toBe("pull everyone");
    expect(lineName(3)).toBe("pull accounts with 100,000 followers or more");
    expect(fanoutValueText(fanout(3))).toBe(
      "pull accounts with 100,000 followers or more: 100,000 writes a second, 67 percent of plan, 21 lookups per feed open, 19 percent of feed opens meet a slow lookup"
    );
    expect(stopLabel(5)).toEqual(["pull", "none"]);
    expect(stopLabel(4)).toEqual(["pull", "1M+"]);
    expect(stopLabel(0)).toEqual(["pull", "all"]);
  });

  it("clamps the line to the six positions", () => {
    expect(fanout(-3).pushed).toBe(0);
    expect(fanout(9).pushed).toBe(5);
  });
});

describe("m21 ranking model (21.4)", () => {
  const order = (h: number) => rankPosts(h).map((p) => p.id);
  const scores = (h: number) => Object.fromEntries(rankPosts(h).map((p) => [p.id, Math.round(p.score * 100) / 100]));

  it("computes the engagement term", () => {
    expect(engagement(6)).toBeCloseTo(2.95, 2);
    expect(engagement(400_000)).toBeCloseTo(13.9, 1);
    expect(engagement(40)).toBeCloseTo(4.71, 2);
    expect(engagement(3)).toBeCloseTo(2.39, 2);
    expect(engagement(2_000)).toBeCloseTo(8.6, 1);
    expect(engagement(0)).toBe(1);
  });

  it("matches the spec's order and scores at each half-life", () => {
    expect(order(1)).toEqual(["dina", "news", "bakery", "omar", "karim"]);
    expect(order(3)).toEqual(["dina", "news", "bakery", "omar", "karim"]);
    expect(order(6)).toEqual(["dina", "news", "bakery", "karim", "omar"]);
    expect(order(12)).toEqual(["news", "dina", "karim", "omar", "bakery"]);
    expect(order(24)).toEqual(["karim", "news", "dina", "omar", "bakery"]);
    expect(order(48)).toEqual(["karim", "news", "dina", "omar", "bakery"]);

    expect(scores(1)).toMatchObject({ dina: 1.47, news: 0.43, bakery: 0.04, omar: 0, karim: 0 });
    expect(scores(3)).toMatchObject({ dina: 2.34, news: 1.72, bakery: 0.45, omar: 0.24, karim: 0.07 });
    expect(scores(6)).toMatchObject({ dina: 2.62, news: 2.43, bakery: 0.79, karim: 0.69, omar: 0.67 });
    expect(scores(12)).toMatchObject({ news: 2.89, dina: 2.78, karim: 2.19, omar: 1.14, bakery: 1.06 });
    expect(scores(24)).toMatchObject({ karim: 3.9, news: 3.16, dina: 2.86, omar: 1.47, bakery: 1.22 });
    expect(scores(48)).toMatchObject({ karim: 5.21, news: 3.29, dina: 2.9, omar: 1.68, bakery: 1.32 });
  });

  it("numbers the ranks from 0 with no gaps", () => {
    for (const h of HALF_LIVES) expect(rankPosts(h).map((p) => p.rank)).toEqual([0, 1, 2, 3, 4]);
  });

  it("picks the verdict from the top post, all within 38 characters", () => {
    const top = (h: number) => rankVerdict(rankPosts(h)[0]);
    expect(top(1)).toEqual({ text: "Fresh friends lead", tone: "good" });
    expect(top(6).text).toBe("Fresh friends lead");
    expect(top(12)).toEqual({ text: "Popular recent news leads", tone: "warn" });
    expect(top(24)).toEqual({ text: "Old but popular posts climb", tone: "warn" });
    for (const h of HALF_LIVES) expect(top(h).text.length).toBeLessThanOrEqual(MAX);
  });

  it("writes the slider's value text", () => {
    expect(rankValueText(12, rankPosts(12))).toBe("half-life 12 hours: Daily News first, then Dina, Karim, Omar, Bakery");
    expect(rankValueText(1, rankPosts(1))).toBe("half-life 1 hour: Dina first, then Daily News, Bakery, Omar, Karim");
  });
});

describe("m21 playable canvases render on the server", () => {
  const specs = [sysdesignM21EstimatePlay, sysdesignM21ActionMap, sysdesignM21FanoutPlay, sysdesignM21RankPlay];
  const html = (s: (typeof specs)[number]) => renderToString(createElement(s.component, { title: s.title, purpose: s.purpose, limits: s.limits })).replaceAll("<!-- -->", "");

  it("draws an svg and the limits fold, with no hex colours", () => {
    for (const spec of specs) {
      const out = html(spec);
      expect(out, spec.title).toContain("<svg");
      expect(out, spec.title).toContain("What this picture leaves out");
      expect(out, spec.title).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(out, spec.title).not.toMatch(/foreignObject|<animate|<use|<image/);
    }
  });

  it("shows the starting verdicts", () => {
    expect(html(sysdesignM21EstimatePlay)).toContain("Reads dwarf posts: build ahead");
    expect(html(sysdesignM21ActionMap)).toContain("Open feed: few blocks, very often");
    expect(html(sysdesignM21FanoutPlay)).toContain("Writes too heavy: pull more accounts");
    expect(html(sysdesignM21RankPlay)).toContain("Fresh friends lead");
  });

  it("puts a slider on every drag and a button on every tap", () => {
    expect((html(sysdesignM21EstimatePlay).match(/role="slider"/g) ?? []).length).toBe(3);
    expect((html(sysdesignM21FanoutPlay).match(/role="slider"/g) ?? []).length).toBe(1);
    expect((html(sysdesignM21RankPlay).match(/role="slider"/g) ?? []).length).toBe(1);
    expect((html(sysdesignM21ActionMap).match(/role="button"/g) ?? []).length).toBe(4);
    expect((html(sysdesignM21RankPlay).match(/role="button"/g) ?? []).length).toBe(5);
  });

  it("gives the sliders the spec's value text", () => {
    expect(html(sysdesignM21EstimatePlay)).toContain("50 million daily users, 17,361 feed opens a second at peak, 347 posts a second, 2.6 million lookups a second if built on read");
    expect(html(sysdesignM21FanoutPlay)).toContain("push everyone: 308,333 writes a second, 206 percent of plan, 1 lookup per feed open, 1 percent of feed opens meet a slow lookup");
    expect(html(sysdesignM21RankPlay)).toContain("half-life 6 hours: Dina first, then Daily News, Bakery, Karim, Omar");
  });

  it("labels the action chips and reads the pills out", () => {
    const out = html(sysdesignM21ActionMap);
    for (const label of ["Open feed", "Open profile", "Publish a post", "Follow"]) expect(out).toContain(`aria-label="${label}"`);
    expect(out).toContain("Timeline cache and store: 17,361 list reads a second");
  });
});
