# Canvas spec: net-m8-journey-first-byte

Course and chapter: networking, 8.1 beat 7 (step 10 of the journey). Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`. Spec: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

The last handshake message makes the connection open on both sides. Then the request goes out, and the first byte of the page comes back. In this lab the page is plain HTTP; a real browser adds TLS, and often QUIC, before the request.

## Touch

**Next** plays the next step; **Start over** goes back to the first. No pick in this slug. Five steps: the ACK; the server's state; the GET request; the first byte of the answer; the note on TLS and QUIC.

## Limits

Plain HTTP only, one packet at a time, no loss. TLS and QUIC are not drawn; the system design course covers them. The two routers between home1 and the server are drawn as one link. The state table is a model view of ss output. The page text follows the lab page /cgi-bin/whoami.
