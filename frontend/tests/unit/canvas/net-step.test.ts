import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
// Relative imports: the new model, renderer and slugs have no package export yet (the orchestrator registers them).
import {
  MAX_CAPTION_WORDS,
  awaitingPick,
  canNext,
  changedRowsAt,
  choose,
  currentIndex,
  hasEmDash,
  isLast,
  liveSummary,
  maxRows,
  next,
  packetTitle,
  parseNetStep,
  pickResult,
  playedSteps,
  stageOf,
  startOver,
  startState,
  tablesAfter,
  wordCount,
  type NetStepData,
  type NetStepSpec,
  type NetStepState,
} from "../../../../packages/learning-ui/src/canvas/models/net-step";
import { classify } from "../../../../packages/learning-ui/src/canvas/models/net-address";
import { CHIP_H, chipWidth, flowChips, layoutNetStep, layoutProblems, markerAt } from "../../../../packages/learning-ui/src/canvas/net-step/layout";
import { NetStepCanvas, NetStepView } from "../../../../packages/learning-ui/src/canvas/net-step/NetStepCanvas";
import { netM3ArpExchange, netM3ArpExchangeData } from "../../../../packages/learning-ui/src/canvas/net-m3-arp-exchange/data";
import { netM4RouteLongest, netM4RouteLongestData } from "../../../../packages/learning-ui/src/canvas/net-m4-route-longest/data";

const EM_DASH = /\u2014/;
const VENDORS = /claude|anthropic|openai|gpt|gemini|llama|copilot/i;
const SLUGS = {
  "net-m3-arp-exchange": { spec: netM3ArpExchange, data: netM3ArpExchangeData },
  "net-m4-route-longest": { spec: netM4RouteLongest, data: netM4RouteLongestData },
} as const;

/** cable-capture.txt, line 4 of the lab recording (the ARP request, as tcpdump -e printed it). */
const ARP_REQUEST_LINE =
  "20:08:20.632368 a2:bb:8c:3a:32:03 > ff:ff:ff:ff:ff:ff, ethertype ARP (0x0806), length 42: Ethernet (len 6), IPv4 (len 4), Request who-has 192.168.1.20 tell 192.168.1.10, length 28";

function parsed(data: NetStepData): NetStepSpec {
  const result = parseNetStep(data);
  if (!result.ok) throw new Error(result.problems.join("; "));
  return result.spec;
}

const arp = parsed(netM3ArpExchangeData);
const route = parsed(netM4RouteLongestData);

/** Play a spec to the point where `shown` steps have started, picking `picks[i]` at each pick step. */
function reach(spec: NetStepSpec, shown: number, picks: Record<number, number> = {}): NetStepState {
  let state = startState(spec);
  for (;;) {
    const i = currentIndex(state);
    if (awaitingPick(spec, state) && picks[i] !== undefined) state = choose(spec, state, picks[i]);
    if (state.shown >= shown) return state;
    if (awaitingPick(spec, state)) return state;
    state = next(spec, state);
  }
}

const noop = () => {};
function view(spec: NetStepSpec, state: NetStepState, ride = 1): string {
  return renderToString(createElement(NetStepView, { title: "t", purpose: "p", limits: "l".repeat(50), spec, state, ride, onNext: noop, onStartOver: noop, onPick: noop }));
}

/** A small valid spec to break one rule at a time. */
function base(): NetStepData {
  return {
    title: "A test",
    purpose: "Two devices and a table.",
    limits: "Made up, for a test of the schema and the rules around it.",
    devices: [
      { id: "a", kind: "host", label: "Alpha", x: 70, y: 0, addresses: ["10.0.0.1"] },
      { id: "b", kind: "server", label: "Beta", x: 350, y: 0, addresses: ["10.0.0.2"] },
    ],
    links: [{ from: "a", to: "b" }],
    tables: [{ id: "t1", title: "First", device: "a", columns: ["Key", "Value"], rows: [["k1", "v1"]] }],
    steps: [{ caption: "Alpha sends." }, { caption: "Beta stores it.", tableUpdates: [{ table: "t1", row: 1, cells: ["k2", "v2"] }] }],
  };
}

function problemsOf(mutate: (d: NetStepData) => void): string {
  const data = structuredClone(base());
  mutate(data);
  const result = parseNetStep(data);
  return result.ok ? "" : result.problems.join(" | ");
}

// ---------------------------------------------------------------- the schema

