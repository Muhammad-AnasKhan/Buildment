# Canvas spec: sysdesign-m19-cell-rollout

- **Course and chapter:** system-design, 19.2 beat 5 ("Release one cell at a time").
- **Renderer:** `scene` (data only).
- **Claim:** Cells make a deploy safer: send a release to one cell, watch it, and stop if it fails. Only that cell's customers see the bug.
- **Story:** The deploy tool sends release 42 to Cell 1 only. Cell 1 shows errors, the tool halts, Cells 2 and 3 stay on release 41. Verdict: "Bad release hit 1 of 3 cells".
- **Numbers:** 1 of 3 cells is a course example (about 33% of customers). With 10 cells one bad cell is 10% (AWS cell-based architecture whitepaper: 10 cells and 100 requests, 90% unaffected).
- **Sources:** AWS Well-Architected, "Reducing the Scope of Impact with Cell-Based Architecture". Not yet in the dossier.
