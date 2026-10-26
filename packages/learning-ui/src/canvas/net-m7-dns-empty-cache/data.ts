import type { SequenceSpec } from "../renderers/sequence/types";

// 7.3 beat 2: a laptop in the made-up café network (10.5.0.0/24) asks its
// resolver, 10.5.0.1, for shop.example.com. The resolver's cache is empty, so
// it walks the tree: the root points to the .com servers, the .com servers
// point to the servers of example.com, and those servers hold the address,
// 203.0.113.45 (a documentation address [S10]), with a TTL of 300 seconds.
// That is eight messages in all. A resolver asks on behalf of programs and
// servers are authoritative for parts of the tree [S24]. A sequence draws at
// most four lanes, so the laptop is not a lane: its question is step 1 and the
// final answer is step 8, both drawn on the resolver's lane. The names and
// addresses are made up (shop.example.com is a stand-in name).
export const netM7DnsEmptyCache: SequenceSpec = {
  kind: "sequence",
  title: "With an empty cache, the resolver walks the tree",
  purpose: "A laptop asks its resolver for shop.example.com. The cache is empty, so the resolver asks the root, then .com, then example.com's own server, and then answers.",
  summary:
    "The laptop asks its resolver for the address of shop.example.com. The cache is empty. The resolver asks the root, which points to the .com servers. It asks a .com server, which points to the servers of example.com. It asks one of those, which gives the address 203.0.113.45 with a TTL of 300 seconds. The resolver answers the laptop. Eight messages in all.",
  actors: [
    { name: "Resolver", sub: "10.5.0.1" },
    { name: "Root", sub: "the top" },
    { name: "TLD", sub: ".com" },
    { name: "Auth", sub: "example" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "laptop asks",
      title: "1. The laptop asks its resolver",
      note: "One question comes in: what is the address of shop.example.com? The resolver's cache is empty, so it cannot answer from memory.",
      chips: ["question: shop.example.com", "cache: empty"],
    },
    {
      from: 0,
      to: 1,
      label: "shop.example.com?",
      title: "2. The resolver asks the root",
      note: "The resolver starts at the top. The root does not know the address. It knows who runs .com.",
      chips: ["asked: root"],
    },
    {
      from: 1,
      to: 0,
      label: "ask .com servers",
      title: "3. The root points to .com",
      note: "The root answers with who to ask next: the .com servers. It gives no address for shop.example.com.",
      chips: ["answer: ask .com"],
    },
    {
      from: 0,
      to: 2,
      label: "shop.example.com?",
      title: "4. The resolver asks a .com server",
      note: "Same question, one level down. The .com servers know who runs example.com. They do not know the address either.",
      chips: ["asked: .com"],
    },
    {
      from: 2,
      to: 0,
      label: "ask example.com",
      title: "5. The .com server points to example.com",
      note: "The answer is again who to ask next: the servers that run example.com.",
      chips: ["answer: ask example.com"],
    },
    {
      from: 0,
      to: 3,
      label: "shop.example.com?",
      title: "6. The resolver asks example.com's server",
      note: "The last level. The authoritative server is the one that owns the names of example.com.",
      chips: ["asked: authoritative"],
    },
    {
      from: 3,
      to: 0,
      label: "203.0.113.45",
      title: "7. The authoritative server answers",
      note: "At last an address. It comes with a TTL: the resolver may keep a copy for 300 seconds.",
      chips: ["A 203.0.113.45", "TTL 300"],
      tone: "good",
      outcome: "address found",
    },
    {
      from: 0,
      to: 0,
      label: "answers laptop",
      title: "8. The resolver answers the laptop",
      note: "The laptop gets one answer and sees none of the walk. The resolver keeps the copy for 300 seconds. That is eight messages in all.",
      chips: ["8 messages", "copy kept: 300 s"],
      tone: "good",
    },
  ],
  tryThis: [
    "Before you press Next, say who the resolver asks after the root. Then count how many servers it asks in all.",
    "Look at what each server answers. Which one is the only one that gives an address?",
  ],
  limits:
    "One scripted run: an empty cache, one A record and no DNSSEC. The laptop is not drawn as a lane because a sequence shows at most four lanes, so its question and the final answer are steps 1 and 8 on the resolver's lane. The names, the address 203.0.113.45 and the TTL of 300 are made up for the lesson.",
};
