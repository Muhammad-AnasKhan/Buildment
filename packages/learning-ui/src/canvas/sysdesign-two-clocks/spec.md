# Canvas spec: sysdesign-two-clocks

- **Course and chapter:** system-design, 10.6 beat 1 ("Two writes, 1 ms apart").
- **Renderer:** custom beat canvas on `BeatFrame` and `useBeatClock`.
- **Claim:** Two timestamps 1 ms apart look like a clear order, which the next beats will question.
- **Motion:** two write dots drop into servers A and B while their clocks tick (5 ms of clock time per second); at 1.2 s both stamp, A at .000 and B at .001. Loops every 5 s; reduced motion shows the stamped frame.
- **Input:** none besides Replay. Pressing the picture freezes it.
- **Rule:** `twoClocksFrame(seconds)` in `model.ts`, unit tested.
- **Teaching contract:** the chapter's predict comes before beat 4; this beat sets up the question "So A came first. Or did it?".
