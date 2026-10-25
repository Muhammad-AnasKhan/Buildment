import { describe, expect, it } from "vitest";
import type { SequenceSpec } from "@buildment/learning-ui/canvas/renderers/sequence/types";
import { sequenceGeometry } from "@buildment/learning-ui/canvas/renderers/sequence/geometry";
import { defaultWeights, describeChange, maxTotal, scoreOptions, standing } from "@buildment/learning-ui/canvas/renderers/factor/model";
import { prefillDecodeSteps } from "@buildment/learning-ui/canvas/prefill-decode-steps/data";
import { deploymentFitSteps } from "@buildment/learning-ui/canvas/deployment-fit-steps/data";
import { selfHostOrApi as factor } from "@buildment/learning-ui/canvas/self-host-or-api/data";

// The label-fit loop from tests/unit/canvas/registry.test.ts, run on the two
// module 11 sequence canvases until the orchestrator registers them.
const specs: [string, SequenceSpec][] = [
  ["prefill-decode-steps", prefillDecodeSteps],
  ["deployment-fit-steps", deploymentFitSteps],
];

// The running example, derived here so the canvas text is checked against arithmetic.
const PARAMS = 8_030_261_248;
const WEIGHTS_BYTES = PARAMS * 2;
const KV_PER_TOKEN = 2 * 32 * 8 * 128 * 2;
const CHAT_TOKENS = 32_768;
const CHAT_BYTES = CHAT_TOKENS * KV_PER_TOKEN;
const GB = 1e9;
// En and em dashes, built from code points so this file has none itself.
const DASHES = new RegExp("[" + String.fromCharCode(8211, 8212) + "]");

const textOf = (spec: SequenceSpec) => JSON.stringify(spec);
const chipsOf = (spec: SequenceSpec) => spec.steps.flatMap((s) => s.chips ?? []);

