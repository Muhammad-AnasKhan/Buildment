import type { SequenceSpec } from "../renderers/sequence/types";

// AI Engineering Interview course, chapter 11.9 "Interview drill: will this
// deployment fit?". The five-step fit estimate replays worked example 1 of the
// chapter: a model with 8,190,735,360 parameters, 36 layers, 8 KV heads and a
// head size of 128, on one 48 GB GPU with 10% kept back, for 12 chats of
// 16,384 tokens (12 loan officers at a fictional lender). It then checks two
// fixes, an FP8 cache and 8-bit weights. Every number is arithmetic from those
// inputs. See spec.md.
export const deploymentFitSteps: SequenceSpec = {
  kind: "sequence",
  title: "Will it fit? Five multiplications, one check",
  purpose: "Follow the fit estimate for 12 long chats on one 48 GB GPU, step by step, then compare two fixes and their trade-offs.",
  summary:
    "You ask the model for its size. Weights are 8,190,735,360 parameters x 2 bytes, 16.38 GB. The KV cache is 147,456 bytes per token. Twelve chats of 16,384 tokens hold 196,608 tokens, which need 28.99 GB. The GPU has 48 GB x 0.9 = 43.2 GB, and 43.2 GB - 16.38 GB leaves 26.82 GB for the cache. Since 28.99 GB is more than 26.82 GB, it does not fit. An FP8 cache leaves 12.32 GB spare, and 8-bit weights leave 6.02 GB.",
  actors: [
    { name: "You", sub: "estimate" },
    { name: "Model", sub: "its config" },
    { name: "GPU", sub: "48 GB" },
    { name: "Plan", sub: "decision" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "request config",
      title: "Start with the model's numbers",
      note: "You need four facts: the parameter count, the number of layers, the number of KV heads and the head size. Without them any answer is a guess. Ask the interviewer if they are not given.",
      chips: ["8,190,735,360 parameters", "36 layers", "8 KV heads", "head size 128"],
    },
    {
      from: 1,
      to: 0,
      label: "weights 16.38 GB",
      title: "Weights",
      note: "Parameters times bytes per parameter. At 16-bit each parameter is 2 bytes, so 8,190,735,360 x 2 = 16,381,470,720 bytes, which is 16.38 GB.",
      chips: ["8,190,735,360 x 2 = 16.38 GB"],
    },
    {
      from: 1,
      to: 0,
      label: "KV 147,456 bytes",
      title: "KV cache per token",
      note: "Two tensors (key and value) x layers x KV heads x head size x bytes per value. That is 2 x 36 x 8 x 128 x 2 = 147,456 bytes for each token, about 0.15 MB.",
      chips: ["2 x 36 x 8 x 128 x 2 = 147,456 bytes"],
    },
    {
      from: 0,
      to: 0,
      label: "users x context",
      title: "Tokens held at once",
      note: "Count the load in tokens. Twelve chats of 16,384 tokens hold 12 x 16,384 = 196,608 tokens. Each chat needs 2.42 GB of cache, so all 12 need 196,608 x 147,456 bytes = 28.99 GB.",
      chips: ["12 x 16,384 = 196,608 tokens", "needed: 28.99 GB"],
    },
    {
      from: 2,
      to: 2,
      label: "43.2 - 16.38 GB",
      title: "Memory left for the cache",
      note: "This example keeps 10% of the 48 GB for activations and the engine, so 48 x 0.9 = 43.2 GB can be used. Weights take 16.38 GB of that, which leaves 43.2 - 16.38 = 26.82 GB for the KV cache.",
      chips: ["48 x 0.9 = 43.2 GB", "43.2 - 16.38 = 26.82 GB"],
    },
    {
      from: 2,
      to: 0,
      label: "26.82 GB left",
      title: "The GPU reports what is free",
      note: "26.82 GB divided by 2.42 GB per chat is about 11. So this GPU can hold 11 chats of 16,384 tokens, or 11 x 16,384 = 180,224 tokens. Say the answer in chats and in tokens.",
      chips: ["room for 11 chats", "11 x 16,384 = 180,224 tokens"],
    },
    {
      from: 0,
      to: 3,
      label: "28.99 > 26.82 GB",
      tone: "bad",
      outcome: "does not fit",
      title: "Compare and decide",
      note: "The need, 28.99 GB, is more than the 26.82 GB left. The cache is short by 2.17 GB, so 12 chats do not fit and the twelfth has no room. The weights fit alone; the cache is what grows.",
      chips: ["28.99 - 26.82 = 2.17 GB short"],
    },
    {
      from: 3,
      to: 0,
      label: "five fixes",
      title: "A fix has a price",
      note: "FP8 for the cache halves the bytes per token, so check answer quality on your own tests. A shorter context cuts tokens per chat. Fewer users per GPU lowers the load. A second GPU adds memory but also adds parallelism work and cost. Admission control caps the tokens in flight and queues the rest, so it suits a spike, not a steady load: these 12 loan officers are the planned peak, and a queue would leave one of them waiting every day.",
      chips: ["FP8 KV", "shorter context", "fewer users", "second GPU", "admission control"],
    },
    {
      from: 0,
      to: 3,
      label: "choose FP8 KV",
      tone: "good",
      outcome: "fits",
      title: "Check the first fix with the same steps",
      note: "At 1 byte per value the cache needs 73,728 bytes per token. Twelve chats then need half of 28.99 GB, which is 14.50 GB, and that is less than 26.82 GB, so they fit with 12.32 GB to spare. The room doubles from 11 to 22 chats.",
      chips: ["73,728 bytes per token", "need 14.50 GB", "12.32 GB spare"],
    },
    {
      from: 0,
      to: 3,
      label: "8-bit weights",
      tone: "good",
      outcome: "fits",
      title: "Check the second fix the same way",
      note: "At 1 byte per weight the weights take 8,190,735,360 bytes, which is 8.19 GB. The memory left is 43.2 - 8.19 = 35.01 GB, and the 12 chats still need 28.99 GB, so they fit with 6.02 GB to spare. The cache per token does not change, so the room grows by less.",
      chips: ["weights: 8.19 GB", "left: 35.01 GB", "6.02 GB spare"],
    },
    {
      from: 3,
      to: 0,
      label: "answer with trade",
      title: "Say it in the interview order",
      note: "Lead with the number, then the reason, then the trade-off: 12 chats need 28.99 GB of cache but only 26.82 GB is free, so it does not fit, short by 2.17 GB. An FP8 cache leaves 12.32 GB spare and 8-bit weights leave 6.02 GB, because the cache is the larger cost. Both need a quality check. Admission control is only the safety net for a spike above this peak.",
      chips: ["number", "reason", "trade-off"],
    },
  ],
  tryThis: [
    "Before you open the message called The GPU reports what is free, predict how many chats of 16,384 tokens the memory left can hold. Then check the chips: 11. The twelfth does not fit.",
    "Open the messages called Check the first fix with the same steps and Check the second fix the same way, and compare the spare room: 12.32 GB for the FP8 cache and 6.02 GB for 8-bit weights.",
  ],
  limits:
    "This uses one GPU, the example's 10% reserve and 16-bit values unless a fix changes them. It leaves out paging waste, fragmentation, prefix sharing and the speed of the answers, so a real server needs more headroom than the arithmetic shows. The 12 officers and the 16,384-token chats are the example's own numbers.",
};
