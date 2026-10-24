import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard, SortVerdicts } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Chapter 7.2: sort eight Ticketline workloads into the four groups that stand
// for the chapter's seven store families. Every card and reason is course text.

export const STORE_BUCKETS: SortBucket[] = [
  { id: "relational", label: "Relational", sub: "joins, transactions" },
  { id: "key", label: "Key-value or document", sub: "fetch by key" },
  { id: "wide", label: "Wide-column or time-series", sub: "flood of writes" },
  { id: "graph", label: "Graph or search", sub: "links or words" },
];

export const STORE_CARDS: SortCard[] = [
  {
    id: "sell-ticket",
    text: "Sell a ticket: lower the seat count, add an order row and a payment row, all or nothing.",
    answer: "relational",
    why: {
      key: "A key-value store protects one record, not three that must change together.",
      wide: "These stores take huge write streams. They give no all-or-nothing change across rows.",
      graph: "Neither engine is built for changing several rows as one step.",
    },
  },
  {
    id: "login-session",
    text: "Keep a login session, read and written by session id, 50,000 times a second.",
    answer: "key",
    why: {
      relational: "It works, but a join and a transaction buy nothing here. A plain key lookup is the whole job.",
      wide: "Sessions are not a stream read by time range. They are looked up by id.",
      graph: "There are no links or words to follow, only an id.",
    },
  },
  {
    id: "gate-scans",
    text: "Store gate scans: 18 a second, never edited, always read as 'gate 2, last hour'.",
    answer: "wide",
    why: {
      relational: "It can hold them, but this is an append-only stream read by time range, which time-ordered stores are built for.",
      key: "A key lookup cannot answer 'last hour at gate 2' without reading every key.",
      graph: "The question is a time range, not links or words.",
    },
  },
  {
    id: "friends-of-friends",
    text: "Find 'friends of friends who bought a ticket', three hops out.",
    answer: "graph",
    why: {
      relational: "Each hop is another self-join, and the work grows with every step.",
      key: "Following a chain of links would mean one lookup per hop, done in your own code.",
      wide: "It is built to append and range-read, not to walk links.",
    },
  },
  {
    id: "search-titles",
    text: "Search event titles for 'jaz' and rank the best matches first.",
    answer: "graph",
    why: {
      relational: "A LIKE with a leading wildcard cannot use a B-tree, and there is no ranking.",
      key: "A key lookup finds exact keys only. It does not rank or forgive typos.",
      wide: "Sorted by key or time, not by how well words match.",
    },
  },
  {
    id: "venue-report",
    text: "Venue report: tickets, events and venues combined and totalled by month.",
    answer: "relational",
    why: {
      key: "Combining three kinds of record means joins, which you would have to do in your own code.",
      wide: "These stores avoid joins by design.",
      graph: "It is a grouping and totalling question, not links or words.",
    },
  },
  {
    id: "whole-order",
    text: "A whole order, with buyer, seats and payment, read as one unit by order id.",
    answer: "key",
    why: {
      relational: "It works, but the whole order is read together by id, so one stored document is simpler and faster.",
      wide: "Orders are not a time-ordered stream.",
      graph: "There is no link or word question here, only a read by id.",
    },
  },
  {
    id: "cooler-sensors",
    text: "Cooler sensors send one reading a second each, charted by time range, and old data is dropped after 90 days.",
    answer: "wide",
    why: {
      relational: "It can hold them at small scale, but huge range reads and dropping old data suit time-series stores.",
      key: "A chart needs a time range, which a key lookup cannot give.",
      graph: "The question is time, not links or words.",
    },
  },
];

export const STORE_VERDICTS: SortVerdicts = {
  clean: "Eight for eight, first try",
  one: "1 card needed a second try",
  many: "{n} cards needed a second try",
};

export const sysdesignM7StoreSorter: CustomCanvasSpec = {
  kind: "custom",
  title: "Sort eight workloads to a store",
  purpose: "Sort eight Ticketline workloads into relational, key-value or document, wide-column or time-series, and graph or search, with a short reason after each wrong try.",
  limits: "Real workloads mix kinds, and several stores can serve one. Four groups stand for seven store families here.",
  component: makeSorterCanvas({
    buckets: STORE_BUCKETS,
    cards: STORE_CARDS,
    deckLabel: "Ticketline workload",
    prompt: "Which store family fits this workload?",
    hint: "Tap the store family that fits, or drag the card onto it.",
    endNote: "Read the clue words. Joins and all-or-nothing: relational. By id: key-value. Every second, last hour: time-series. Hops and words: graph or search.",
    verdicts: STORE_VERDICTS,
  }),
};
