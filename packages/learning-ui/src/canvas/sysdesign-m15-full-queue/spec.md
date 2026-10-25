# Canvas spec: sysdesign-m15-full-queue

- **Course and chapter:** system-design, 15.2 beat 5 ("A full queue tells the sender to wait").
- **Renderer:** `scene` (data only).
- **Claim:** A queue with a limit makes the sender slow down instead of letting memory fill.
- **Story:** The queue is at 5 of 5. The API offers job 6 and gets "full: wait". It waits. The worker finishes one job, the count drops to 4 of 5, and job 6 goes in. Verdict: "The sender waits; nothing is lost".
- **Numbers:** Course numbers: limit 5.
- **Sources:** S88 (Node.js streams: write() returns false when the buffer is past highWaterMark, and the source pauses).
