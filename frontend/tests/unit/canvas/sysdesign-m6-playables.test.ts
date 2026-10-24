import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  API_STYLES,
  DEFAULT_WEIGHTS,
  MAX_TOTAL,
  PRESETS,
  matchingPreset,
  nextWeight,
  styleVerdict,
  totals,
  type Weights,
} from "@/canvas/models/api-style-weigh";
import {
  CHANGES,
  changeFromFraction,
  changeToFraction,
  changedList,
  pageTwo,
  pagingState,
  pagingVerdict,
  slotOf,
  type Change,
  type PagingMode,
} from "@/canvas/models/paging-insert";
import {
  KEY_MODES,
  PROVIDER,
  PROVIDER_LADDER,
  chargesBy,
  clampProvider,
  keyStoreAt,
  phoneAt,
  retryVerdict,
  runRetries,
  waitingAt,
  type KeyMode,
} from "@/canvas/models/retry-key";
import { B_LADDER, LIMITERS, allowedInB, burstVerdict, clock, leakyDelays, leakyQueued, limiterRows } from "@/canvas/models/limiter-burst";
import { DEFAULT_JOBS, JOBS, gatewayOutcome, gatewayVerdict, toggleJob, type Jobs } from "@/canvas/models/gateway-jobs";
import {
  LANES,
  LIFETIME,
  LIFETIME_LADDER,
  axisFraction,
  gapSeconds,
  laneDots,
  laneLabel,
  lifetimeFromFraction,
  lifetimeToFraction,
  revokeVerdict,
} from "@/canvas/models/revoke-timeline";
import { sysdesignM6ApiStyleWeigh } from "@/canvas/sysdesign-m6-api-style-weigh/data";
import { sysdesignM6PagingInsert } from "@/canvas/sysdesign-m6-paging-insert/data";
import { sysdesignM6RetryKey } from "@/canvas/sysdesign-m6-retry-key/data";
import { sysdesignM6LimiterBurst } from "@/canvas/sysdesign-m6-limiter-burst/data";
import { sysdesignM6GatewayJobs } from "@/canvas/sysdesign-m6-gateway-jobs/data";
import { sysdesignM6RevokeTimeline } from "@/canvas/sysdesign-m6-revoke-timeline/data";

const MAX_VERDICT = 38;
const DASH = String.fromCharCode(0x2014);

describe("6.2 API style weights", () => {
  it("adds weight x score for each style (the chapter's worked totals)", () => {
    const row = (w: Weights) => API_STYLES.map((s) => totals(w)[s.id]);
    expect(row(PRESETS[0].weights)).toEqual([37, 26, 15]);
    expect(row(PRESETS[1].weights)).toEqual([21, 24, 15]);
    expect(row(PRESETS[2].weights)).toEqual([13, 14, 21]);
    expect(DEFAULT_WEIGHTS).toEqual(PRESETS[0].weights);
  });

  it("names the winner when it leads by 2 or more, and calls a smaller lead close", () => {
    expect(styleVerdict(PRESETS[0].weights).text).toBe("REST wins: reach and caching");
    expect(styleVerdict(PRESETS[1].weights).text).toBe("GraphQL wins: one trip per screen");
    expect(styleVerdict(PRESETS[2].weights).text).toBe("gRPC wins: small typed calls");
    expect(styleVerdict([0, 0, 0, 0, 0]).text).toBe("Close: pick what your team runs");
    // Easy to run and few round trips, both only "nice": REST 7, GraphQL 8, gRPC 6.
    const close = styleVerdict([0, 1, 0, 0, 1]);
    expect(close.close).toBe(true);
    expect(close.top).toEqual(["graphql", "rest"]);
  });

  it("cycles a weight skip, nice, must and round again; presets match until a weight changes", () => {
    expect(nextWeight(0)).toBe(1);
    expect(nextWeight(1)).toBe(3);
    expect(nextWeight(3)).toBe(0);
    expect(matchingPreset(PRESETS[1].weights)).toBe("mobile");
    expect(matchingPreset([3, 1, 0, 3, 3])).toBeNull();
  });

  it("keeps every total inside the bar and every verdict short", () => {
    for (const p of PRESETS) for (const s of API_STYLES) expect(totals(p.weights)[s.id]).toBeLessThanOrEqual(MAX_TOTAL);
    for (const a of [0, 1, 3]) for (const b of [0, 1, 3]) for (const c of [0, 1, 3]) {
      const v = styleVerdict([a, b, c, a, b] as Weights);
      expect(v.text.length).toBeLessThanOrEqual(MAX_VERDICT);
    }
  });
});

