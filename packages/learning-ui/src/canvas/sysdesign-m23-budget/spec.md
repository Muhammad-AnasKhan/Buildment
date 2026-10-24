# Canvas spec: sysdesign-m23-budget

- **Course and chapter:** system-design, 23.3 beat 1 ("A suggestion must beat the next key").
- **Renderer:** `scene` (data only), with a millisecond strip.
- **Claim:** The network trip uses most of a 100 ms suggestion budget when the suggestion server is far from the shopper, so the server must be near and the lookup must be in memory.
- **Story:** A budget line at 100 ms. The phone sends "sho" to the east region, three ideas come back. Tags show "trip 60 ms" and "40 ms left". Verdict: "The road took 60 of 100 ms".
- **Numbers:** North America East to West round trip 60 ms (napkin-math, S3, 2 to 3 times caveat). Budget 100 ms is the course target. 100 minus 60 = 40.
- **Sources:** S3.
