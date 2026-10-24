# Canvas spec: sysdesign-m3-chat-four-ways

- **Course and chapter:** system-design, 3.5 ("Real-time connections"), beat 5 ("Same chat, four ways, side by side"). New slug.
- **Renderer:** custom beat canvas on `BeatFrame`, with the new `primitives/rail-slider.tsx` (users rail) and `primitives/svg-chip.tsx` (poll interval chips). The traffic-playground primitive has one lane and one source, so four lanes are drawn here with `flowDots` from `models/server-load.ts` for the request stream.
- **Claim:** Polling spends requests and delay. Long polling, server-sent events and WebSockets spend open connections instead.
- **Model** (`models/realtime-cost.ts`): N users, each getting M = 2 messages a minute (illustrative); long polls held up to H = 30 s (illustrative); one-way delay 40 ms, half the 80 ms round trip (S3).
  - Polling every P seconds: average delay P / 2, requests N / P, about no open connections.
  - Long polling: delay 40 ms, requests about N x (M / 60 + 1 / H), N open connections.
  - SSE: delay 40 ms, about no requests (reconnects only), N open connections.
  - WebSocket: as SSE, and it also carries the app's own messages on the same connection.
  - Check: N = 10,000 and P = 5 s: polling 2,000 requests a second with a 2.5 s average delay; long polling about 667 requests a second with 10,000 connections open.
- **Inputs:** a users rail (log scale, 100 to 100,000, snapping to 1,000, 10,000 and 100,000; arrow keys walk 100, 200, 500, 1,000, ... 100,000); poll interval chips 1, 5, 30, 60 s (default 5); tap a lane to look at that way (default polling).
- **Picture:** four lanes, each a name card with its delay ("2.5 s late", "40 ms late"). Polling and long polling send request dots to the server at a rate that follows the requests a second (log scaled; one dot stands for many requests). Long polling, SSE and WebSocket draw an open pipe; SSE and WebSocket send event dots back from the server, and WebSocket also sends dots up. The Server card's pill shows the open connections of the lane in focus, with a second pill for its requests a second; both turn good, warn or bad (made-up limits: 1,000 requests a second or 10,000 connections is warn; 20,000 and 100,000 is bad).
- **Numbers visible at once:** four delays (one per lane), open connections and requests a second for the lane in focus.
- **Verdicts (38 characters or fewer):** "Polling {P} s: {r} req/s, {delay} late"; "Long poll: {N} open, {r} req/s"; "SSE: {N} open, almost no requests"; "WebSocket: same, plus two-way".
- **Motion and reduced motion:** dots flow while on screen and pause when off screen, on a hidden tab or while the rail is held; with reduced motion the dots stand still, scattered, and the pipes, pills and delays still show the model.
- **Accessibility:** the users rail is a `role="slider"`; each lane is a `role="button"` with `aria-pressed`; each chip is a `role="button"` with `aria-pressed`; the SVG description lists the delay, requests a second and open connections of all four ways.
- **Sources:** S104 RFC 6455 (WebSocket); S105 WHATWG HTML section 9.2 (server-sent events); S106 RFC 6202 (long polling); S3 napkin math.