describe("the net-step schema", () => {
  it("accepts a small valid spec and both samples", () => {
    expect(parseNetStep(base()).ok).toBe(true);
    for (const [slug, { data }] of Object.entries(SLUGS)) {
      const result = parseNetStep(data);
      expect(result.ok, `${slug}: ${result.ok ? "" : result.problems.join("; ")}`).toBe(true);
    }
  });

  it("refuses a link to a device that does not exist, and a device id used twice", () => {
    expect(problemsOf((d) => (d.links[0].to = "nobody"))).toMatch(/no device nobody/);
    expect(problemsOf((d) => (d.devices[1].id = "a"))).toMatch(/device ids must differ/);
    expect(problemsOf((d) => (d.links[0].to = "a"))).toMatch(/two different devices/);
  });

  it("refuses devices whose cards would overlap, or sit outside the picture", () => {
    expect(problemsOf((d) => (d.devices[1].x = 150))).toMatch(/overlap/);
    expect(problemsOf((d) => (d.devices[1].x = 400))).toMatch(/devices\.1\.x/);
  });

  it("refuses a caption of more than 20 words", () => {
    const long = Array.from({ length: MAX_CAPTION_WORDS + 1 }, (_, i) => `w${i}`).join(" ");
    expect(wordCount(long)).toBe(21);
    expect(problemsOf((d) => (d.steps[0].caption = long))).toMatch(/at most 20 words/);
    const ok = Array.from({ length: MAX_CAPTION_WORDS }, (_, i) => `w${i}`).join(" ");
    expect(problemsOf((d) => (d.steps[0].caption = ok))).toBe("");
  });

  it("refuses an em dash in any string", () => {
    expect(problemsOf((d) => (d.steps[0].caption = "Alpha "+"\u2014"+" sends."))).toMatch(/no em dash/);
    expect(problemsOf((d) => (d.devices[0].label = "A\u2014B"))).toMatch(/no em dash/);
    expect(hasEmDash({ x: "a\u2014b" })).toBe(true);
    expect(hasEmDash({ x: "a-b" })).toBe(false);
  });

  it("checks table updates: the cell count, a skipped row, an unknown table, the row limit", () => {
    expect(problemsOf((d) => (d.steps[1].tableUpdates![0].cells = ["only one"]))).toMatch(/a row has 2 cells/);
    expect(problemsOf((d) => (d.steps[1].tableUpdates![0].row = 3))).toMatch(/skips a row/);
    expect(problemsOf((d) => (d.steps[1].tableUpdates![0].table = "zzz"))).toMatch(/no table zzz/);
    expect(problemsOf((d) => (d.tables![0].rows = [["k", "v", "extra"]]))).toMatch(/a row has 2 cells/);
    // A row may be replaced, and the next row may be added.
    expect(problemsOf((d) => (d.steps[1].tableUpdates![0].row = 0))).toBe("");
  });

  it("checks highlights and packets point at things that exist", () => {
    expect(problemsOf((d) => (d.steps[0].highlight = { links: [4] }))).toMatch(/no link 4/);
    expect(problemsOf((d) => (d.steps[0].highlight = { devices: ["zzz"] }))).toMatch(/no device zzz/);
    expect(problemsOf((d) => (d.steps[0].highlight = { rows: [{ table: "t1", row: 1 }] }))).toMatch(/does not exist yet/);
    expect(problemsOf((d) => (d.steps[1].highlight = { rows: [{ table: "t1", row: 1 }] }))).toBe("");
    expect(problemsOf((d) => (d.steps[0].packet = { at: 2, fields: [{ label: "a", value: "b" }] }))).toMatch(/no link 2/);
    expect(problemsOf((d) => (d.steps[0].packet = { at: 0, fields: [] }))).not.toBe("");
  });

  it("allows at most two tables, two picks and one correct option per pick", () => {
    const pick = (right: number) => ({
      prompt: "Which one?",
      options: [
        { label: "One", correct: right === 1, why: "Because one." },
        { label: "Two", correct: right !== 1, why: "Because two." },
      ],
    });
    expect(problemsOf((d) => (d.steps[0].pick = pick(1)))).toBe("");
    expect(problemsOf((d) => (d.steps[0].pick = { prompt: "Q?", options: [{ label: "A", correct: true, why: "x." }, { label: "B", correct: true, why: "y." }] }))).toMatch(/exactly one option is correct/);
    expect(problemsOf((d) => (d.steps[0].pick = { prompt: "Q?", options: [{ label: "A", correct: false, why: "x." }, { label: "B", correct: false, why: "y." }] }))).toMatch(/exactly one option is correct/);
    expect(
      problemsOf((d) => {
        d.steps = [{ caption: "One." , pick: pick(1) }, { caption: "Two.", pick: pick(2) }, { caption: "Three.", pick: pick(1) }];
      }),
    ).toMatch(/3 picks, at most 2/);
    expect(
      problemsOf((d) => {
        d.tables = [...d.tables!, { id: "t2", title: "Second", device: "b", columns: ["A"], rows: [] }, { id: "t3", title: "Third", device: "b", columns: ["A"], rows: [] }];
      }),
    ).not.toBe("");
  });

  it("refuses a table whose columns are wider than the picture can draw", () => {
    expect(problemsOf((d) => (d.tables![0].rows = [["k".repeat(24), "v".repeat(24)]]))).toMatch(/the columns need/);
  });

  it("reports the field that failed, so a fence can name it", () => {
    const result = parseNetStep({ ...base(), steps: [] });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.problems[0]).toMatch(/^steps/);
    expect(parseNetStep(null).ok).toBe(false);
    expect(parseNetStep("nope").ok).toBe(false);
  });
});

