import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CUT_LINE,
  MAX_PREDICTS,
  awaitingPick,
  canNext,
  choose,
  commandLines,
  currentIndex,
  isLast,
  lineKind,
  liveSummary,
  next,
  outputLines,
  outputVisible,
  pickResult,
  startOver,
  startState,
  stepLabel,
  validateReplay,
  type ReplayData,
  type ReplayState,
} from "@buildment/learning-ui/canvas/models/net-replay";
import { netM1ReplaySetupChecker, netM1ReplaySetupCheckerData } from "@buildment/learning-ui/canvas/net-m1-replay-setup-checker/data";
import { netM1ReplayOwnNumbers, netM1ReplayOwnNumbersData } from "@buildment/learning-ui/canvas/net-m1-replay-own-numbers/data";
import { netM1ReplayVirtualCable, netM1ReplayVirtualCableData } from "@buildment/learning-ui/canvas/net-m1-replay-virtual-cable/data";
import { ReplayView } from "@buildment/learning-ui/canvas/net-m1-replay-setup-checker/ReplayCanvas";
import { InteractiveCanvas } from "@buildment/learning-ui/canvas/InteractiveCanvas";
import { canvasRegistry } from "@buildment/learning-ui/canvas/registry";

const EM_DASH = /\u2014/;

const REPLAYS = {
  "net-m1-replay-setup-checker": { spec: netM1ReplaySetupChecker, data: netM1ReplaySetupCheckerData },
  "net-m1-replay-own-numbers": { spec: netM1ReplayOwnNumbers, data: netM1ReplayOwnNumbersData },
  "net-m1-replay-virtual-cable": { spec: netM1ReplayVirtualCable, data: netM1ReplayVirtualCableData },
} as const;
type Slug = keyof typeof REPLAYS;

// ---------------------------------------------------------------- the recordings
//
// The recordings are in agent-ip/work/networking/recordings/. The frontend
// test copy does not hold agent-ip, so the test reads copies kept in
// tests/unit/canvas/fixtures/ (replay-sessions.txt, replay-capture.txt, and
// the challenge README for the capture command). When the originals are
// present (the worktree) a test checks the fixtures are identical to them.

const FIXTURES = path.join("tests", "unit", "canvas", "fixtures");
const ORIGINALS: Record<string, string> = {
  "replay-sessions.txt": path.join("..", "agent-ip", "work", "networking", "recordings", "replay-sessions.txt"),
  "replay-capture.txt": path.join("..", "agent-ip", "work", "networking", "recordings", "replay-capture.txt"),
  "challenge-1-part-1-README.md": path.join("..", "agent-ip", "work", "networking", "challenges-template", "challenges", "challenge-1-two-computers", "part-1-virtual-cable", "README.md"),
};

const readFixture = (name: string) => fs.readFileSync(path.join(FIXTURES, name), "utf8");
// Strip colour codes and trailing spaces; split into lines.
const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;
const fileLines = (name: string) =>
  readFixture(name)
    .replace(/\r\n/g, "\n")
    .replace(ANSI, "")
    .split("\n")
    .map((l) => l.trimEnd());
const trimTrailingBlank = (lines: string[]) => {
  const out = [...lines];
  while (out.length && out[out.length - 1] === "") out.pop();
  return out;
};

type Block = { cmd?: string; lines: string[] };

/** replay-sessions.txt as blocks: session name -> one block per command (or one block when no command was recorded). */
function parseSessions(): Record<string, Block[]> {
  const sessions: Record<string, Block[]> = {};
  let session = "";
  let block: Block | null = null;
  const close = () => {
    if (block && session) {
      block.lines = trimTrailingBlank(block.lines);
      sessions[session].push(block);
    }
    block = null;
  };
  for (const line of fileLines("replay-sessions.txt")) {
    if (line.startsWith("##### SESSION ")) {
      close();
      session = line.slice("##### SESSION ".length);
      sessions[session] = [];
      block = { lines: [] };
    } else if (line.startsWith("### CMD: ")) {
      // A command ends a block of an earlier command; a session with no command keeps its first block.
      if (block && block.cmd === undefined && block.lines.length === 0) {
        block.cmd = line.slice("### CMD: ".length);
      } else {
        close();
        block = { cmd: line.slice("### CMD: ".length), lines: [] };
      }
    } else if (line.startsWith("### EXIT: ")) {
      close();
    } else if (block) {
      block.lines.push(line);
    }
  }
  close();
  return sessions;
}

