import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// 7.3 beat 4 (playable): who can answer which question? Each level of the DNS
// tree knows only who runs the level below it [S24]. The root knows who runs
// each top-level name such as .com and .org; the top-level servers know who
// runs each name under them, such as example.com; the authoritative server of
// example.com holds the addresses of its own names. Every card comes from the
// chapter's own text. The names are stand-ins (example.com, shop.example.com).

export const WHO_ANSWERS_BUCKETS: SortBucket[] = [
  { id: "root", label: "Root", sub: "the top" },
  { id: "tld", label: "Top-level", sub: ".com, .org" },
  { id: "auth", label: "Authoritative", sub: "owns its names" },
];

export const WHO_ANSWERS_CARDS: SortCard[] = [
  {
    id: "who-com",
    text: "Who runs .com?",
    answer: "root",
    why: {
      tld: "The .com servers know who runs example.com, one level down. Who runs .com itself is the root's answer.",
      auth: "An authoritative server knows its own names. It does not know who runs .com.",
    },
  },
  {
    id: "who-example-com",
    text: "Who runs example.com?",
    answer: "tld",
    why: {
      root: "The root knows who runs .com. Who runs example.com is one level further down.",
      auth: "example.com's own servers are the answer to this question. The .com servers are the ones that know who they are.",
    },
  },
  {
    id: "addr-shop",
    text: "What is the address of shop.example.com?",
    answer: "auth",
    why: {
      root: "The root knows only who runs .com. It has no address for shop.example.com.",
      tld: "The .com servers know who runs example.com. The address itself is one level further down.",
    },
  },
  {
    id: "who-org",
    text: "Who runs .org?",
    answer: "root",
    why: {
      tld: "The .org servers know who runs the names under .org. Who runs .org itself is the root's answer.",
      auth: "An authoritative server knows its own names, not who runs a top-level name such as .org.",
    },
  },
  {
    id: "who-example-org",
    text: "Who runs example.org?",
    answer: "tld",
    why: {
      root: "The root knows who runs .org. Who runs example.org is one level further down.",
      auth: "example.org's own servers are the answer. The .org servers are the ones that know who they are.",
    },
  },
  {
    id: "addr-api",
    text: "What is the address of api.example.com?",
    answer: "auth",
    why: {
      root: "The root knows only who runs .com. It has no address for api.example.com.",
      tld: "The .com servers know who runs example.com. The address of api.example.com is held lower down.",
    },
  },
];

export const netM7SortWhoAnswers: CustomCanvasSpec = {
  kind: "custom",
  title: "Who can answer this question?",
  purpose: "Sort six DNS questions onto the server that can answer them: the root, a top-level server or an authoritative server. A wrong try says why.",
  limits:
    "A simplified tree with three levels and stand-in names. A real lookup also has caches, and the root, top-level and authoritative servers may each be several machines. The sorting follows this chapter's rule: each level knows only who runs the level below it. Names such as example.com and shop.example.com are stand-ins.",
  component: makeSorterCanvas({
    buckets: WHO_ANSWERS_BUCKETS,
    cards: WHO_ANSWERS_CARDS,
    deckLabel: "DNS question",
    prompt: "Which server can answer?",
    hint: "Tap the server that can answer this question, or drag the card onto it.",
    endNote: "Each level knows only who runs the level below it. Only the authoritative server holds the address.",
  }),
};