// ---------------------------------------------------------------- tables over the steps

describe("table updates over the steps", () => {
  it("fills the ARP table at the last step and not before", () => {
    for (let n = 0; n < arp.steps.length; n += 1) expect(tablesAfter(arp, n).arp, `after ${n}`).toEqual([]);
    expect(tablesAfter(arp, arp.steps.length).arp).toEqual([["192.168.1.20", "02:00:00:00:00:20"]]);
    expect(maxRows(arp, "arp")).toBe(1);
  });

  it("marks the row the last step added as new, and nothing in the steps before", () => {
    expect(changedRowsAt(arp, arp.steps.length - 1)).toEqual([{ table: "arp", row: 0, kind: "new" }]);
    for (let n = 0; n < arp.steps.length - 1; n += 1) expect(changedRowsAt(arp, n)).toEqual([]);
    expect(changedRowsAt(arp, 99)).toEqual([]);
  });

  it("keeps the route table as written, since no step changes it", () => {
    expect(tablesAfter(route, 0).routes).toHaveLength(3);
    expect(tablesAfter(route, route.steps.length).routes).toEqual(tablesAfter(route, 0).routes);
    for (let n = 0; n < route.steps.length; n += 1) expect(changedRowsAt(route, n)).toEqual([]);
  });

  it("adds a row, then replaces it with new cells, and calls that one changed", () => {
    const spec = parsed({
      ...base(),
      steps: [
        { caption: "Add." , tableUpdates: [{ table: "t1", row: 1, cells: ["k2", "v2"] }] },
        { caption: "Replace.", tableUpdates: [{ table: "t1", row: 1, cells: ["k2", "v3"] }] },
        { caption: "Same again.", tableUpdates: [{ table: "t1", row: 1, cells: ["k2", "v3"] }] },
      ],
    });
    expect(tablesAfter(spec, 0).t1).toEqual([["k1", "v1"]]);
    expect(tablesAfter(spec, 1).t1).toEqual([["k1", "v1"], ["k2", "v2"]]);
    expect(tablesAfter(spec, 2).t1).toEqual([["k1", "v1"], ["k2", "v3"]]);
    expect(changedRowsAt(spec, 0)).toEqual([{ table: "t1", row: 1, kind: "new" }]);
    expect(changedRowsAt(spec, 1)).toEqual([{ table: "t1", row: 1, kind: "changed" }]);
    // Writing the same cells again changes nothing, so nothing is marked.
    expect(changedRowsAt(spec, 2)).toEqual([]);
    expect(maxRows(spec, "t1")).toBe(2);
  });

  it("does not change the spec it was given", () => {
    const before = JSON.stringify(arp);
    tablesAfter(arp, arp.steps.length);
    changedRowsAt(arp, arp.steps.length - 1);
    stageOf(arp, reach(arp, arp.steps.length, { 1: 1 }));
    expect(JSON.stringify(arp)).toBe(before);
  });
});

// ---------------------------------------------------------------- the pick

