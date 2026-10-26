# Canvas spec: net-m5-match-replies

Course and chapter: networking, 5.2 beat 4 (playable). Renderer: the `sorter` primitive (`primitives/sorter.tsx`, model `models/sorter.ts`); the slug's `data.ts` holds only buckets and cards.

## Claim

The port a reply is addressed to picks the socket on the laptop. Replies from the same website to two tabs differ only in that port, and each belongs to exactly one socket.

## Touch

One card at a time: a reply with its sender and the port it is addressed to. The learner taps one of three sockets (tab 1, port 51234; tab 2, port 51236; chat app, port 40000) or drags the card onto it. A right answer flies into its socket; a wrong try shakes the card and gives a one-line reason that names the port. When the six cards are sorted, a short lesson shows.

## Limits

Three made-up sockets and six made-up replies, with ports chosen for the exercise. In this exercise the port in the reply is enough; a real computer also checks the other four numbers of the conversation. The website (`203.0.113.80`) and the chat server (`192.0.2.44`) use documentation addresses.
