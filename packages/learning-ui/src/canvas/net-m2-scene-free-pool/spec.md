# Canvas spec: net-m2-scene-free-pool

- **Course and chapter:** networking, 2.1 (watch only). Full spec: `agent-ip/work/networking/canvas-specs/net-m2-addr-modes-and-scenes.md`, section "net-m2-scene-free-pool". Sources: dossier rows S13 to S16.
- **Renderer:** the existing `scene` renderer, data only (`SceneSpec`). No new component.
- **Claim:** "ran out" means the free pool emptied, not that addresses stopped working.
- **Story:** a website keeps answering a visitor while the free pool drains (a ring beside the pool fills). Four dates land on a year strip, each its own beat: 3 Feb 2011 (IANA), 15 Apr 2011 (APNIC final /8), 24 Sep 2015 (ARIN), 25 Nov 2019 (RIPE NCC). The registry names are on the pool's status line at each beat; the strip tags carry the dates. Then an old holder sells a block and the waitlist gets a /24.
- **Input:** none; **Replay**.
- **Verdict:** "Pool empty. The web still works."
- **Limits (in the fold):** one pool stands for every registry's pool; APNIC's date is the final /8 policy starting; made-up visitor, holder and website.