describe("the pick step", () => {
  const PICK_AT = 1;

  it("waits for a pick: Next is off until the learner chooses", () => {
    const at = reach(arp, 2);
    expect(currentIndex(at)).toBe(PICK_AT);
    expect(awaitingPick(arp, at)).toBe(true);
    expect(canNext(arp, at)).toBe(false);
    expect(next(arp, at)).toBe(at);
    expect(playedSteps(arp, at)).toBe(1);
  });

  it("hides the packet, the highlight and the verdict of a step until it is picked", () => {
    const waiting = stageOf(arp, reach(arp, 2));
    expect(waiting.active).toBeNull();
    expect(waiting.changed).toEqual([]);
    const picked = stageOf(arp, reach(arp, 2, { [PICK_AT]: 1 }));
    expect(picked.active?.packet?.at).toBe(0);
    expect(canNext(arp, reach(arp, 2, { [PICK_AT]: 1 }))).toBe(true);
  });

  it("scores the right option with its reason", () => {
    const pick = arp.steps[PICK_AT].pick!;
    const right = pickResult(pick, 1);
    expect(right.right).toBe(true);
    expect(right.text).toMatch(/^Right\. /);
    expect(right.text).toContain("broadcast MAC reaches every device");
  });

  it("scores a wrong option: why it fails, then the better pick and its reason", () => {
    const pick = arp.steps[PICK_AT].pick!;
    for (const wrong of [0, 2]) {
      const result = pickResult(pick, wrong);
      expect(result.right).toBe(false);
      expect(result.text).toMatch(/^Not quite\. /);
      expect(result.text).toContain(pick.options[wrong].why);
      expect(result.text).toContain("Better: To ff:ff:ff:ff:ff:ff, everyone");
      expect(result.text).toContain(pick.options[1].why);
    }
    expect(pickResult(pick, 9)).toEqual({ right: false, text: "" });
  });

  it("scores the route pick: the /16 is the right row", () => {
    const pick = route.steps[1].pick!;
    expect(pick.options.map((o) => o.correct)).toEqual([false, true, false]);
    expect(pick.options[1].label).toContain("10.1.0.0/16");
    expect(pickResult(pick, 1).right).toBe(true);
    expect(pickResult(pick, 0).text).toContain("Not quite.");
  });

  it("takes one pick, ignores a second and a bad option, and forgets it on Start over", () => {
    const at = reach(arp, 2);
    expect(choose(arp, at, 7)).toBe(at);
    expect(choose(arp, at, -1)).toBe(at);
    expect(choose(arp, at, 1.5)).toBe(at);
    const picked = choose(arp, at, 0);
    expect(picked.choices[PICK_AT]).toBe(0);
    expect(choose(arp, picked, 1)).toBe(picked);
    expect(startOver(arp)).toEqual(startState(arp));
    expect(awaitingPick(arp, startOver(arp))).toBe(false);
  });

  it("has exactly one pick in each sample, with three options and one right", () => {
    for (const spec of [arp, route]) {
      const picks = spec.steps.filter((s) => s.pick);
      expect(picks).toHaveLength(1);
      expect(picks[0].pick!.options).toHaveLength(3);
      expect(picks[0].pick!.options.filter((o) => o.correct)).toHaveLength(1);
    }
  });

  it("stops at the last step", () => {
    const end = reach(arp, arp.steps.length, { [PICK_AT]: 1 });
    expect(isLast(arp, end)).toBe(true);
    expect(canNext(arp, end)).toBe(false);
    expect(next(arp, end)).toBe(end);
    expect(stageOf(arp, end).active?.verdict).toEqual({ text: "One broadcast, one answer, one entry", tone: "good" });
  });
});

// ---------------------------------------------------------------- the words

describe("what the live region says", () => {
  it("says the step, the caption, the packet fields and the changed fields", () => {
    const text = liveSummary(arp, reach(arp, 4, { 1: 1 }));
    expect(text).toContain("Step 4 of 6.");
    expect(text).toContain("Only the phone owns 192.168.1.20");
    expect(text).toContain("On the link: Phone to Switch");
    expect(text).toContain("src MAC 02:00:00:00:00:20 (changed)");
    expect(text).toContain("192.168.1.20 is at 02:00:00:00:00:20 (changed)");
    expect(text).not.toMatch(/undefined|NaN/);
  });

  it("says the added row in words", () => {
    const text = liveSummary(arp, reach(arp, 6, { 1: 1 }));
    expect(text).toContain("Laptop's ARP table: row 1 added: IP address 192.168.1.20, MAC address 02:00:00:00:00:20.");
    expect(text).toContain("Result: One broadcast, one answer, one entry.");
  });

  it("asks the question and lists the options while a pick is open, without the answer", () => {
    const text = liveSummary(arp, reach(arp, 2));
    expect(text).toContain("Your turn.");
    expect(text).toContain("Options: To the phone's MAC, directly; To ff:ff:ff:ff:ff:ff, everyone; To the router, to pass along.");
    expect(text).not.toContain("The laptop broadcasts");
    expect(text).not.toContain("Right answer");
  });

  it("names the link by its direction of travel", () => {
    expect(packetTitle(arp, arp.steps[3].packet!)).toBe("On the link: Phone to Switch");
    expect(packetTitle(arp, arp.steps[4].packet!)).toBe("On the link: Switch to Laptop");
    expect(packetTitle(arp, arp.steps[1].packet!)).toBe("On the link: Laptop to Switch");
  });
});

// ---------------------------------------------------------------- the data