/** replay-capture.txt: the ping and the capture (as the terminal shows them, in order), and the test after it. */
function parseCapture(): { readme: string[]; test: string[] } {
  const lines = fileLines("replay-capture.txt").filter((l) => !l.startsWith("# "));
  const cap = lines.indexOf("### capture");
  const tst = lines.indexOf("### test with capture");
  expect(cap).toBeGreaterThan(-1);
  expect(tst).toBeGreaterThan(cap);
  return {
    readme: trimTrailingBlank([...lines.slice(0, cap), ...lines.slice(cap + 1, tst)]),
    test: trimTrailingBlank(lines.slice(tst + 1)),
  };
}

const SESSIONS = parseSessions();
const CAPTURE = parseCapture();

/** Where each step's output comes from. */
const SOURCES: Record<Slug, ({ block: Block } | { lines: string[] })[]> = {
  "net-m1-replay-setup-checker": [
    { block: SESSIONS["setup-checker"][0] },
    { block: SESSIONS["not-privileged"][0] },
    { block: SESSIONS["outside-lab"][0] },
  ],
  "net-m1-replay-own-numbers": [{ block: SESSIONS["own-numbers"][0] }, { block: SESSIONS["own-numbers"][1] }],
  "net-m1-replay-virtual-cable": [
    { block: SESSIONS["virtual-cable"][0] },
    { block: SESSIONS["virtual-cable"][1] },
    { lines: CAPTURE.readme },
    { block: SESSIONS["virtual-cable"][3] },
    { lines: CAPTURE.test },
  ],
};

const sourceLines = (src: { block: Block } | { lines: string[] }) => ("block" in src ? src.block.lines : src.lines);

/** Split an output at its "..." lines into runs of lines that were kept. */
function runsOf(output: string): string[][] {
  const runs: string[][] = [[]];
  for (const line of outputLines(output)) {
    if (line === CUT_LINE) runs.push([]);
    else runs[runs.length - 1].push(line);
  }
  return runs.filter((r) => r.length > 0);
}

/** True if every run is a contiguous slice of the source, and the runs come in order. */
function runsAppearInOrder(runs: string[][], source: string[]): boolean {
  let from = 0;
  for (const run of runs) {
    let found = -1;
    for (let at = from; at + run.length <= source.length; at++) {
      if (run.every((line, k) => source[at + k] === line)) {
        found = at;
        break;
      }
    }
    if (found < 0) return false;
    from = found + run.length;
  }
  return true;
}

describe("the fixtures", () => {
  for (const [name, original] of Object.entries(ORIGINALS)) {
    it.skipIf(!fs.existsSync(original))(`${name} is identical to the recording it was copied from`, () => {
      const a = fs.readFileSync(original, "utf8").replace(/\r\n/g, "\n");
      expect(readFixture(name).replace(/\r\n/g, "\n")).toBe(a);
    });
  }

  it("parse into the sessions the replays use", () => {
    expect(Object.keys(SESSIONS)).toEqual(["setup-checker", "own-numbers", "virtual-cable", "wrong-mask", "rerun-safety", "not-privileged", "outside-lab"]);
    expect(SESSIONS["setup-checker"]).toHaveLength(2);
    expect(SESSIONS["own-numbers"]).toHaveLength(3);
    expect(SESSIONS["virtual-cable"]).toHaveLength(5);
    expect(SESSIONS["not-privileged"]).toHaveLength(1);
    expect(SESSIONS["outside-lab"]).toHaveLength(1);
    expect(CAPTURE.readme.length).toBeGreaterThan(10);
    expect(CAPTURE.test.at(-1)).toBe("RESULT: all checks passed");
  });
});

