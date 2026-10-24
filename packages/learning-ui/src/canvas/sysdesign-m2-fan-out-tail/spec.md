# Canvas spec: sysdesign-m2-fan-out-tail

- **Course and chapter:** system-design, 2.4 beat 3.
- **Renderer:** `scene` (data only).
- **Claim:** A request that fans out is as slow as its slowest call.
- **Story:** A page calls three backends; two answer at once, Ads is slow (1 s), and the page's ring counts to 1,000 ms before it can answer. Verdict: "The slowest call sets the page's p99".
- **Numbers:** Slow call 1 s as in the Tail at Scale example; fast times made up.
- **Sources:** [S8] Dean and Barroso, The Tail at Scale, CACM 2013. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