describe("the sample data", () => {
  it("keeps every caption to 20 words and every verdict short enough for its banner", () => {
    for (const [slug, { data }] of Object.entries(SLUGS)) {
      for (const [i, s] of data.steps.entries()) {
        expect(wordCount(s.caption), `${slug} step ${i + 1}`).toBeLessThanOrEqual(MAX_CAPTION_WORDS);
        if (s.verdict) expect(s.verdict.text.length * 8.3 + 46, `${slug} verdict`).toBeLessThanOrEqual(420 - 16);
      }
    }
  });

  it("uses only made-up or reserved addresses: private, documentation, or locally administered MACs", () => {
    for (const [slug, { data }] of Object.entries(SLUGS)) {
      const all = JSON.stringify(data);
      for (const ip of all.match(/\b\d{1,3}(\.\d{1,3}){3}\b/g) ?? []) {
        // Not "public": a public address would have to come from a documentation range.
        expect(classify(ip), `${slug} ${ip}`).not.toBe("public");
      }
      for (const mac of all.match(/\b[0-9a-f]{2}(:[0-9a-f]{2}){5}\b/g) ?? []) expect(mac === "ff:ff:ff:ff:ff:ff" || mac.startsWith("02:"), `${slug} ${mac}`).toBe(true);
    }
  });

  it("matches the recorded ARP request: a broadcast who-has, with the sender named", () => {
    const m = /^\S+ (\S+) > (\S+), ethertype ARP \(0x0806\).* Request who-has (\S+) tell (\S+), length 28$/.exec(ARP_REQUEST_LINE);
    expect(m).not.toBeNull();
    const fields = arp.steps[1].packet!.fields;
    const get = (label: string) => fields.find((f) => f.label === label)?.value;
    expect(get("dst MAC")).toBe(m![2]);
    expect(get("ARP")).toBe("request");
    expect(get("who has")).toBe(m![3]);
    expect(get("tell")).toBe(m![4]);
    // The reply goes to the asker's MAC by unicast, not to everyone.
    const reply = arp.steps[3].packet!.fields;
    expect(reply.find((f) => f.label === "dst MAC")!.value).toBe(get("src MAC"));
    expect(reply.find((f) => f.label === "ARP")!.value).toBe("reply");
    // The flood carries the very same request.
    expect(arp.steps[2].packet!.fields).toEqual(fields);
  });

  it("shows TTL 64 at the sender and 63 after the router, flagged as changed", () => {
    const before = route.steps[0].packet!.fields.find((f) => f.label === "TTL")!;
    const after = route.steps[2].packet!.fields.find((f) => f.label === "TTL")!;
    expect([before.value, after.value]).toEqual(["64", "63"]);
    expect(before.changed).toBeUndefined();
    expect(after.changed).toBe(true);
    expect(route.steps[0].packet!.fields.find((f) => f.label === "dst IP")!.value).toBe("10.1.2.3");
  });

  it("puts the matching row last in no particular place: the /16 row is the second of three, as the pick says", () => {
    const rows = tablesAfter(route, 0).routes;
    expect(rows.map((r) => r[0])).toEqual(["10.0.0.0/8", "10.1.0.0/16", "default"]);
    expect(route.steps[1].highlight?.rows).toEqual([{ table: "routes", row: 1 }]);
    expect(route.steps[2].packet!.at).toBe(2);
    expect(route.links[2]).toMatchObject({ from: "router", to: "router-b" });
  });

  it("writes no em dash and no AI vendor in any string", () => {
    for (const { data, spec } of Object.values(SLUGS)) {
      expect(hasEmDash(data)).toBe(false);
      const text = JSON.stringify(data);
      expect(text).not.toMatch(EM_DASH);
      expect(text).not.toMatch(VENDORS);
      expect(`${spec.title} ${spec.purpose} ${spec.limits}`).not.toMatch(EM_DASH);
      expect(spec.limits.length).toBeGreaterThan(40);
      expect(spec.kind).toBe("custom");
    }
  });

  it("exports each slug under its camel-case name, with the same words as its data", () => {
    for (const { spec, data } of Object.values(SLUGS)) {
      expect([spec.title, spec.purpose, spec.limits]).toEqual([data.title, data.purpose, data.limits]);
    }
  });
});

// ---------------------------------------------------------------- the layout