describe("every replay line is a real recorded line", () => {
  for (const [slug, { data }] of Object.entries(REPLAYS) as [Slug, (typeof REPLAYS)[Slug]][]) {
    it(`${slug}: every output line appears verbatim, in order, in its recording`, () => {
      const sources = SOURCES[slug];
      expect(data.steps).toHaveLength(sources.length);
      data.steps.forEach((step, i) => {
        const source = sourceLines(sources[i]);
        const runs = runsOf(step.output);
        expect(runs.length, `${slug} step ${i + 1}`).toBeGreaterThan(0);
        expect(runsAppearInOrder(runs, source), `${slug} step ${i + 1}`).toBe(true);
        // A whole output must be the whole recorded block; only a marked cut may leave lines out.
        if (!outputLines(step.output).includes(CUT_LINE)) expect(outputLines(step.output), `${slug} step ${i + 1}`).toEqual(source);
        // Nothing was changed: no ANSI codes, no trailing spaces, and the cut marker is only ever a whole line.
        for (const line of outputLines(step.output)) {
          expect(line).not.toMatch(ANSI);
          expect(line).toBe(line.trimEnd());
          if (line.includes(CUT_LINE)) expect(line).toBe(CUT_LINE);
        }
      });
    });

    it(`${slug}: every command was typed in the recordings`, () => {
      const typed = new Set<string>();
      for (const blocks of Object.values(SESSIONS)) for (const b of blocks) if (b.cmd) typed.add(b.cmd);
      const readme = new Set(fileLines("challenge-1-part-1-README.md"));
      // The not-privileged and outside-lab sessions were recorded without the typed command; they ran the checker.
      const checker = SESSIONS["setup-checker"][0].cmd;
      data.steps.forEach((step, i) => {
        const where = `${slug} step ${i + 1}`;
        const recorded = typed.has(step.command);
        const fromReadme = commandLines(step.command).every((l) => readme.has(l));
        const unrecordedChecker = slug === "net-m1-replay-setup-checker" && i > 0 && step.command === checker;
        expect(recorded || fromReadme || unrecordedChecker, where).toBe(true);
      });
    });
  }

  it("the README capture step is exactly the block in the challenge README", () => {
    const step = netM1ReplayVirtualCableData.steps[2];
    const readme = fileLines("challenge-1-part-1-README.md");
    const lines = commandLines(step.command);
    const at = readme.indexOf(lines[0]);
    expect(at).toBeGreaterThan(-1);
    expect(readme.slice(at, at + lines.length)).toEqual(lines);
  });

  it("the cut in a long output never hides a FAIL line", () => {
    // Every FAIL line in a recording must still be shown in the replay.
    const checks: [Slug, number][] = [
      ["net-m1-replay-setup-checker", 1],
      ["net-m1-replay-setup-checker", 2],
    ];
    for (const [slug, i] of checks) {
      const shown = outputLines(REPLAYS[slug].data.steps[i].output);
      const recorded = sourceLines(SOURCES[slug][i]).filter((l) => l.startsWith("FAIL"));
      for (const fail of recorded) expect(shown).toContain(fail);
    }
  });
});