describe("module 11 sequence canvases", () => {
  for (const [slug, spec] of specs) {
    it(`${slug}: steps point at real lanes and fit a phone`, () => {
      expect(spec.actors.length).toBeGreaterThanOrEqual(2);
      expect(spec.actors.length).toBeLessThanOrEqual(4);
      for (const step of spec.steps) {
        expect(step.from).toBeGreaterThanOrEqual(0);
        expect(step.from).toBeLessThan(spec.actors.length);
        expect(step.to).toBeGreaterThanOrEqual(0);
        expect(step.to).toBeLessThan(spec.actors.length);
        expect(step.label.length, step.label).toBeLessThanOrEqual(18);
      }
      for (const layout of ["narrow", "wide"] as const) {
        const g = sequenceGeometry(spec, layout);
        spec.steps.forEach((step, i) => {
          const { label } = g.arrow(step, i);
          const w = step.label.length * g.charW;
          const left = label.anchor === "start" ? label.x : label.anchor === "end" ? label.x - w : label.x - w / 2;
          expect(left, `${layout} ${step.label}`).toBeGreaterThanOrEqual(0);
          expect(left + w, `${layout} ${step.label}`).toBeLessThanOrEqual(g.width);
        });
      }
    });

    it(`${slug}: lane names (8) and subtitles (10) fit a 375px phone, copy is complete`, () => {
      for (const actor of spec.actors) {
        expect(actor.name.length, actor.name).toBeLessThanOrEqual(8);
        expect((actor.sub ?? "").length, actor.sub).toBeLessThanOrEqual(10);
      }
      expect(spec.title).toBeTruthy();
      expect(spec.purpose).toBeTruthy();
      expect(spec.summary).toBeTruthy();
      expect(spec.limits.length).toBeGreaterThan(20);
      expect(spec.tryThis?.length).toBe(2);
      for (const step of spec.steps) {
        expect(step.title, step.label).toBeTruthy();
        expect(step.note.length, step.label).toBeGreaterThan(20);
      }
    });

    it(`${slug}: plain English with no dashes or product names`, () => {
      const text = textOf(spec);
      expect(text).not.toMatch(DASHES);
      expect(text).not.toMatch(/\b(A100|H100|H200|B200|Llama|Mistral|Qwen|Gemma|GPT|Nvidia|CUDA|TensorRT|Hugging)\b/i);
    });
  }

  it("the running example's arithmetic is right", () => {
    expect(WEIGHTS_BYTES / GB).toBeCloseTo(16.06, 2);
    expect(KV_PER_TOKEN).toBe(131_072);
    expect(CHAT_BYTES / GB).toBeCloseTo(4.29, 2);
    expect((20 * CHAT_BYTES) / GB).toBeCloseTo(85.9, 1);
    const left = (80 * 0.9 * GB - WEIGHTS_BYTES) / GB;
    expect(left).toBeCloseTo(55.94, 2);
    expect(Math.floor((left * GB) / CHAT_BYTES)).toBe(13);
    expect(Math.floor((left * GB) / (CHAT_BYTES / 2))).toBe(26);
    expect((20 * CHAT_BYTES) / GB - left).toBeCloseTo(29.96, 2);
  });

  it("prefill-decode-steps: two phases, the weights read per step and the cache size", () => {
    const chips = chipsOf(prefillDecodeSteps);
    const text = textOf(prefillDecodeSteps);
    expect(prefillDecodeSteps.steps.length).toBeGreaterThanOrEqual(8);
    expect(prefillDecodeSteps.steps.length).toBeLessThanOrEqual(11);
    expect(prefillDecodeSteps.actors.map((a) => a.name)).toEqual(["App", "Engine", "Weights", "KV cache"]);
    // 2,000 x 131,072 bytes, about 262 MB.
    expect(2000 * KV_PER_TOKEN).toBe(262_144_000);
    expect(chips).toContain("2,000 x 131,072 = 262,144,000 bytes");
    expect(text).toContain("about 262 MB");
    // One decode token appends 131,072 bytes; the cache is 2,001 then 2,002 tokens.
    expect(chips).toContain("cache: 2,001 tokens");
    expect(chips).toContain("cache: 2,002 tokens");
    expect(chips).toContain("added: 131,072 bytes");
    // 500 x 16.06 GB = 8,030 GB; 2,500 tokens = 327,680,000 bytes.
    expect(500 * 16.06).toBeCloseTo(8030, 5);
    expect(2500 * KV_PER_TOKEN).toBe(327_680_000);
    expect(chips).toContain("500 steps x 16.06 GB = 8,030 GB");
    expect(text).toContain("327,680,000 bytes");
    // A batch of 8: one weight read, 8 tokens, 8 x 131,072 = 1,048,576 new bytes.
    expect(8 * KV_PER_TOKEN).toBe(1_048_576);
    expect(text).toContain("1,048,576");
    expect(chips).toContain("tokens made: 8");
    // Every weight read is the full 16.06 GB, never a fraction.
    const weightReads = prefillDecodeSteps.steps.filter((s) => s.to === 2);
    expect(weightReads.length).toBeGreaterThanOrEqual(4);
    for (const s of weightReads) expect(s.chips?.join(" ") ?? "", s.label).toContain("16.06 GB");
    // Time to first token ends on the step that returns to the app after prefill.
    const first = prefillDecodeSteps.steps.findIndex((s) => s.outcome === "first token");
    const firstDecode = prefillDecodeSteps.steps.findIndex((s) => s.label === "read all 16.06 GB");
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThan(firstDecode);
    // No real timings.
    expect(text).not.toMatch(/\d\s?(ms|milliseconds|tokens per second|tokens a second)\b/i);
  });

  it("prefill-decode-steps: one numbering scheme, messages are named by title", () => {
    const labels = prefillDecodeSteps.steps.map((s) => s.label);
    const titles = prefillDecodeSteps.steps.map((s) => s.title);
    // Arrow labels and notes never number the decodes ("step 2"), because the renderer prints its own "Step N of M".
    expect(labels).toContain("second decode");
    expect(JSON.stringify(prefillDecodeSteps.steps.map((s) => [s.label, s.note]))).not.toMatch(/\bstep\s*\d/i);
    for (const title of titles) expect(title, title).not.toMatch(/\bstep\s*\d/i);
    const tries = prefillDecodeSteps.tryThis!;
    for (const line of tries) expect(line).not.toMatch(/\bstep\s*\d/i);
    expect(tries[0]).toContain("The first decode reads every weight again");
    expect(tries[1]).toContain("A batch of 8 shares one weight read");
    expect(titles).toContain("The first decode reads every weight again");
    expect(titles).toContain("A batch of 8 shares one weight read");
  });

  it("deployment-fit-steps: the five-step estimate replays worked example 1 and checks two fixes", () => {
    const chips = chipsOf(deploymentFitSteps);
    const text = textOf(deploymentFitSteps);
    // Worked example 1: 8,190,735,360 parameters, 36 layers, 8 KV heads, head size 128, 48 GB, 12 chats of 16,384 tokens.
    const params = 8_190_735_360;
    const weights = params * 2;
    const kv = 2 * 36 * 8 * 128 * 2;
    const chat = 16_384;
    const tokens = 12 * chat;
    const need = tokens * kv;
    const left = 48 * 0.9 * GB - weights;
    expect(deploymentFitSteps.actors.map((a) => a.name)).toEqual(["You", "Model", "GPU", "Plan"]);
    expect(deploymentFitSteps.steps.length).toBeGreaterThanOrEqual(8);
    expect(deploymentFitSteps.steps.length).toBeLessThanOrEqual(11);
    expect(weights / GB).toBeCloseTo(16.38, 2);
    expect(chips).toContain("8,190,735,360 x 2 = 16.38 GB");
    expect(text).toContain("16,381,470,720 bytes");
    expect(weights).toBe(16_381_470_720);
    expect(kv).toBe(147_456);
    expect(chips).toContain("2 x 36 x 8 x 128 x 2 = 147,456 bytes");
    expect(tokens).toBe(196_608);
    expect(chips).toContain("12 x 16,384 = 196,608 tokens");
    expect((chat * kv) / GB).toBeCloseTo(2.42, 2);
    expect(need / GB).toBeCloseTo(28.99, 2);
    expect(chips).toContain("needed: 28.99 GB");
    expect(chips).toContain("48 x 0.9 = 43.2 GB");
    expect(left / GB).toBeCloseTo(26.82, 2);
    expect(chips).toContain("43.2 - 16.38 = 26.82 GB");
    expect(Math.floor(left / (chat * kv))).toBe(11);
    expect(Math.floor(left / kv)).toBe(181_874);
    expect(chips).toContain("room for 11 chats");
    expect(11 * chat).toBe(180_224);
    expect(chips).toContain("11 x 16,384 = 180,224 tokens");
    expect((need - left) / GB).toBeCloseTo(2.17, 2);
    expect(chips).toContain("28.99 - 26.82 = 2.17 GB short");
    // First fix, FP8 cache: half the bytes per token, 14.50 GB, 12.32 GB spare, 22 chats.
    expect(kv / 2).toBe(73_728);
    expect(chips).toContain("73,728 bytes per token");
    expect(need / 2 / GB).toBeCloseTo(14.5, 2);
    expect(chips).toContain("need 14.50 GB");
    expect((left - need / 2) / GB).toBeCloseTo(12.32, 2);
    expect(chips).toContain("12.32 GB spare");
    expect(Math.floor(left / (chat * (kv / 2)))).toBe(22);
    // Second fix, 8-bit weights: 8.19 GB, 35.01 GB left, 6.02 GB spare.
    const weights8 = params;
    const left8 = 48 * 0.9 * GB - weights8;
    expect(weights8 / GB).toBeCloseTo(8.19, 2);
    expect(left8 / GB).toBeCloseTo(35.01, 2);
    expect((left8 - need) / GB).toBeCloseTo(6.02, 2);
    expect(chips).toContain("weights: 8.19 GB");
    expect(chips).toContain("left: 35.01 GB");
    expect(chips).toContain("6.02 GB spare");
    // The FP8 cache leaves more spare room than 8-bit weights, because the cache is the larger cost.
    expect(left - need / 2).toBeGreaterThan(left8 - need);
    // The verdict step is the only "bad" one and says it does not fit; both fixes say they fit.
    const bad = deploymentFitSteps.steps.filter((s) => s.tone === "bad");
    expect(bad).toHaveLength(1);
    expect(bad[0]!.outcome).toBe("does not fit");
    expect(deploymentFitSteps.steps.find((s) => s.label === "choose FP8 KV")?.outcome).toBe("fits");
    expect(deploymentFitSteps.steps.find((s) => s.label === "8-bit weights")?.outcome).toBe("fits");
    // All five fixes from the pack are listed, and admission control is described as a spike tool.
    const fixes = deploymentFitSteps.steps.find((s) => s.label === "five fixes")!;
    expect(fixes.chips).toEqual(["FP8 KV", "shorter context", "fewer users", "second GPU", "admission control"]);
    expect(fixes.note).toMatch(/suits a spike, not a steady load/);
    expect(text).not.toMatch(/safer second fix/i);
    const last = deploymentFitSteps.steps[deploymentFitSteps.steps.length - 1]!;
    expect(last.note).toMatch(/safety net for a spike/);
    // Titles are plain words: no "Step N:" prefix to clash with the renderer's own "Step N of M" counter.
    const titles = deploymentFitSteps.steps.map((s) => s.title);
    for (const title of titles) expect(title, title).not.toMatch(/\bstep\s*\d/i);
    expect(titles.slice(1, 5)).toEqual(["Weights", "KV cache per token", "Tokens held at once", "Memory left for the cache"]);
    expect(titles[6]).toBe("Compare and decide");
    expect(deploymentFitSteps.steps[6]!.label).toBe("28.99 > 26.82 GB");
    // Try this names messages by title, never by step number, and the titles it names exist.
    const tries = deploymentFitSteps.tryThis!;
    for (const line of tries) expect(line).not.toMatch(/\bstep\s*\d/i);
    expect(titles).toContain("The GPU reports what is free");
    expect(titles).toContain("Check the first fix with the same steps");
    expect(titles).toContain("Check the second fix the same way");
    expect(tries[0]).toBe(
      "Before you open the message called The GPU reports what is free, predict how many chats of 16,384 tokens the memory left can hold. Then check the chips: 11. The twelfth does not fit.",
    );
    expect(tries[1]).toBe(
      "Open the messages called Check the first fix with the same steps and Check the second fix the same way, and compare the spare room: 12.32 GB for the FP8 cache and 6.02 GB for 8-bit weights.",
    );
    // The estimate is done in tokens, and the answer leads with the number.
    expect(text).toMatch(/tokens held at once/i);
  });
});

