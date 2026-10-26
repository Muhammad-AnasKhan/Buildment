import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// 5.5 beat 4: six apps, two buckets. The choice is made by what a lost or
// late packet costs the app: an app that needs every byte in order picks TCP;
// an app that is hurt more by waiting than by a gap picks UDP. The DNS card
// stays on UDP; DNS can also use TCP, and a client retries over TCP when a UDP
// answer is cut short (RFC 7766, S71), which the next beat shows. The deck is
// a teaching choice by cost, not a survey of what real products use.

export const TCP_UDP_BUCKETS: SortBucket[] = [
  { id: "tcp", label: "TCP", sub: "every byte, in order" },
  { id: "udp", label: "UDP", sub: "no wait, no promise" },
];

export const TCP_UDP_CARDS: SortCard[] = [
  {
    id: "call",
    text: "A video call: a packet of sound every 20 ms",
    answer: "udp",
    why: { tcp: "A resend arrives late, and a late sound packet is useless." },
  },
  {
    id: "email",
    text: "An email with a one-page report attached",
    answer: "tcp",
    why: { udp: "UDP makes no promise. A missing piece ruins the attachment." },
  },
  {
    id: "dns",
    text: "A DNS question: one short question, one short answer",
    answer: "udp",
    why: { tcp: "One short question needs no handshake. TCP is the fallback." },
  },
  {
    id: "web",
    text: "A web page: its text, its images and its scripts",
    answer: "tcp",
    why: { udp: "A page with missing bytes breaks. It must arrive whole." },
  },
  {
    id: "score",
    text: "A live score, sent again every second",
    answer: "udp",
    why: { tcp: "The next update replaces a lost one. A resend adds delay." },
  },
  {
    id: "backup",
    text: "A file backup to another computer",
    answer: "tcp",
    why: { udp: "A backup with missing bytes is useless. Every byte counts." },
  },
];

export const netM5SortTcpUdp: CustomCanvasSpec = {
  kind: "custom",
  title: "Sort six apps: TCP or UDP",
  purpose: "A video call, an email, DNS, a web page, a live score and a file backup. Drop each one on TCP or UDP by what a lost or late packet costs.",
  limits:
    "A teaching choice by cost, not a survey of what real products use. Real apps have more than two options: for example, DNS uses UDP first and TCP when an answer is cut short, and some web traffic is built differently. The cards are written so that one answer fits the cost they describe.",
  component: makeSorterCanvas({
    buckets: TCP_UDP_BUCKETS,
    cards: TCP_UDP_CARDS,
    deckLabel: "App",
    prompt: "TCP or UDP for this app?",
    hint: "Ask what a lost or late packet costs. Tap TCP or UDP, or drag the card onto it.",
    endNote: "Pick TCP when every byte must arrive in order. Pick UDP when a late packet is worse than a missing one.",
  }),
};