describe("the predictions are true to the recordings", () => {
  it("setup-checker: the FAIL line outside the lab names the right option and no other", () => {
    const step = netM1ReplaySetupCheckerData.steps[2];
    const p = step.predict!;
    const fail = outputLines(step.output).find((l) => l.startsWith("FAIL"))!;
    expect(fail.startsWith(`FAIL ${p.options[p.correct]}:`)).toBe(true);
    p.options.forEach((o, i) => {
      if (i !== p.correct) expect(step.output.includes(`FAIL ${o}:`)).toBe(false);
    });
    // The first wrong option is a real failure from another recorded run.
    expect(sourceLines({ block: SESSIONS["not-privileged"][0] }).some((l) => l.startsWith(`FAIL ${p.options[0]}:`))).toBe(true);
    // Each wrong option is a check name the checker really has.
    const names = new Set(SESSIONS["setup-checker"][0].lines.filter((l) => l.startsWith("PASS ")).map((l) => l.slice(5)));
    names.add("no-privilege");
    for (const o of p.options) if (o !== p.options[p.correct]) expect(names.has(o), o).toBe(true);
  });

  it("setup-checker: the note counts the checks right", () => {
    const passes = SESSIONS["setup-checker"][0].lines.filter((l) => l.startsWith("PASS ")).length;
    expect(passes).toBe(18);
    expect(netM1ReplaySetupCheckerData.steps[0].note).toContain(`All ${passes} checks`);
  });

  it("own-numbers: the right prefix is the one printed for 0xffffff00, and it counts the ff pairs", () => {
    const step = netM1ReplayOwnNumbersData.steps[1];
    const p = step.predict!;
    expect(step.command).toContain("numbers-hex.txt");
    const prefixLine = outputLines(step.output).find((l) => l.startsWith("prefix"))!;
    expect(prefixLine.endsWith(p.options[p.correct])).toBe(true);
    expect(outputLines(step.output).some((l) => l.includes("0xffffff00 = 255.255.255.0 = /24"))).toBe(true);
    // ff is eight ones: three ff pairs make 24.
    expect(p.options[p.correct]).toBe(`/${("ffffff00".match(/f/g) ?? []).length * 4}`);
    p.options.forEach((o, i) => {
      if (i !== p.correct) expect(prefixLine.endsWith(o)).toBe(false);
    });
  });

  it("virtual-cable: the right count is the number of packets before the first echo request", () => {
    const step = netM1ReplayVirtualCableData.steps[2];
    const p = step.predict!;
    let packets = 0;
    let before = -1;
    for (const line of outputLines(step.output)) {
      if (/^\d\d:\d\d:\d\d\.\d+ /.test(line)) packets += 1;
      if (before < 0 && line.includes("ICMP echo request")) before = packets - 1;
    }
    expect(before).toBe(2);
    expect(p.options[p.correct]).toBe(`${before} packets`);
    // The packets before it are the ARP request and the ARP reply.
    const lines = outputLines(step.output).filter((l) => /^\d\d:\d\d:\d\d\.\d+ /.test(l));
    expect(lines[0]).toContain("Request who-has");
    expect(lines[1]).toContain("Reply 192.168.1.20 is-at");
  });

  it("virtual-cable: the failing ping got no answer and the test passes", () => {
    const ping = netM1ReplayVirtualCableData.steps[3];
    expect(ping.command).toContain("192.168.1.99");
    expect(ping.output).toContain("0 received, 100% packet loss");
    expect(netM1ReplayVirtualCableData.steps[4].output).toContain("RESULT: all checks passed");
  });
});

