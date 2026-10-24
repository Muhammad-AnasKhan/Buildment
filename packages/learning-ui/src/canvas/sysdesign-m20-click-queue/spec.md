# Canvas spec: sysdesign-m20-click-queue

- **Course and chapter:** system-design, 20.4 beat 5 ("Count the click after the redirect").
- **Renderer:** `scene` (data only).
- **Claim:** Putting the click on a queue lets the redirect answer first, so a slow counter cannot slow a redirect.
- **Story:** The service answers the phone with 302 in 0.55 ms and drops a click event in the queue. A counter worker takes it later and adds 1. Verdict: "Count later, redirect now".
- **Numbers:** 0.55 ms is the hit time from sysdesign-m20-read-path (course number).
- **Sources:** S83 (SQS standard queues deliver at least once); module 15.
