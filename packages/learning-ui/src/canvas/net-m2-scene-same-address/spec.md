# Canvas spec: net-m2-scene-same-address

- **Course and chapter:** networking, 2.4 (watch only). Full spec: `agent-ip/work/networking/canvas-specs/net-m2-addr-modes-and-scenes.md`, section "net-m2-scene-same-address".
- **Renderer:** the existing `scene` renderer, data only (`SceneSpec`). No new component.
- **Claim:** millions of separate homes reuse the same private address, and none can see the others.
- **Story:** three homes, each with a laptop at `192.168.1.23` behind its own router (public side `203.0.113.5`, `.9`, `.14`, the documentation block as a stand-in). Each sends out under its router's address. Laptop 1 then sends to `192.168.1.23` beyond its home and the Internet drops it; the other laptops see nothing.
- **Input:** none; **Replay**.
- **Verdict:** "Same address, different homes."
- **Limits (in the fold):** made-up homes; address rewriting (NAT) is module 6; in this picture the Internet drops the packet, a real router near the home may do it first.
