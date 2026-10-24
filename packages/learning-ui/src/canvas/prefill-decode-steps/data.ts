import type { SequenceSpec } from "../renderers/sequence/types";

// AI Engineering Interview course, chapter 11.2 "What happens when a model
// answers: prefill and decode". One request through the running example: an
// 8-billion-parameter open model with 32 layers, 8 KV heads and a head size of
// 128, 16.06 GB of weights at 16-bit and 131,072 bytes of KV cache per token.
// The sizes are exact arithmetic; no timings are shown. See spec.md.
export const prefillDecodeSteps: SequenceSpec = {
  kind: "sequence",
  title: "One answer: one prefill, then many decodes",
  purpose: "Follow a 2,000-token prompt through prefill and the first decode steps, and see what each step must read from memory.",
  summary:
    "A prompt of 2,000 tokens reaches the engine. Prefill reads the 16.06 GB of weights once and computes all 2,000 positions together, then saves 2,000 tokens in the KV cache. The first token goes back to the app, which ends the time to first token. Each decode step then reads all the weights and the whole cache to make one token and adds one token to the cache. With 8 users in one batch, one weight read makes 8 tokens. The answer ends when the model stops.",
  actors: [
    { name: "App", sub: "your code" },
    { name: "Engine", sub: "runs model" },
    { name: "Weights", sub: "16.06 GB" },
    { name: "KV cache", sub: "grows" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "2,000-token prompt",
      title: "A prompt arrives",
      note: "The app sends a prompt of 2,000 tokens. The engine will answer in two phases. Prefill reads the whole prompt. Decode then writes the answer one token at a time.",
      chips: ["prompt: 2,000 tokens"],
    },
    {
      from: 1,
      to: 2,
      label: "read weights once",
      title: "Prefill reads the weights one time",
      note: "The engine reads all 16.06 GB of weights once and uses them for all 2,000 positions together. One read is shared by 2,000 tokens, so the arithmetic is the busy part. This is why prefill is called compute-bound.",
      chips: ["weights read: 16.06 GB", "positions in parallel: 2,000"],
    },
    {
      from: 1,
      to: 3,
      label: "save 2,000 tokens",
      title: "The KV cache now holds the prompt",
      note: "Prefill saves a key and a value for every prompt token in every layer. At 131,072 bytes per token, 2,000 tokens take 262,144,000 bytes, about 262 MB (2,000 x 0.13 MB).",
      chips: ["cache: 2,000 tokens", "2,000 x 131,072 = 262,144,000 bytes"],
    },
    {
      from: 1,
      to: 0,
      label: "first token",
      tone: "good",
      outcome: "first token",
      title: "Prefill ends with the first token",
      note: "The first output token goes back to the app. The wait until this moment is the time to first token, and it is mostly the prefill. Everything after this is decode.",
      chips: ["time to first token ends"],
    },
    {
      from: 1,
      to: 2,
      label: "read all 16.06 GB",
      tone: "warn",
      title: "Decode step 1 reads every weight again",
      note: "To make one new token the engine must read all 16.06 GB of weights once more. Only one position is computed, so the arithmetic units wait for memory. This is why decode is memory-bandwidth-bound at small batch.",
      chips: ["weights read: 16.06 GB", "tokens made: 1"],
    },
    {
      from: 1,
      to: 3,
      label: "read, add 1 token",
      title: "Decode also reads and extends the cache",
      note: "The same step reads the whole cache so the new token can attend to every earlier token. It then adds one more entry of 131,072 bytes. The cache now holds 2,001 tokens.",
      chips: ["cache: 2,001 tokens", "added: 131,072 bytes"],
    },
    {
      from: 1,
      to: 2,
      label: "step 2: read again",
      title: "Step 2 does the same work",
      note: "Step 2 reads the 16.06 GB of weights again and the 2,001-token cache, makes one token and adds one entry. The cache grows to 2,002 tokens. Nothing from step 1 is kept except the cache.",
      chips: ["weights read: 16.06 GB", "cache: 2,002 tokens"],
    },
    {
      from: 1,
      to: 1,
      label: "repeat per token",
      title: "The pattern repeats for every token",
      note: "If the answer has 500 tokens (an example number), the engine runs 500 decode steps and reads the weights 500 times, 500 x 16.06 GB = 8,030 GB. The cache grows to 2,500 tokens, 2,500 x 131,072 = 327,680,000 bytes, about 328 MB.",
      chips: ["500 steps x 16.06 GB = 8,030 GB", "cache: 2,500 tokens"],
    },
    {
      from: 1,
      to: 2,
      label: "8 users, 1 read",
      tone: "good",
      outcome: "8 tokens",
      title: "A batch of 8 shares one weight read",
      note: "With 8 users in one batch, one read of the 16.06 GB makes 8 tokens, one per user. The weight read is shared, so throughput rises. Each user still has a cache of their own, 8 x 131,072 = 1,048,576 new bytes per step, and each step does more work, so one user's wait per token can grow.",
      chips: ["weights read: 16.06 GB", "tokens made: 8", "caches: 8, one each"],
    },
    {
      from: 1,
      to: 0,
      label: "answer ends",
      tone: "good",
      outcome: "done",
      title: "The model stops",
      note: "When the model writes its end-of-answer token, decode stops and the app has the full answer. The time per output token is the time of one decode step. The cache for this request can then be freed.",
      chips: ["decode steps: one per token"],
    },
  ],
  tryThis: [
    "Before step 5, predict how much of the weights decode must read to make one token. Then check the chips: all 16.06 GB, the same amount as the whole prefill read.",
    "Compare step 5 with step 9. The weights are read once in both. How many tokens does that one read make in each?",
  ],
  limits:
    "This shows the order of work and the bytes for the running example, not real timings. It uses one GPU and leaves out activations, kernel overhead and the arithmetic itself, so it says nothing about how fast a real server runs. The 2,000-token prompt, the 500-token answer and the batch of 8 are the example's own numbers.",
};
