import type { SequenceSpec } from "../renderers/sequence/types";

// 7.3 beat 3: the same question as the empty-cache run, a little later. The
// resolver (10.5.0.1) still holds the answer it copied, and the copy has not
// expired, so it answers from memory: two messages and no question to any
// server above. The answer is 203.0.113.45 (a documentation address [S10])
// with a TTL of 300 seconds. A resolver keeps an answer for its TTL, and zero
// means do not cache [S24]. The names and numbers are made up for the lesson.
export const netM7DnsWarmCache: SequenceSpec = {
  kind: "sequence",
  title: "With a warm cache, there is no walk",
  purpose: "The same question a little later: the resolver already holds the answer, so it replies at once. Two messages, and no question to any server above.",
  summary:
    "The laptop asks its resolver again for the address of shop.example.com. The resolver finds the answer in its cache, and the copy has not expired. It does not ask the root, the .com servers or the servers of example.com. It answers 203.0.113.45 with a TTL of 300 seconds. Two messages in all.",
  actors: [
    { name: "Laptop", sub: "10.5.0.84" },
    { name: "Resolver", sub: "10.5.0.1" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "shop.example.com?",
      title: "1. The laptop asks again",
      note: "A little later, the same question comes in: what is the address of shop.example.com?",
      chips: ["question: shop.example.com"],
    },
    {
      from: 1,
      to: 1,
      label: "cache hit",
      title: "2. The resolver checks its cache",
      note: "It holds the answer from the first visit, and the copy has not run out. It does not ask the root, .com or example.com.",
      chips: ["cached: 203.0.113.45", "TTL not over"],
      tone: "good",
      outcome: "no walk",
    },
    {
      from: 1,
      to: 0,
      label: "203.0.113.45",
      title: "3. The resolver answers at once",
      note: "Two messages in all: the question and the answer. The answer still carries a TTL, because the copy lives only as long as it says.",
      chips: ["A 203.0.113.45", "TTL 300"],
      tone: "good",
      outcome: "2 messages",
    },
  ],
  tryThis: [
    "Compare with the empty-cache run. Count the messages in each: eight, and now two.",
    "Ask yourself what would happen if the TTL were 0. A TTL of zero means do not cache.",
  ],
  limits:
    "One scripted run: one resolver, one A record and no DNSSEC. The picture does not run a clock, so it cannot show the TTL counting down or the copy expiring: that is chapter 7.4. The names, the address 203.0.113.45 and the TTL of 300 are made up for the lesson.",
};