describe("the layout", () => {
  it("has no label touching a shape or another label, in either sample", () => {
    expect(layoutProblems(arp)).toEqual([]);
    expect(layoutProblems(route)).toEqual([]);
  });

  it("keeps every shape inside a picture 420 wide, whatever the step", () => {
    for (const spec of [arp, route]) {
      const layout = layoutNetStep(spec);
      expect(layout.width).toBe(420);
      expect(Number.isFinite(layout.height)).toBe(true);
      for (const d of layout.devices) {
        expect(d.x).toBeGreaterThanOrEqual(12);
        expect(d.x + d.w).toBeLessThanOrEqual(420 - 12);
      }
      for (const t of layout.tables) expect(t.box.y + t.box.h).toBeLessThanOrEqual(layout.height);
      if (layout.tray) expect(layout.tray.box.y + layout.tray.box.h).toBeLessThanOrEqual(layout.height);
    }
  });

  it("gives every step the same picture height, so nothing jumps on Next", () => {
    for (const spec of [arp, route]) {
      const heights = new Set<number>();
      for (let shown = 1; shown <= spec.steps.length; shown += 1) heights.add(layoutNetStep(spec).height);
      expect(heights.size).toBe(1);
    }
    // And the picture is no taller than a phone screen allows for a beat.
    expect(layoutNetStep(arp).height).toBeLessThan(640);
    expect(layoutNetStep(route).height).toBeLessThan(640);
  });

  it("lays the packet chips in rows inside the tray, in order, with no two touching", () => {
    const layout = layoutNetStep(arp);
    const tray = layout.tray!;
    for (const [i, step] of arp.steps.entries()) {
      if (!step.packet) continue;
      const { chips, rows } = flowChips(step.packet.fields, tray.box.x + 8, tray.chipsY, tray.box.w - 16);
      expect(rows, `step ${i + 1}`).toBeLessThanOrEqual(tray.rows);
      expect(chips).toHaveLength(step.packet.fields.length);
      chips.forEach((c, k) => {
        expect(c.x, `step ${i + 1} chip ${k}`).toBeGreaterThanOrEqual(tray.box.x + 8);
        expect(c.x + c.w, `step ${i + 1} chip ${k}`).toBeLessThanOrEqual(tray.box.x + tray.box.w - 8);
        expect(c.w).toBe(chipWidth(step.packet!.fields[k]));
        expect(c.h).toBe(CHIP_H);
        expect(c.y + c.h).toBeLessThanOrEqual(tray.box.y + tray.box.h);
        if (k > 0) expect(c.y > chips[k - 1].y || c.x >= chips[k - 1].x + chips[k - 1].w, `step ${i + 1} order`).toBe(true);
      });
    }
  });

  it("rides the marker along the visible line, from its first end to its second, and back for a reverse trip", () => {
    const layout = layoutNetStep(arp);
    const link = layout.links[1];
    const start = markerAt(link, false, 0);
    const end = markerAt(link, false, 1);
    const back = markerAt(link, true, 0);
    // Not on a card at either end, and moving toward the second end.
    expect(Math.hypot(start.x - link.p1.x, start.y - link.p1.y)).toBeGreaterThan(5);
    expect(Math.hypot(end.x - link.p2.x, end.y - link.p2.y)).toBeGreaterThan(5);
    expect(Math.hypot(end.x - link.p1.x, end.y - link.p1.y)).toBeGreaterThan(Math.hypot(start.x - link.p1.x, start.y - link.p1.y));
    expect(Math.hypot(back.x - link.p2.x, back.y - link.p2.y)).toBeLessThan(Math.hypot(back.x - link.p1.x, back.y - link.p1.y));
    // A bad time is clamped, never NaN.
    expect(markerAt(link, false, -4)).toEqual(start);
    expect(markerAt(link, false, 9)).toEqual(end);
  });

  it("lays out two tables stacked and complete, with a link label on its own pill clear of both cards", () => {
    const two = parsed({
      ...base(),
      devices: [
        { id: "a", kind: "host", label: "Alpha", x: 70, y: 0, addresses: ["10.0.0.1"] },
        { id: "b", kind: "server", label: "Beta", x: 350, y: 0, addresses: ["10.0.0.2"] },
      ],
      links: [{ from: "a", to: "b", label: "cable" }],
      tables: [
        { id: "t1", title: "First", device: "a", columns: ["Key", "Value"], rows: [["k1", "v1"]] },
        { id: "t2", title: "Second", device: "b", columns: ["Port", "Owner", "State"], rows: [] },
      ],
      steps: [
        { caption: "Alpha sends.", packet: { at: 0, fields: [{ label: "a", value: "b" }] } },
        { caption: "Beta stores it.", tableUpdates: [{ table: "t1", row: 1, cells: ["k2", "v2"] }, { table: "t2", row: 0, cells: ["80", "web", "open"] }] },
      ],
    });
    expect(layoutProblems(two)).toEqual([]);
    const layout = layoutNetStep(two);
    expect(layout.tables).toHaveLength(2);
    expect(layout.tables[1].box.y).toBeGreaterThanOrEqual(layout.tables[0].box.y + layout.tables[0].box.h);
    expect(layout.links[0].label).not.toBeNull();
    const html = view(two, startState(two));
    expect(html).toContain("cable");
    expect(html).toContain("First");
    expect(html).toContain("Second");
    expect(html).toContain("No entries yet");
  });

  it("finds a link label that would touch a card", () => {
    const tight = parsed({
      ...base(),
      devices: [
        { id: "a", kind: "host", label: "Alpha", x: 70, y: 0 },
        { id: "b", kind: "server", label: "Beta", x: 210, y: 0 },
      ],
      links: [{ from: "a", to: "b", label: "a long cable" }],
    });
    expect(layoutProblems(tight).join(" ")).toMatch(/the label touches/);
  });
});

// ---------------------------------------------------------------- rendering

const BAD_HTML = /="NaN"|>NaN<|undefined|dangerouslySetInnerHTML|<foreignObject|<script|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![0-9a-zA-Z])/;

