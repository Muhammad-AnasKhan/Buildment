# Canvas spec: sysdesign-m12-swim-indirect

- **Course and chapter:** system-design, 12.8 beat 3 (Ask a friend to check).
- **Renderer:** `scene` (data only).
- **Claim:** Before blaming a node, ask other nodes to try it. One bad link between two nodes no longer causes a false alarm.
- **Story:** A's ping to B gets no ack. A sends ping-req to C and D. C pings B, B acks C, C tells A. Verdict: "B was slow, not dead".
- **Numbers:** k = 2 helpers in the picture.
- **Sources:** S72.
