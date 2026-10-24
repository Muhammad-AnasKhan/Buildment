import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";
import { comparison, describeKvChange, gb, kib, kvResult } from "./model";

// AI Engineering Interview course, chapter 11.3 "The KV cache from first
// principles". The running example is a model with 32 layers, 8 KV heads, a
// head size of 128 (fixed) and 16-bit values: 2 x 32 x 8 x 128 x 2 = 131,072
// bytes, 128 KiB per token, and 4.29 GB for a chat of 32,768 tokens, which the
// "Tokens in the chat" slider can change. See spec.md.

export { describeKvChange, kvBytesPerChat, kvBytesPerToken, kvResult } from "./model";

function computeKv(values: SliderValues): SliderResult {
  const r = kvResult(values);
  const cmp = comparison(r.ratio);
  const chat = r.tokens.toLocaleString("en-US");
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
    "For every token it has read, the model keeps one key and one value for each layer and each KV head. The size per token is 2 (keys and values) x layers x KV heads x head size x bytes per value. The starting shape is the running example: 32 layers, 8 KV heads, head size 128 and 2 bytes per value (16-bit). The head size stays fixed at 128. A bytes-per-value setting of 1 stands for FP8, and the chat starts at 32,768 tokens. Make the prediction above first, then move one slider.",
  inputs: [
    { id: "layers", label: "Layers", min: 8, max: 80, step: 8, default: 32, unit: "layers" },
    { id: "kvHeads", label: "KV heads", min: 1, max: 64, step: 1, default: 8, unit: "heads" },
    { id: "bytesPerValue", label: "Bytes per value (1 = FP8)", min: 1, max: 2, step: 1, default: 2, unit: "bytes" },
    { id: "chatTokens", label: "Tokens in the chat", min: 1_024, max: 131_072, step: 1_024, default: 32_768, unit: "tokens" },
  ],
  compute: computeKv,
  describeChange: describeKvChange,
  barsTitle: "KV cache of one chat",
  tryThis: [
    "Double the KV heads from 8 to 16. The cache doubles to 256 KiB per token and one chat to 8.59 GB, because the size is a plain product.",
    "Set bytes per value to 1 (FP8). The cache halves to 64 KiB per token and 2.15 GB per chat, with the same layers, heads and head size.",
    "Raise the tokens in the chat from 32,768 to 131,072. The cache per token stays at 128 KiB, but one chat grows four times, from 4.29 GB to 17.18 GB, more than the 16.06 GB of weights.",
  ],
  limits:
    "This sizes one sequence of the length you choose and nothing else: no paging overhead, no weights, no activations and no other chats. The shapes are the example's own, the head size is fixed at 128, and the 32-head and one-head bars reuse your layers, bytes per value and chat length. Real engines may round allocations up.",
};
