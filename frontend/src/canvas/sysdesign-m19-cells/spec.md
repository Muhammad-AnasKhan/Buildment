# Canvas spec: sysdesign-m19-cells

- **Course and chapter:** system-design, 19.2 "Regions, availability zones and failure domains", beat 4 ("Cut the system into cells").
- **Renderer:** custom beat canvas on `BeatFrame`, `SnapStopsRail`, `VerdictBanner`, `useBeatClock`. The 10 by 10 grid is custom drawing (the `block-map` primitive is a tap-a-block explorer and does not fit a recoloured grid).
- **Claim:** The share of customers hit by one bad request or release is 1 / (number of cells), because each cell shares no state with the others.
- **Model:** `model.ts`, unit tested. 100 customers in a 10 by 10 grid; N in {1, 2, 4, 10}; customer c is in cell ((c - 1) mod N) + 1, so cells are interleaved and a router, not geography, decides. The poison customer is 37; tapping it breaks its cell. Affected = 100 / N (100, 50, 25, 10). Customer 37 is in cell 1 for N = 1, 2, 4 and cell 7 for N = 10.
- **Inputs:** a rail with four snap points 1, 2, 4, 10 (default 4; arrow keys, Home, End); tap the poison dot (a real button with a 44 unit target, Enter or Space) to send the request; changing the cells after the tap re-runs it; outside the picture: Reset.
- **Motion:** dots recolour by cell as N changes; a "cell router" bar appears at N of 2 or more (a dashed "no router, one cell" placeholder at N = 1); after the tap the unaffected dots go grey at once and the broken cell's dots turn red with a small cross one after another, with the counter growing; the poison dot has a soft pulsing halo until it is tapped. Reduced motion shows the finished state.
- **Verdicts:** "Tap the poison customer", then "100% / 50% / 25% / 10% of customers affected" (all within 38 characters, tested).
- **What to notice:** the counter always equals 100 / N; the broken cell's dots are spread through the grid, not in one corner.
- **Limits (in the fold):** equal cells, one poison customer and no shared state; a shared database or config store would put all 100 customers back in one blast radius.
- **Sources:** AWS Well-Architected, "Reducing the Scope of Impact with Cell-Based Architecture" (not yet in the dossier); [S93] bulkhead pattern.
