import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// 5.2 beat 4: a laptop (192.168.1.23) has three sockets open: tab 1 on port
// 51234, tab 2 on port 51236 and a chat app on port 40000. Six replies arrive;
// the learner drops each one on the socket its port belongs to. Every card
// shows the sender and the port the reply is addressed to, and the answer is
// found from that port. The website uses 203.0.113.80 and the chat server
// 192.0.2.44, both documentation addresses.

export const MATCH_REPLIES_BUCKETS: SortBucket[] = [
  { id: "tab1", label: "Tab 1", sub: "port 51234" },
  { id: "tab2", label: "Tab 2", sub: "port 51236" },
  { id: "chat", label: "Chat app", sub: "port 40000" },
];

export const MATCH_REPLIES_CARDS: SortCard[] = [
  {
    id: "page-a",
    text: "Page text from 203.0.113.80:443, addressed to port 51236",
    answer: "tab2",
    why: {
      tab1: "Tab 1 is port 51234. This reply says port 51236.",
      chat: "The chat app is port 40000. This reply says port 51236.",
    },
  },
  {
    id: "chat-a",
    text: "A message from 192.0.2.44:5222, addressed to port 40000",
    answer: "chat",
    why: {
      tab1: "Tab 1 is port 51234. This reply says port 40000.",
      tab2: "Tab 2 is port 51236. This reply says port 40000.",
    },
  },
  {
    id: "page-b",
    text: "An image from 203.0.113.80:443, addressed to port 51234",
    answer: "tab1",
    why: {
      tab2: "Both tabs hear from port 443. Read the port it is sent to.",
      chat: "The chat app is port 40000. This reply says port 51234.",
    },
  },
  {
    id: "page-c",
    text: "Page text from 203.0.113.80:443, addressed to port 51234",
    answer: "tab1",
    why: {
      tab2: "Tab 2 is port 51236. This reply says port 51234.",
      chat: "The chat app is port 40000. This reply says port 51234.",
    },
  },
  {
    id: "page-d",
    text: "A script from 203.0.113.80:443, addressed to port 51236",
    answer: "tab2",
    why: {
      tab1: "Same website, other tab. This reply says port 51236.",
      chat: "The chat app is port 40000. This reply says port 51236.",
    },
  },
  {
    id: "chat-b",
    text: "Who is online, from 192.0.2.44:5222, to port 40000",
    answer: "chat",
    why: {
      tab1: "Tab 1 is port 51234. This reply says port 40000.",
      tab2: "Tab 2 is port 51236. This reply says port 40000.",
    },
  },
];

export const netM5MatchReplies: CustomCanvasSpec = {
  kind: "custom",
  title: "Drop each reply on its socket",
  purpose: "Six replies arrive at one laptop. Drop each one on the socket whose port it is addressed to: tab 1, tab 2 or the chat app.",
  limits:
    "Three made-up sockets and six made-up replies, with ports chosen for the exercise. Here the port in the reply is enough to pick the socket. A real computer also checks the other four numbers of the conversation, which the previous beat showed. The website and the chat server use documentation addresses.",
  component: makeSorterCanvas({
    buckets: MATCH_REPLIES_BUCKETS,
    cards: MATCH_REPLIES_CARDS,
    deckLabel: "Reply to the laptop",
    prompt: "Which socket gets this reply?",
    hint: "Read the port the reply is addressed to. Tap the socket with that port, or drag the card onto it.",
    endNote: "The port a reply is addressed to picks the socket. Two tabs on the same website differ only in that port.",
  }),
};
