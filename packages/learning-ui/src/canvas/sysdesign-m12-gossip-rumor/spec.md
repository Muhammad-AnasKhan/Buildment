# Canvas spec: sysdesign-m12-gossip-rumor

- **Course and chapter:** system-design, 12.8 beat 1 (A rumor doubles each round).
- **Renderer:** `scene` (data only).
- **Claim:** In gossip each informed node tells a few others every round, so the number of informed nodes grows fast and everyone hears after about log N rounds.
- **Story:** N1 knows. Round 1: N1 tells N4. Round 2: N1 tells N2 and N4 tells N6. Round 3: N1, N2 and N6 tell N3, N5 and N7. All seven know.
- **Numbers:** 7 nodes, fanout 1, best case 3 rounds. Random picks: about 5.0 rounds on average (course simulation, 300 runs).
- **Sources:** S72 (infection style spread); the rounds figure is from the course simulation in 12.8.
