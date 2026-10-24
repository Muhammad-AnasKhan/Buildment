import type { SequenceSpec } from "../renderers/sequence/types";

// AI Engineering Interview course, chapter 11.9 "Interview drill: will this
// deployment fit?". The five-step fit estimate on the running example: an
// 8-billion-parameter open model with 32 layers, 8 KV heads and a head size of
// 128, on one 80 GB GPU with 10% kept back, for 20 chats of 32,768 tokens.
// Every number is arithmetic from those inputs. See spec.md.
export const deploymentFitSteps: SequenceSpec = {
  kind: "sequence",
  title: "Will it fit? Five multiplications, one check",
  purpose: "Follow the fit estimate for 20 long chats on one 80 GB GPU, step by step, and end with a fix and its trade-off.",
  summary:
    "You ask the model for its size. Weights are 8,030,261,248 parameters x 2 bytes, 16.06 GB. The KV cache is 131,072 bytes per token. Twenty chats of 32,768 tokens hold 655,360 tokens, which need 85.9 GB. The GPU has 80 GB x 0.9 = 72 GB, and 72 GB - 16.06 GB leaves 55.94 GB for the cache. Since 85.9 GB is more than 55.94 GB, it does not fit. FP8 for the cache halves the need to 42.95 GB, so it fits.",
  actors: [
    { name: "You", sub: "estimate" },
    { name: "Model", sub: "its config" },
    { name: "GPU", sub: "80 GB" },
    { name: "Plan", sub: "decision" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "request config",
      title: "Start with the model's numbers",
      note: "You need four facts: the parameter count, the number of layers, the number of KV heads and the head size. Without them any answer is a guess. Ask the interviewer if they are not given.",
      chips: ["8,030,261,248 parameters", "32 layers", "8 KV heads", "head size 128"],
    },
    {
      from: 1,
      to: 0,
      label: "weights 16.06 GB",
      title: "Weights",
      note: "Parameters times bytes per parameter. At 16-bit each parameter is 2 bytes, so 8,030,261,248 x 2 = 16,060,522,496 bytes, which is 16.06 GB.",
      chips: ["8,030,261,248 x 2 = 16.06 GB"],
    },
    {
      from: 1,
      to: 0,
      label: "KV 131,072 bytes",
      title: "KV cache per token",
      note: "Two tensors (key and value) x layers x KV heads x head size x bytes per value. That is 2 x 32 x 8 x 128 x 2 = 131,072 bytes for each token, about 0.13 MB.",
      chips: ["2 x 32 x 8 x 128 x 2 = 131,072 bytes"],
    },
    {
      from: 0,
      to: 0,
      label: "users x context",
      title: "Tokens held at once",
      note: "Count the load in tokens. Twenty chats of 32,768 tokens hold 20 x 32,768 = 655,360 tokens. Each chat needs 4.29 GB of cache, so all 20 need 655,360 x 131,072 bytes = 85.9 GB.",
      chips: ["20 x 32,768 = 655,360 tokens", "needed: 85.9 GB"],
    },
    {
      from: 2,
      to: 2,
      label: "72 - 16.06 GB",
      title: "Memory left for the cache",
      note: "This example keeps 10% of the 80 GB for activations and the engine, so 80 x 0.9 = 72 GB can be used. Weights take 16.06 GB of that, which leaves 72 - 16.06 = 55.94 GB for the KV cache.",
      chips: ["80 x 0.9 = 72 GB", "72 - 16.06 = 55.94 GB"],
    },
    {
      from: 2,
      to: 0,
      label: "55.94 GB left",
      title: "The GPU reports what is free",
      note: "55.94 GB divided by 4.29 GB per chat is about 13. So this GPU can hold 13 chats of 32,768 tokens, or 13 x 32,768 = 425,984 tokens. Say the answer in chats and in tokens.",
      chips: ["room for 13 chats", "13 x 32,768 = 425,984 tokens"],
    },
    {
      from: 0,
      to: 3,
      label: "85.9 > 55.94 GB",
      tone: "bad",
      outcome: "does not fit",
      title: "Compare and decide",
      note: "The need, 85.9 GB, is more than the 55.94 GB left. The cache is short by 29.96 GB, so 20 chats do not fit and the server runs out of memory. The weights fit alone; the cache is what grows.",
      chips: ["85.9 - 55.94 = 29.96 GB short"],
    },
    {
      from: 3,
      to: 0,
      label: "five fixes",
      title: "A fix has a price",
      note: "FP8 for the cache halves the bytes per token, so check answer quality on your own tests. A shorter context cuts tokens per chat. Fewer users per GPU lowers the load. A second GPU adds memory but also adds parallelism work and cost. Admission control caps the tokens in flight and queues the rest.",
      chips: ["FP8 KV", "shorter context", "fewer users", "second GPU", "admission control"],
    },
    {
      from: 0,
      to: 3,
      label: "choose FP8 KV",
      tone: "good",
      outcome: "fits",
      title: "Check the first fix with the same steps",
      note: "At 1 byte per value the cache needs 65,536 bytes per token. Twenty chats then need half of 85.9 GB, which is 42.95 GB, and that is less than 55.94 GB, so they fit with 12.99 GB to spare. The limit also doubles from 13 to 26 chats.",
      chips: ["65,536 bytes per token", "need 42.95 GB", "26 chats fit"],
    },
    {
      from: 3,
      to: 0,
      label: "answer with trade",
      title: "Say it in the interview order",
      note: "Lead with the number, then the reason, then the trade-off: 20 chats need 85.9 GB of cache but only 55.94 GB is free, so it does not fit. FP8 for the cache halves the need to 42.95 GB, at the cost of a quality check. Admission control is the safer second fix.",
      chips: ["number", "reason", "trade-off"],
    },
  ],
  tryThis: [
    "Before you open the message called Compare and decide, predict whether 20 chats of 32,768 tokens fit. Then compare 85.9 GB with the 55.94 GB left.",
    "At the message called Check the first fix with the same steps, the cache bytes per value drop from 2 to 1. Predict how many chats fit now, then check the chips: 26.",
  ],
  limits:
    "This uses one GPU, the example's 10% reserve and a model kept at 16-bit weights. It leaves out paging waste, fragmentation, prefix sharing and the speed of the answers, so a real server needs more headroom than the arithmetic shows. The 20 chats and the 32,768-token context are the example's own numbers.",
};