describe("the replay data", () => {
  for (const [slug, { data }] of Object.entries(REPLAYS) as [Slug, (typeof REPLAYS)[Slug]][]) {
    it(`${slug}: follows the rules (labels, at most ${MAX_PREDICTS} predictions, three options of similar length)`, () => {
      expect(validateReplay(data)).toEqual([]);
      for (const step of data.steps) {
        expect(["lab", "computer"]).toContain(step.runsOn);
        expect(`${step.command} ${step.output} ${step.note} ${step.predict?.question ?? ""} ${step.predict?.options.join(" ") ?? ""}`).not.toMatch(EM_DASH);
      }
      expect(data.steps.filter((s) => s.predict).length).toBeGreaterThanOrEqual(1);
    });
  }

  it("puts the right answer in a different place in each replay", () => {
    const positions = Object.values(REPLAYS).map(({ data }) => data.steps.find((s) => s.predict)!.predict!.correct);
    expect(new Set(positions).size).toBe(3);
  });

  it("says where each step runs", () => {
    expect(netM1ReplaySetupCheckerData.steps.map((s) => s.runsOn)).toEqual(["lab", "lab", "computer"]);
    for (const s of [...netM1ReplayOwnNumbersData.steps, ...netM1ReplayVirtualCableData.steps]) expect(s.runsOn).toBe("lab");
  });

  it("validateReplay catches broken data", () => {
    const good = netM1ReplayOwnNumbersData;
    const step = good.steps[1];
    const bad = (patch: Partial<typeof step>): ReplayData => ({ steps: [{ ...step, ...patch }] });
    expect(validateReplay({ steps: [] })).toContain("no steps");
    expect(validateReplay(bad({ output: "" }))).toContain("step 1: empty output");
    expect(validateReplay(bad({ note: "a\nb" }))).toContain("step 1: the note is one line");
    expect(validateReplay(bad({ output: "x \ny" }))).toContain("step 1: trailing spaces in the output");
    expect(validateReplay(bad({ predict: { question: "q", options: ["a", "a", "b"], correct: 0 } }))).toContain("step 1: options must differ");
    expect(validateReplay(bad({ predict: { question: "q", options: ["a", "bb", "a very long option"], correct: 0 } }))).toContain("step 1: options differ too much in length");
    const three = { steps: [step, step, step] };
    expect(validateReplay(three)).toContain("3 predictions, at most 2");
  });
});

describe("playing a replay", () => {
  const data = netM1ReplaySetupCheckerData;

  it("starts on the first step with its output showing", () => {
    const s = startState(data);
    expect(s.shown).toBe(1);
    expect(currentIndex(s)).toBe(0);
    expect(awaitingPick(data, s)).toBe(false);
    expect(outputVisible(data, s, 0)).toBe(true);
    expect(outputVisible(data, s, 1)).toBe(false);
    expect(canNext(data, s)).toBe(true);
  });

  it("holds the prediction step until a pick, then shows the output", () => {
    let s = startState(data);
    s = next(data, s);
    s = next(data, s);
    expect(s.shown).toBe(3);
    expect(awaitingPick(data, s)).toBe(true);
    expect(outputVisible(data, s, 2)).toBe(false);
    expect(outputVisible(data, s, 1)).toBe(true);
    expect(canNext(data, s)).toBe(false);
    expect(isLast(data, s)).toBe(true);
    const picked = choose(data, s, 1);
    expect(awaitingPick(data, picked)).toBe(false);
    expect(outputVisible(data, picked, 2)).toBe(true);
    expect(pickResult(data.steps[2].predict!, 1).right).toBe(true);
    expect(pickResult(data.steps[2].predict!, 0)).toEqual({ right: false, text: "Not quite. The recording shows not-in-lab." });
  });

  it("does not move on while a pick is waiting, and ignores a second pick or a bad one", () => {
    let s = startState(netM1ReplayOwnNumbersData);
    s = next(netM1ReplayOwnNumbersData, s);
    expect(awaitingPick(netM1ReplayOwnNumbersData, s)).toBe(true);
    expect(next(netM1ReplayOwnNumbersData, s)).toBe(s);
    expect(choose(netM1ReplayOwnNumbersData, s, 3)).toBe(s);
    expect(choose(netM1ReplayOwnNumbersData, s, -1)).toBe(s);
    expect(choose(netM1ReplayOwnNumbersData, s, 0.5)).toBe(s);
    const picked = choose(netM1ReplayOwnNumbersData, s, 0);
    expect(choose(netM1ReplayOwnNumbersData, picked, 2)).toBe(picked);
    expect(picked.choices[1]).toBe(0);
  });

  it("stops at the last step, and Start over goes back to the first", () => {
    const d = netM1ReplayVirtualCableData;
    let s = startState(d);
    for (let k = 0; k < 20; k++) {
      s = awaitingPick(d, s) ? choose(d, s, 0) : next(d, s);
    }
    expect(s.shown).toBe(d.steps.length);
    expect(canNext(d, s)).toBe(false);
    expect(isLast(d, s)).toBe(true);
    expect(startOver(d)).toEqual(startState(d));
  });

  it("reads each state aloud: the label, the command, and the output only once it shows", () => {
    let s = startState(data);
    expect(liveSummary(data, s)).toContain("Step 1 of 3, In the lab. Command: bash toolkit/check-setup.sh.");
    expect(liveSummary(data, s)).toContain("Output: PASS in-lab");
    s = next(data, next(data, s));
    const hidden = liveSummary(data, s);
    expect(hidden).toContain("Step 3 of 3, On your computer");
    expect(hidden).toContain("The output is hidden.");
    expect(hidden).toContain("Options: no-privilege, not-in-lab, tool-ping.");
    expect(hidden).not.toContain("this is not the lab");
    const shown = liveSummary(data, choose(data, s, 2));
    expect(shown).toContain("Not quite.");
    expect(shown).toContain("this is not the lab");
    expect(shown).not.toMatch(EM_DASH);
    expect(stepLabel(data, 1)).toBe("Step 2 of 3, In the lab");
  });

  it("tells PASS, FAIL and cut lines apart", () => {
    expect(lineKind("PASS in-lab")).toBe("pass");
    expect(lineKind("FAIL not-in-lab: x")).toBe("fail");
    expect(lineKind("...")).toBe("cut");
    expect(lineKind("RESULT: all checks passed")).toBe("plain");
  });
});