describe("rendering on the server", () => {
  it("renders each sample's starting state with a picture, controls, a live region and a fold", () => {
    const expectations: Record<keyof typeof SLUGS, string[]> = {
      "net-m3-arp-exchange": ["Step 1 of 6", "The laptop wants 192.168.1.20", "Laptop", "192.168.1.10", "Phone", "Switch", "Laptop&#x27;s ARP table", "No entries yet", "IP address", "MAC address"],
      "net-m4-route-longest": ["Step 1 of 3", "A packet for 10.1.2.3 reaches the router", "On the link: Laptop to Router", "src IP", "192.168.1.23", "TTL", "10.0.0.0/8", "10.1.0.0/16", "default", "203.0.113.2"],
    };
    for (const [slug, { spec: canvas }] of Object.entries(SLUGS)) {
      const html = renderToString(createElement(canvas.component, { title: canvas.title, purpose: canvas.purpose, limits: canvas.limits }));
      for (const needle of expectations[slug as keyof typeof SLUGS]) expect(html, `${slug}: ${needle}`).toContain(needle);
      expect(html, slug).toContain("<svg");
      expect(html, slug).toContain("What this picture leaves out");
      expect(html, slug).toContain('aria-live="polite"');
      expect(html, slug).toContain(">Next<");
      expect(html, slug).toContain(">Start over<");
      expect(html, slug).toContain("<title");
      expect(html, slug).toContain("<desc");
      expect(html, slug).not.toMatch(BAD_HTML);
      expect(html, slug).not.toMatch(EM_DASH);
      expect(html, slug).not.toMatch(VENDORS);
    }
  });

  it("has exactly two controls outside the picture, both native buttons with names, and Next is on at the start", () => {
    const html = view(route, startState(route));
    const buttons = html.match(/<button[^>]*>.*?<\/button>/g) ?? [];
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toContain("Next");
    expect(buttons[0]).not.toContain('disabled=""');
    expect(buttons[1]).toContain("Start over");
    expect(html).not.toContain("role=\"button\"");
  });

  it("does not show the answer while a pick is open: option buttons, a placeholder, no packet, Next off", () => {
    const html = view(arp, reach(arp, 2));
    expect(html).toContain("Step 2 of 6");
    expect(html).toContain("Your turn: pick below, then this step plays.");
    expect(html).toContain("The laptop knows the phone&#x27;s IP address but not its MAC.");
    expect(html).toContain("The step plays after you pick.");
    expect(html).toContain("No packet on a link in this step");
    expect(html).not.toContain("The laptop broadcasts");
    expect(html).not.toContain("who has");
    expect(html).not.toContain("Right answer");
    const buttons = html.match(/<button[^>]*>.*?<\/button>/g) ?? [];
    expect(buttons).toHaveLength(5);
    const options = buttons.filter((b) => b.includes("aria-pressed"));
    expect(options).toHaveLength(3);
    for (const b of options) expect(b).toContain('aria-pressed="false"');
    // Next is disabled while the pick is open.
    expect(buttons.find((b) => b.includes(">Next<"))).toContain('disabled=""');
  });

  it("after a right pick, plays the step: packet chips, why, the pick marked in words, Next on", () => {
    const html = view(arp, reach(arp, 2, { 1: 1 }));
    expect(html).toContain("The laptop broadcasts: who has 192.168.1.20?");
    expect(html).toContain("On the link: Laptop to Switch");
    expect(html).toContain("ff:ff:ff:ff:ff:ff");
    expect(html).toContain("who has");
    expect(html).toContain("Your pick, right");
    expect(html).toContain("Right. The broadcast MAC reaches every device on the link.");
    const buttons = html.match(/<button[^>]*>.*?<\/button>/g) ?? [];
    expect(buttons.find((b) => b.includes(">Next<"))).not.toContain('disabled=""');
    expect(buttons.filter((b) => b.includes('aria-pressed="true"'))).toHaveLength(1);
  });

  it("after a wrong pick, marks it and the right answer in words, and explains both", () => {
    const html = view(arp, reach(arp, 2, { 1: 0 }));
    expect(html).toContain("Your pick, not right");
    expect(html).toContain("Right answer");
    expect(html).toContain("Not quite. It does not know that MAC yet.");
    expect(html).toContain("Better: To ff:ff:ff:ff:ff:ff, everyone.");
  });

  it("marks the packet's changed fields and the new table row in words, not only in colour", () => {
    const reply = view(arp, reach(arp, 4, { 1: 1 }));
    expect((reply.match(/ changed</g) ?? []).length).toBeGreaterThanOrEqual(4);
    expect(reply).toContain("On the link: Phone to Switch");
    const end = view(arp, reach(arp, 6, { 1: 1 }));
    expect(end).toContain(">new<");
    expect(end).toContain("02:00:00:00:00:20");
    expect(end).toContain("One broadcast, one answer, one entry");
    expect(end).toContain("That was the last step.");
    // The last step of the route sample has the changed TTL.
    const ttl = view(route, reach(route, 3, { 1: 1 }));
    expect(ttl).toContain(" changed<");
    expect(ttl).toContain("Longest prefix wins: the /16");
  });

  it("lights the matching row after the route pick", () => {
    const before = view(route, reach(route, 2));
    const after = view(route, reach(route, 2, { 1: 1 }));
    expect(before).toContain("Your turn: pick below, then this step plays.");
    expect(after).toContain("10.1.2.3 fits three rows.");
    expect(after).toContain("Right. A /16 fixes 16 bits");
    // The lit row has a stroked accent rectangle that the unlit view does not have.
    expect((after.match(/stroke-blue-600/g) ?? []).length).toBeGreaterThan((before.match(/stroke-blue-600/g) ?? []).length);
  });

  it("draws the packet at its settled place when motion is reduced or the server renders", () => {
    const state = reach(arp, 2, { 1: 1 });
    const layout = layoutNetStep(arp);
    const at = markerAt(layout.links[0], false, 1);
    const html = view(arp, state, 1);
    expect(html).toContain(`<rect x="${at.x - 11}" y="${at.y - 8}"`);
    const start = markerAt(layout.links[0], false, 0);
    expect(view(arp, state, 0)).toContain(`<rect x="${start.x - 11}" y="${start.y - 8}"`);
    expect(html).toContain("motion-reduce:animate-none");
  });

  it("renders every state of both samples without NaN, undefined or unsafe markup", () => {
    for (const spec of [arp, route]) {
      for (let shown = 1; shown <= spec.steps.length; shown += 1) {
        for (const pick of [undefined, 0, 1, 2]) {
          const state = reach(spec, shown, pick === undefined ? {} : { 1: pick });
          const html = view(spec, state);
          expect(html).not.toMatch(BAD_HTML);
          expect(html).not.toMatch(EM_DASH);
          expect(html).toContain("<svg");
        }
      }
    }
  });

  it("renders the quiet note, not a crash, when the data is invalid", () => {
    for (const bad of [{ ...base(), steps: [] }, null, "nope", { ...base(), links: [{ from: "a", to: "zzz" }] }, 42]) {
      const html = renderToString(createElement(NetStepCanvas, { title: "t", purpose: "p", limits: "l", data: bad as unknown as NetStepData }));
      expect(html).toContain("This interactive part is not available right now.");
      expect(html).toContain('role="note"');
      expect(html).not.toContain("<svg");
    }
  });
});

