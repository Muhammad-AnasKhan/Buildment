# Canvas spec: net-m5-sort-tcp-udp

Course and chapter: networking, 5.5 beat 4 (playable). Renderer: the `sorter` primitive (`primitives/sorter.tsx`, model `models/sorter.ts`); the slug's `data.ts` holds only buckets and cards.

## Claim

Choose TCP or UDP for an app by what a lost or late packet costs it. An app that needs every byte in order picks TCP. An app that is hurt more by waiting than by a gap picks UDP.

## Touch

One card at a time: a video call, an email, a DNS question, a web page, a live score and a file backup. The learner taps TCP or UDP, or drags the card onto it. A wrong try shakes the card and gives a one-line reason about the cost of a loss or a wait. When all six are sorted, a short lesson shows.

## Limits

A teaching choice by cost, not a survey of what real products use. Real apps have more than two options: DNS uses UDP first and TCP when an answer is cut short (RFC 7766, S71), and some web traffic is built differently. Each card is written so that one answer fits the cost it describes.