describe("what the card draws", () => {
  const noop = () => {};
  const view = (slug: Slug, state: ReplayState) => {
    const { spec, data } = REPLAYS[slug];
    return renderToString(createElement(ReplayView, { title: spec.title, purpose: spec.purpose, limits: spec.limits, data, state, onNext: noop, onStartOver: noop, onPick: noop }));
  };

  it("registers the three slugs", () => {
    for (const [slug, { spec }] of Object.entries(REPLAYS)) expect(canvasRegistry[slug as keyof typeof canvasRegistry], slug).toBe(spec);
  });

  it("has a spec.md next to each, and no em dash, hex colour or raw HTML in the sources", () => {
    const root = path.join("..", "packages", "learning-ui", "src", "canvas");
    const files = ["models/net-replay.ts", "net-m1-replay-setup-checker/ReplayCanvas.tsx"];
    for (const slug of Object.keys(REPLAYS)) {
      expect(fs.existsSync(path.join(root, slug, "spec.md")), slug).toBe(true);
      files.push(`${slug}/data.ts`, `${slug}/spec.md`);
    }
    for (const f of files) {
      const text = fs.readFileSync(path.join(root, f), "utf8");
      expect(text, f).not.toMatch(EM_DASH);
      expect(text, f).not.toMatch(/dangerouslySetInnerHTML|<foreignObject|<script|#[0-9a-fA-F]{6}\b/);
      expect(text, f).not.toMatch(/claude|anthropic|openai|gpt|gemini/i);
    }
  });

  it("names its words without an AI vendor or an em dash, and states its limits", () => {
    for (const { spec } of Object.values(REPLAYS)) {
      const text = `${spec.title} ${spec.purpose} ${spec.limits}`;
      expect(text).not.toMatch(EM_DASH);
      expect(text).not.toMatch(/claude|anthropic|openai|gpt|gemini/i);
      expect(spec.limits.length).toBeGreaterThan(40);
    }
  });

  it("draws the first step on the server: label, command, output, note, Next, Start over, live region, fold", () => {
    const html = view("net-m1-replay-setup-checker", startState(netM1ReplaySetupCheckerData));
    for (const needle of ["In the lab", "Step 1 of 3", "bash toolkit/check-setup.sh", "PASS tool-dhclient", "RESULT: all checks passed", "All 18 checks say PASS", "Next", "Start over", 'aria-live="polite"', "What this picture leaves out", "font-mono"]) {
      expect(html, needle).toContain(needle);
    }
    expect(html).not.toContain("On your computer");
    expect(html).not.toContain("not-in-lab");
    expect(html).not.toMatch(/="NaN"|>NaN<|undefined/);
    expect(html).not.toMatch(EM_DASH);
    expect(html).not.toMatch(/dangerouslySetInnerHTML|<foreignObject|<script|#[0-9a-fA-F]{6}\b/);
  });

  it("disables Next and keeps the output out of the page while a prediction waits", () => {
    for (const [slug, shown] of [
      ["net-m1-replay-setup-checker", 3],
      ["net-m1-replay-own-numbers", 2],
      ["net-m1-replay-virtual-cable", 3],
    ] as const) {
      const { data } = REPLAYS[slug];
      const state: ReplayState = { shown, choices: data.steps.map(() => null) };
      const html = view(slug, state);
      const step = data.steps[shown - 1];
      expect(awaitingPick(data, state)).toBe(true);
      // The question and the three options are tappable buttons; the real output and the note are not in the page.
      expect(html, slug).toContain(step.predict!.question);
      for (const option of step.predict!.options) expect(html, `${slug} ${option}`).toContain(option);
      expect((html.match(/aria-pressed="false"/g) ?? []).length, slug).toBe(3);
      expect(html, slug).toContain("The output stays hidden until you pick.");
      expect(html, slug).toContain("Pick what you expect, then press Next.");
      expect(html, slug).toMatch(/<button[^>]*disabled=""[^>]*>Next<\/button>/);
      // Lines that only this step prints (not any earlier step) must be absent.
      const earlier = data.steps.slice(0, shown - 1).flatMap((st) => outputLines(st.output));
      const own = outputLines(step.output).filter((l) => l !== CUT_LINE && l.trim() !== "" && !earlier.includes(l));
      expect(own.length, slug).toBeGreaterThan(0);
      for (const line of own) expect(html.includes(line.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;")), `${slug}: ${line}`).toBe(false);
      expect(html.includes(step.note), slug).toBe(false);
      expect(html, slug).toContain("The output is hidden.");
    }
  });

  it("marks the pick and the right answer in words once answered", () => {
    const d = netM1ReplayOwnNumbersData;
    const wrong: ReplayState = { shown: 2, choices: [null, 0] };
    const html = view("net-m1-replay-own-numbers", wrong);
    expect(html).toContain("(your pick, not right)");
    expect(html).toContain("(right answer)");
    expect(html).toContain("Not quite. The recording shows /24.");
    expect(html).toContain("prefix    192.168.1.23/24");
    expect(html).toContain(d.steps[1].note);
    const right = view("net-m1-replay-own-numbers", { shown: 2, choices: [null, 2] });
    expect(right).toContain("(your pick, right)");
    expect(right).toContain("Right: /24.");
  });

  it("shows every step label as words, and the Start over control at the end", () => {
    const d = netM1ReplaySetupCheckerData;
    const html = view("net-m1-replay-setup-checker", { shown: 3, choices: [null, null, 1] });
    for (const needle of ["In the lab", "On your computer", "Step 3 of 3", "That was the whole recording. Start over to play it again.", "FAIL not-in-lab: this is not the lab."]) {
      expect(html, needle).toContain(needle);
    }
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Next<\/button>/);
    expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/);
    expect(d.steps[1].output.includes(CUT_LINE)).toBe(true);
  });

  it("renders through the reader's entry point too", () => {
    for (const slug of Object.keys(REPLAYS)) {
      const html = renderToString(createElement(InteractiveCanvas, { slug }));
      expect(html, slug).toContain("Start over");
      expect(html, slug).not.toMatch(/="NaN"|>NaN</);
    }
  });
});
