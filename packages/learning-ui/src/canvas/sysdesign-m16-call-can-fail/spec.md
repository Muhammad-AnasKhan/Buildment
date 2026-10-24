# Canvas spec: sysdesign-m16-call-can-fail

- **Course and chapter:** system-design, 16.2 beat 2 (A call that can fail).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** Splitting a program into services turns function calls into network calls, and a network call has a new way to fail: no answer.
- **Story:** Checkout calls Payments. The first call comes back at once. The second call gets nothing, so Checkout waits 300 ms and gives up. A function call inside one program has no such outcome.
- **Numbers:** A round trip inside one region costs about 250 microseconds (napkin-math, chapter 2.2). A function call in memory costs nanoseconds. The 300 ms limit is a course number.
- **Sources:** Round trip within a region [S3]. The story is a course example.