describe("self-host-or-api factor canvas", () => {
  const all = (w: number) => Object.fromEntries(factor.criteria.map((c) => [c.id, w]));
  const totalsOf = (weights: Record<string, number>) => scoreOptions(factor, weights).totals;
  const lead = (weights: Record<string, number>) => standing(factor, totalsOf(weights));

  it("has two options, five criteria, weights 2 and scores on the 1 to 5 scale", () => {
    expect(factor.options.map((o) => o.id)).toEqual(["api", "self"]);
    expect(factor.criteria).toHaveLength(5);
    expect(factor.criteria.map((c) => c.id)).toEqual(["data", "cost", "effort", "launch", "control"]);
    const levels = factor.weightLevels.map((l) => l.value);
    expect(levels).toEqual([1, 2, 3]);
    for (const c of factor.criteria) {
      expect(c.weight).toBe(2);
      expect(levels).toContain(c.weight);
      for (const o of factor.options) {
        expect(c.scores[o.id]).toBeGreaterThanOrEqual(factor.scoreScale.min);
        expect(c.scores[o.id]).toBeLessThanOrEqual(factor.scoreScale.max);
      }
    }
    expect(factor.tryThis).toHaveLength(2);
  });

  it("starts with every weight at 2: hosted API 32, self-hosted engine 34", () => {
    expect(totalsOf(defaultWeights(factor))).toEqual({ api: 32, self: 34 });
    expect(lead(defaultWeights(factor))).toEqual({ leaders: ["self"], tie: false, margin: 2 });
  });

  it("handles the minimum and maximum weights", () => {
    expect(totalsOf(all(1))).toEqual({ api: 16, self: 17 });
    expect(totalsOf(all(3))).toEqual({ api: 48, self: 51 });
    expect(maxTotal(factor)).toBe(75);
  });

  it("backs every Try this claim", () => {
    const dataThree = { ...defaultWeights(factor), data: 3 };
    expect(totalsOf(dataThree)).toEqual({ api: 34, self: 39 });
    expect(lead(dataThree)).toEqual({ leaders: ["self"], tie: false, margin: 5 });
    expect(factor.tryThis[0]).toContain("39 to 34");

    const effortAndLaunch = { ...dataThree, effort: 3, launch: 3 };
    expect(totalsOf(effortAndLaunch)).toEqual({ api: 44, self: 42 });
    expect(lead(effortAndLaunch)).toEqual({ leaders: ["api"], tie: false, margin: 2 });
    expect(factor.tryThis[1]).toContain("44 to 42");
  });

  it("says in words what changed", () => {
    const start = defaultWeights(factor);
    expect(describeChange(factor, start, { ...start, data: 3 })).toBe(
      "You raised Data stays in network from 2 (important) to 3 (very important). That moved Hosted API +2 points, Self-hosted engine +5 points. Self-hosted engine still leads, now by 5 points."
    );
    const before = { ...start, data: 3 };
    expect(describeChange(factor, before, { ...before, effort: 3, launch: 3 })).toBe("You changed 2 weights. Hosted API leads by 2 points.");
  });

  it("labels the scores as the example's judgement, in plain English", () => {
    const text = JSON.stringify(factor);
    expect(factor.whatThisShows).toMatch(/example's own judgement/);
    expect(factor.limits).toMatch(/judgement/);
    expect(text).not.toMatch(DASHES);
    expect(text).not.toMatch(/\b(A100|H100|Llama|Mistral|GPT|Nvidia|OpenAI|Anthropic|Claude)\b/i);
  });
});