// ---------------------------------------------------------------- the source files

describe("the source files", () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../packages/learning-ui/src/canvas");
  const files: string[] = [
    path.join(root, "models/net-step.ts"),
    ...readdirSync(path.join(root, "net-step")).map((f) => path.join(root, "net-step", f)),
    ...["net-m3-arp-exchange", "net-m4-route-longest"].flatMap((d) => readdirSync(path.join(root, d)).map((f) => path.join(root, d, f))),
  ];
  const sources = files.map((f) => [path.relative(root, f), readFileSync(f, "utf8")] as const);

  it("covers the model, the renderer folder and both slug folders", () => {
    const names = sources.map(([n]) => n.replace(/\\/g, "/"));
    for (const need of ["models/net-step.ts", "net-step/NetStepCanvas.tsx", "net-step/layout.ts", "net-m3-arp-exchange/data.ts", "net-m3-arp-exchange/spec.md", "net-m4-route-longest/data.ts", "net-m4-route-longest/spec.md"]) {
      expect(names, need).toContain(need);
    }
  });

  it("have no em dash, no AI vendor name, no hex colour and no raw HTML injection", () => {
    for (const [name, text] of sources) {
      expect(text, name).not.toMatch(EM_DASH);
      expect(text, name).not.toMatch(VENDORS);
      expect(text, name).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(text, name).not.toMatch(/dangerouslySetInnerHTML|foreignObject|<script|javascript:|xlink:href/);
    }
  });

  it("set no text smaller than 13 units", () => {
    for (const [name, text] of sources) {
      for (const m of text.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)) expect(Number(m[1]), `${name} ${m[0]}`).toBeGreaterThanOrEqual(13);
    }
  });

  it("use native buttons and the shared beat frame, with reduced motion handled", () => {
    const canvas = sources.find(([n]) => n.replace(/\\/g, "/") === "net-step/NetStepCanvas.tsx")![1];
    expect(canvas).toContain("BeatFrame");
    expect(canvas).toContain("<button");
    expect(canvas).toContain("aria-pressed");
    expect(canvas).toContain('aria-live="polite"');
    expect(canvas).toContain("motion-reduce:animate-none");
    expect(canvas).toContain("useReducedMotion");
    const ride = sources.find(([n]) => n.replace(/\\/g, "/") === "net-step/use-ride.ts")![1];
    expect(ride).toContain("IntersectionObserver");
    expect(ride).toContain("reduced");
  });
});
