# Canvas spec: sysdesign-m13-write-path

- **Course and chapter:** system-design, 13.2 beat 3 ("A write waits for W copies, not all").
- **Renderer:** `scene` (data only).
- **Claim:** A write is done when W of the N copies confirm, so its speed is set by the W-th fastest copy, not the slowest.
- **Story:** The client sends x = 7 to node A. A saves it, copies it to B and C, and waits. B confirms first, which is the second confirmation. A tells the client OK. C confirms later. Verdict: "Told OK after 2 of 3 copies".
- **Numbers:** N = 3, W = 2 [S45]. Copy times are made up for the picture.
- **Sources:** S45 (Dynamo, common setting (3, 2, 2); latency is set by the slowest of the W or R nodes you wait for).
