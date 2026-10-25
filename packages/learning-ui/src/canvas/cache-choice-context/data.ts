import type { CustomCanvasSpec } from "../registry";
import type { ContextPickerConfig } from "../models/context-picker";
import { makeContextPickerCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 6.4: Redis or Valkey. Rules read from licence pages,
// release notes and cloud pages (dossier B29 to B41), checked 2026-10-25. The
// start context is Tala's (an internal tool); Munir's company is the second
// "Your use" choice. No rule uses a speed claim as a fact (B36, B37, B40). The
// Redis 8 types are in Redis 8 core (B32) and Valkey forked before them (B34);
// whether a Valkey module covers them was not checked, and the reasons say so.
export const CACHE_CHOICE_CONTEXT: ContextPickerConfig = {
  question: "Which cache fits?",
  factors: [
    {
      id: "use",
      label: "Your use",
      choices: [
        { id: "internal", label: "Internal use" },
        { id: "sell", label: "Sell hosting" },
      ],
    },
    {
      id: "features",
      label: "Features",
      choices: [
        { id: "plain", label: "Plain cache" },
        { id: "types", label: "Redis 8 types" },
      ],
    },
    {
      id: "host",
      label: "Where it runs",
      choices: [
        { id: "own", label: "Own machine" },
        { id: "cloud", label: "AWS or Google" },
        { id: "redis", label: "Redis service" },
      ],
    },
  ],
  options: [
    { id: "redis", label: "Redis", sub: "3 licence options" },
    { id: "valkey", label: "Valkey", sub: "BSD 3-clause" },
    { id: "either", label: "Either", sub: "licence and price" },
  ],
  rules: [
    { when: { use: "sell", features: "types" }, pick: "redis", why: "Redis 8 has these types in core; Valkey forked before them. Read Redis's licences first." },
    { when: { use: "sell" }, pick: "valkey", why: "Selling hosting needs clear terms. Valkey is BSD 3-clause; read Redis's licences." },
    { when: { features: "types" }, pick: "redis", why: "Redis 8 has these types in core. Valkey forked before them: check for a Valkey module." },
    { when: { host: "cloud" }, pick: "valkey", why: "Both clouds list Valkey, and AWS prices it lower (vendor page, checked 2026-10-25)." },
    { when: { host: "redis" }, pick: "redis", why: "You buy Redis's own managed service or support, so that means Redis." },
  ],
  fallback: { pick: "either", why: "A plain cache for your own use: the commands overlap, so licence, host and habit decide." },
  start: { use: "internal", features: "plain", host: "own" },
  hint: "Change one fact at a time and read the reason.",
};

export const cacheChoiceContext: CustomCanvasSpec = {
  kind: "custom",
  title: "The cache depends on your context",
  purpose: "Set your use, the features you need and where the cache runs, and see whether Redis, Valkey or either fits, with the reason.",
  limits:
    "The rules are the course's reading of licence pages, release notes and cloud pages checked on 2026-10-25. They are not legal advice and not a speed ranking: speed claims on both sides are the projects' own. This course did not check whether a Valkey module covers the Redis 8 types. Licences, versions and prices change, so read each page again before you decide.",
  component: makeContextPickerCanvas(CACHE_CHOICE_CONTEXT),
};