describe("6.3 paging while the list changes", () => {
  const offset = (k: Change) => pageTwo(k, "offset");
  it("gives the chapter's offset page 2 for each change", () => {
    expect(offset(-1)).toEqual([5, 4, 3]);
    expect(offset(0)).toEqual([6, 5, 4]);
    expect(offset(1)).toEqual([7, 6, 5]);
    expect(offset(2)).toEqual([8, 7, 6]);
    expect(offset(3)).toEqual([9, 8, 7]);
  });

  it("gives the cursor the same page 2 whatever changed", () => {
    for (const k of CHANGES) expect(pageTwo(k, "cursor")).toEqual([6, 5, 4]);
  });

  it("marks repeats amber and the skipped book red, only for offset", () => {
    expect(pagingState(1, "offset").repeated).toEqual([7]);
    expect(pagingState(2, "offset").repeated).toEqual([8, 7]);
    expect(pagingState(3, "offset").repeated).toEqual([9, 8, 7]);
    expect(pagingState(-1, "offset").skipped).toEqual([6]);
    expect(pagingState(0, "offset").repeated).toEqual([]);
    for (const k of CHANGES) {
      const s = pagingState(k, "cursor");
      expect(s.repeated).toEqual([]);
      expect(s.skipped).toEqual([]);
    }
  });

  it("says each verdict in 38 characters or fewer", () => {
    const modes: PagingMode[] = ["offset", "cursor"];
    for (const k of CHANGES) for (const m of modes) expect(pagingVerdict(k, m).text.length).toBeLessThanOrEqual(MAX_VERDICT);
    expect(pagingVerdict(1, "offset").text).toBe("Offset: book 7 shown twice");
    expect(pagingVerdict(2, "offset").text).toBe("Offset: books 8 and 7 twice");
    expect(pagingVerdict(3, "offset").text).toBe("Offset: all of page 1 again");
    expect(pagingVerdict(-1, "offset").text).toBe("Offset: book 6 never shown");
    expect(pagingVerdict(0, "offset").text).toBe("No change: both pages are right");
    expect(pagingVerdict(2, "cursor").text).toBe("Cursor: no repeats, no gaps");
  });

  it("lays the list out so new books enter at the top and a deleted book keeps a ghost row", () => {
    expect(changedList(2)).toEqual([11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
    expect(changedList(-1)).toEqual([9, 7, 6, 5, 4, 3, 2, 1]);
    expect(slotOf(11, 2)).toBe(0);
    expect(slotOf(9, 2)).toBe(2);
    expect(slotOf(8, -1)).toBe(1);
    expect(slotOf(12, 2)).toBeNull();
    const s = pagingState(2, "offset");
    expect(s.pageOneSlots).toEqual([2, 4]);
    expect(s.pageTwoSlots).toEqual([3, 5]);
    expect(pagingState(-1, "offset").books.find((b) => b.book === 8)?.deleted).toBe(true);
  });

  it("snaps the rail to the five changes", () => {
    expect(changeFromFraction(0)).toBe(-1);
    expect(changeFromFraction(0.5)).toBe(1);
    expect(changeFromFraction(1)).toBe(3);
    expect(changeFromFraction(Number.NaN)).toBe(-1);
    for (const k of CHANGES) expect(changeFromFraction(changeToFraction(k))).toBe(k);
  });
});

describe("6.4 retry with and without a key", () => {
  const charges = (p: number, mode: KeyMode) => runRetries(p, mode).charges.length;
  it("counts the chapter's charges for no key, check then save, claim first", () => {
    expect([charges(200, "none"), charges(200, "check"), charges(200, "claim")]).toEqual([1, 1, 1]);
    expect([charges(280, "none"), charges(280, "check"), charges(280, "claim")]).toEqual([4, 1, 1]);
    expect([charges(450, "none"), charges(450, "check"), charges(450, "claim")]).toEqual([4, 2, 1]);
    expect([charges(600, "none"), charges(600, "check"), charges(600, "claim")]).toEqual([4, 2, 1]);
  });

  it("starts tries at 0, 300, 600, 900 with no key and at 0, 300, 500, 700 when claiming", () => {
    expect(runRetries(450, "none").tries.map((t) => t.start)).toEqual([0, 300, 600, 900]);
    expect(runRetries(600, "claim").tries.map((t) => t.start)).toEqual([0, 300, 500, 700]);
    expect(runRetries(450, "claim").tries.map((t) => t.start)).toEqual([0, 300, 500]);
    expect(runRetries(450, "claim").tries.map((t) => t.outcome)).toEqual(["timeout", "conflict", "saved"]);
    expect(runRetries(600, "claim").tries.map((t) => t.outcome)).toEqual(["timeout", "conflict", "conflict", "saved"]);
  });

  it("confirms by the right try: claim on try 2, 3 or 4; check on try 3; no key never", () => {
    expect(runRetries(280, "claim").confirmedAt).toBe(300);
    expect(runRetries(450, "claim").confirmedAt).toBe(500);
    expect(runRetries(600, "claim").confirmedAt).toBe(700);
    expect(runRetries(450, "check").confirmedAt).toBe(600);
    expect(runRetries(280, "check").confirmedAt).toBe(300);
    expect(runRetries(450, "none").confirmedAt).toBeNull();
    expect(runRetries(200, "none").confirmedAt).toBe(200);
  });

  it("lands each charge at try start + provider time, even after the app stopped waiting", () => {
    const run = runRetries(450, "none");
    expect(run.charges).toEqual([450, 750, 1050, 1350]);
    expect(chargesBy(run, 449)).toBe(0);
    expect(chargesBy(run, 750)).toBe(2);
    expect(run.endAt).toBe(1150);
    expect(runRetries(100, "none").charges).toEqual([100]);
  });

  it("says the chapter's verdicts in 38 characters or fewer", () => {
    expect(retryVerdict(runRetries(200, "claim")).text).toBe("Answer in time: 1 charge, any mode");
    expect(retryVerdict(runRetries(450, "none")).text).toBe("No key: 4 charges, app says failed");
    expect(retryVerdict(runRetries(280, "check")).text).toBe("Saved in time: 1 charge");
    expect(retryVerdict(runRetries(450, "check")).text).toBe("Check, then save: 2 charges");
    expect(retryVerdict(runRetries(450, "claim")).text).toBe("Claim first: 1 charge, always");
    for (const p of PROVIDER_LADDER) for (const m of KEY_MODES) expect(retryVerdict(runRetries(p, m.id)).text.length).toBeLessThanOrEqual(MAX_VERDICT);
  });

  it("clamps the provider time to 100 to 600 in steps of 10", () => {
    expect(clampProvider(-5)).toBe(PROVIDER.min);
    expect(clampProvider(9000)).toBe(PROVIDER.max);
    expect(clampProvider(Number.NaN)).toBe(PROVIDER.default);
    expect(clampProvider(283)).toBe(280);
    expect(PROVIDER_LADDER).toHaveLength(51);
  });

  it("reports the key store, the phone and the wait ring over time", () => {
    const run = runRetries(450, "claim");
    expect(keyStoreAt(run, 100).text).toBe("key: pending");
    expect(keyStoreAt(run, 450).text).toBe("key: done");
    expect(keyStoreAt(runRetries(450, "none"), 0).text).toBe("no key store");
    expect(phoneAt(run, 100).text).toBe("waiting");
    expect(phoneAt(run, 500).text).toBe("paid");
    expect(phoneAt(runRetries(450, "none"), 1200).text).toBe("app says failed");
    expect(waitingAt(run, 125)).toEqual({ n: 1, fraction: 0.5 });
    expect(waitingAt(run, 275)).toBeNull();
  });
});

describe("6.5 five limiters, one burst", () => {
  const row = (b: number) => LIMITERS.map((l) => allowedInB(l.id, b));
  it("gives the chapter's accepted counts (fixed, log, counter, token, leaky)", () => {
    expect(row(59)).toEqual([0, 0, 0, 0, 1]);
    expect(row(60)).toEqual([5, 0, 0, 0, 1]);
    expect(row(75)).toEqual([5, 0, 1, 1, 2]);
    expect(row(90)).toEqual([5, 0, 2, 2, 3]);
    expect(row(119)).toEqual([5, 5, 4, 5, 5]);
  });

  it("keeps the leaky bucket's waiting requests and delays consistent", () => {
    expect(leakyQueued(59)).toBe(4);
    expect(leakyQueued(119)).toBe(0);
    expect(leakyDelays(59)).toEqual([48]);
    expect(leakyDelays(119)).toEqual([0, 12, 24, 36, 48]);
    expect(limiterRows(75).map((r) => r.refused)).toEqual([0, 5, 4, 4, 3]);
  });

  it("stays inside 0 to 5 at every second of the rail", () => {
    for (const b of B_LADDER) for (const v of row(b)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(5);
    }
    expect(B_LADDER[0]).toBe(59);
    expect(B_LADDER[B_LADDER.length - 1]).toBe(119);
  });

  it("says the chapter's verdicts and formats times", () => {
    expect(burstVerdict(59).text).toBe("Same window: nobody allows more");
    expect(burstVerdict(60).text).toBe("Only the fixed window let 10 in");
    expect(burstVerdict(74).text).toBe("Only the fixed window let 10 in");
    expect(burstVerdict(75).text).toBe("Others allow only what has expired");
    expect(burstVerdict(118).text).toBe("Others allow only what has expired");
    expect(burstVerdict(119).text).toBe("A full minute later: all allow 5");
    for (const b of B_LADDER) expect(burstVerdict(b).text.length).toBeLessThanOrEqual(MAX_VERDICT);
    expect(clock(59)).toBe("0:59");
    expect(clock(119)).toBe("1:59");
  });
});

describe("6.6 gateway jobs", () => {
  const off = (...ids: (keyof Jobs)[]): Jobs => ids.reduce((j, id) => toggleJob(j, id), DEFAULT_JOBS);
  it("starts as a thin gateway with five jobs on", () => {
    expect(gatewayVerdict(DEFAULT_JOBS).text).toBe("Thin gateway: checks, then routes");
    expect(gatewayOutcome(DEFAULT_JOBS).path).toEqual(["tls", "token", "limit", "id", "routing"]);
    expect(gatewayOutcome(DEFAULT_JOBS).stoppedAt).toEqual({ huda: null, scraper: "limit", stranger: "token" });
  });

  it("lets the wrong request in when its check is off", () => {
    expect(gatewayOutcome(off("token")).strangerGetsIn).toBe(true);
    expect(gatewayOutcome(off("limit")).scraperFloods).toBe(true);
    expect(gatewayOutcome(off("tls")).readableOnWire).toBe(true);
    expect(gatewayOutcome(off("id")).noRequestId).toBe(true);
    expect(gatewayOutcome(toggleJob(DEFAULT_JOBS, "order")).gatewayCopiesOrders).toBe(true);
  });

  it("bypasses the gateway when routing is off", () => {
    const o = gatewayOutcome(off("routing"));
    expect(o.clientsKnowServices).toBe(true);
    expect(o.path).toEqual([]);
    expect(o.strangerGetsIn).toBe(true);
  });

  it("picks the first matching verdict in the chapter's order", () => {
    expect(gatewayVerdict(off("token")).text).toBe("Anyone can call payments");
    expect(gatewayVerdict(off("token", "limit")).text).toBe("Anyone can call payments");
    expect(gatewayVerdict(off("limit")).text).toBe("Scraper floods search");
    expect(gatewayVerdict(off("tls", "routing")).text).toBe("Traffic readable on the wire");
    expect(gatewayVerdict(off("routing", "id")).text).toBe("Client must know every service");
    expect(gatewayVerdict(off("id")).text).toBe("No id to trace this request");
    expect(gatewayVerdict(toggleJob(DEFAULT_JOBS, "order")).text).toBe("Gateway now needs every order");
  });

  it("keeps every verdict short, over all 64 settings", () => {
    for (let mask = 0; mask < 64; mask++) {
      const jobs = Object.fromEntries(JOBS.map((j, i) => [j.id, Boolean(mask & (1 << i))])) as Jobs;
      expect(gatewayVerdict(jobs).text.length).toBeLessThanOrEqual(MAX_VERDICT);
    }
  });
});

describe("6.7 revoking a seller", () => {
  it("gives the chapter's gaps for sessions, tokens alone and a denylist", () => {
    expect([gapSeconds("sessions", 15), gapSeconds("tokens", 15), gapSeconds("denylist", 15)]).toEqual([0, 900, 10]);
    expect([gapSeconds("sessions", 60), gapSeconds("tokens", 60), gapSeconds("denylist", 60)]).toEqual([0, 3600, 10]);
    expect([gapSeconds("sessions", 1), gapSeconds("tokens", 1), gapSeconds("denylist", 1)]).toEqual([0, 60, 10]);
  });

  it("puts 1 second at the left and 60 minutes at the right of the log axis, with 1 minute in the middle", () => {
    expect(axisFraction(1)).toBe(0);
    expect(axisFraction(3600)).toBe(1);
    expect(axisFraction(60)).toBeCloseTo(0.5, 10);
    expect(lifetimeToFraction(1)).toBe(0);
    expect(lifetimeToFraction(60)).toBe(1);
  });

  it("snaps the rail to 1, 5, 15 and 60 minutes and clamps the ends", () => {
    for (const s of LIFETIME.snaps) expect(lifetimeFromFraction(lifetimeToFraction(s))).toBe(s);
    expect(lifetimeFromFraction(-1)).toBe(1);
    expect(lifetimeFromFraction(2)).toBe(60);
    expect(lifetimeFromFraction(Number.NaN)).toBe(1);
    expect(LIFETIME_LADDER).toHaveLength(60);
  });

  it("turns requests green while the design accepts them and red after", () => {
    const sessions = laneDots("sessions", 15);
    expect(sessions.every((d) => !d.accepted)).toBe(true);
    const tokens = laneDots("tokens", 15);
    expect(tokens[0].accepted).toBe(true);
    expect(tokens[tokens.length - 1].accepted).toBe(false);
    const deny = laneDots("denylist", 15);
    expect(deny.filter((d) => d.accepted).every((d) => d.at < 10)).toBe(true);
    expect(deny.some((d) => d.accepted)).toBe(true);
  });

  it("words the verdict and lane labels in 38 characters or fewer", () => {
    expect(revokeVerdict(5).text).toBe("Short tokens: gap of 5 min or less");
    expect(revokeVerdict(15).text).toBe("Tokens alone: up to 15 min after ban");
    expect(revokeVerdict(60).text).toBe("Tokens alone: up to 60 min after ban");
    for (const l of LIFETIME_LADDER) expect(revokeVerdict(l).text.length).toBeLessThanOrEqual(MAX_VERDICT);
    expect(laneLabel("sessions", 15)).toBe("Sessions: refused at once");
    expect(laneLabel("denylist", 15)).toBe("Denylist: within 10 s");
    expect(LANES).toHaveLength(3);
  });
});

describe("the six server-rendered pictures", () => {
  const specs = [
    sysdesignM6ApiStyleWeigh,
    sysdesignM6PagingInsert,
    sysdesignM6RetryKey,
    sysdesignM6LimiterBurst,
    sysdesignM6GatewayJobs,
    sysdesignM6RevokeTimeline,
  ];
  for (const spec of specs) {
    it(`renders ${spec.title} with its picture and its limits fold`, () => {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(html).not.toContain(DASH);
    });
  }

  it("keeps the course wording free of em dashes and the drawing free of hex colours and banned SVG parts", () => {
    for (const spec of specs) expect(spec.title + spec.purpose + spec.limits).not.toContain(DASH);
    const root = path.resolve(__dirname, "../../../src/canvas");
    const files = fs
      .readdirSync(root)
      .filter((d) => /^sysdesign-m6-(api-style-weigh|paging-insert|retry-key|limiter-burst|gateway-jobs|revoke-timeline)$/.test(d))
      .flatMap((d) => fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts")).map((f) => path.join(root, d, f)));
    expect(files.length).toBeGreaterThanOrEqual(12);
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, f).not.toMatch(/#[0-9a-fA-F]{3,8}(?![\w-])/);
      expect(src, f).not.toMatch(/foreignObject|<animate|<use[ >]|<image[ >]/);
      expect(src, f).not.toContain(DASH);
    }
  });
});
