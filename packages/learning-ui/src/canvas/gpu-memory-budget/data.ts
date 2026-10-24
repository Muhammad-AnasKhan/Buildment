import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";
import { describeBudgetChange, gb, memoryBudget, verdictText } from "./model";

// AI Engineering Interview course, chapter 11.4 "GPU memory budgeting and
// sizing". The running example: an 80 GB GPU, 10% kept back, 16.06 GB of
// weights at 16-bit, so 55.94 GB is left for the KV cache. 20 chats of 32,768
// tokens need 85.90 GB, so the server is out of memory by 29.96 GB and 13
// users fit. See spec.md.

export { describeBudgetChange, memoryBudget } from "./model";

function computeBudget(values: SliderValues): SliderResult {
  const b = memoryBudget(values);
  const tokens = b.tokens.toLocaleString("en-US");
  return {
    stats: [
      { label: "KV needed vs available", value: `${gb(b.neededGB)} vs ${gb(b.availableGB)}`, detail: `${b.users} users x ${tokens} tokens` },
      {
        label: "Verdict",
        value: verdictText(b),
        detail: b.fits ? "the cache fits beside the weights" : "more cache than the memory left",
      },
      {
        label: "Most users that fit",
        value: b.maxUsers.toLocaleString("en-US"),
        detail: `at ${tokens} tokens each`,
      },
    ],
    bars: [
      { label: "Weights (16-bit)", value: b.weightsGB, display: gb(b.weightsGB) },
      { label: "KV needed", value: b.neededGB, display: gb(b.neededGB), tone: b.fits ? undefined : "bad" },
      { label: "KV available", value: b.availableGB, display: gb(b.availableGB) },
    ],
    summary: `${b.users} users with ${tokens} tokens each need ${gb(b.neededGB)} of KV cache, and ${gb(b.availableGB)} is left after the weights and the reserve on a ${b.gpuGB} GB GPU. ${b.fits ? "It fits." : `It is out of memory by ${gb(b.gapGB)}.`} At most ${b.maxUsers} users fit at this context.`,
  };
}

export const gpuMemoryBudget: SliderSpec = {
  kind: "slider",
  title: "Will the KV cache fit beside the weights?",
  purpose: "Set users, context, KV precision and GPU size and see whether the cache fits in the memory left after the weights.",
  intro:
    "Nour's team runs the running example's model on one GPU. The weights take 16.06 GB at 16-bit. In this example 10% of the GPU is kept back for activations and the engine, and the rest holds the weights and the KV cache. The cache needs users x tokens per user x bytes per token, where one token takes 131,072 bytes at 16-bit and 65,536 at FP8. Before you move anything, predict whether 20 users with 32,768 tokens each fit on an 80 GB GPU.",
  inputs: [
    { id: "users", label: "Users with a chat open", min: 1, max: 64, step: 1, default: 20, unit: "users" },
    { id: "tokens", label: "Tokens per user", min: 1_024, max: 131_072, step: 1_024, default: 32_768, unit: "tokens" },
    { id: "bytesPerValue", label: "KV bytes per value (1 = FP8)", min: 1, max: 2, step: 1, default: 2, unit: "bytes" },
    { id: "gpuGB", label: "GPU memory", min: 24, max: 192, step: 8, default: 80, unit: "GB" },
  ],
  compute: computeBudget,
  describeChange: describeBudgetChange,
  barsTitle: "Memory in GB",
  tryThis: [
    "Set KV bytes per value to 1 (FP8). The cache needed halves to 42.95 GB, which fits in the 55.94 GB left, and 26 users fit.",
    "Leave FP8 off and raise GPU memory from 80 to 96 GB. KV available rises to 70.34 GB, which is still short of 85.90 GB, and 16 users fit.",
  ],
  limits:
    "One GPU, the example's 10% reserve, and the weights stay at 16-bit. There is no paging waste or fragmentation, and every user holds the full context at once. Real engines choose their own memory share, so use this to size a plan, not to promise a result.",
};
