import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";
import { CHAT_TOKENS, comparison, describeKvChange, gb, kib, kvResult } from "./model";

// AI Engineering Interview course, chapter 11.3 "The KV cache from first
// principles". The running example is a model with 32 layers, 8 KV heads, a
// head size of 128 and 16-bit values: 2 x 32 x 8 x 128 x 2 = 131,072 bytes,
// 128 KiB per token, and 4.29 GB for a chat of 32,768 tokens. See spec.md.

export { describeKvChange, kvBytesPerChat, kvBytesPerToken, kvResult } from "./model";

function computeKv(values: SliderValues): SliderResult {
  const r = kvResult(values);
  const cmp = comparison(r.ratio);
  const chat = CHAT_TOKENS.toLocaleString("en-US");
  return {
    stats: [
      { label: "KV cache per token", value: kib(r.perTokenKiB), detail: `${r.perTokenBytes.toLocaleString("en-US")} bytes` },
      { label: `One ${chat}-token chat`, value: gb(r.chatGB), detail: "one sequence, KV cache only" },
      { label: "Against 32 KV heads", value: cmp.value, detail: cmp.detail },
    ],
    bars: [
      { label: "This model, one chat", value: r.chatGB, display: gb(r.chatGB) },
      { label: "Same, 32 KV heads", value: r.fullGB, display: gb(r.fullGB) },
      { label: "Same, 1 KV head", value: r.oneHeadGB, display: gb(r.oneHeadGB) },
    ],
    summary: `The model keeps ${kib(r.perTokenKiB)} of KV cache for every token, so one chat of ${chat} tokens holds ${gb(r.chatGB)}. With 32 KV heads the same chat would hold ${gb(r.fullGB)}, and with one KV head ${gb(r.oneHeadGB)}.`,
  };
}

export const kvCachePerToken: SliderSpec = {
  kind: "slider",
  title: "How big the KV cache is for one token",
  purpose: "Change the model's shape and see how many bytes the cache keeps for every token, and for one long chat.",
  intro:
    "For every token it has read, the model keeps one key and one value for each layer and each KV head. The size per token is 2 (keys and values) x layers x KV heads x head size x bytes per value. The starting shape is the running example: 32 layers, 8 KV heads, head size 128 and 2 bytes per value (16-bit). A bytes-per-value setting of 1 stands for FP8. Before you move anything, predict how many KiB that is for one token, and how many GB a chat of 32,768 tokens needs.",
  inputs: [
    { id: "layers", label: "Layers", min: 8, max: 80, step: 8, default: 32, unit: "layers" },
    { id: "kvHeads", label: "KV heads", min: 1, max: 64, step: 1, default: 8, unit: "heads" },
    { id: "headSize", label: "Head size", min: 64, max: 256, step: 64, default: 128, unit: "values" },
    { id: "bytesPerValue", label: "Bytes per value (1 = FP8)", min: 1, max: 2, step: 1, default: 2, unit: "bytes" },
  ],
  compute: computeKv,
  describeChange: describeKvChange,
  barsTitle: "KV cache of one 32,768-token chat",
  tryThis: [
    "Double the KV heads from 8 to 16. The cache doubles to 256 KiB per token and one chat to 8.59 GB, because the size is a plain product.",
    "Set bytes per value to 1 (FP8). The cache halves to 64 KiB per token and 2.15 GB per chat, with the same layers, heads and head size.",
  ],
  limits:
    "This sizes one sequence of 32,768 tokens and nothing else: no paging overhead, no weights, no activations and no other chats. The shapes are the example's own, and the 32-head and one-head bars reuse your layers, head size and bytes per value. Real engines may round allocations up.",
};
