# Canvas spec: sysdesign-m4-scale-up-ceiling

- **Course and chapter:** system-design, 4.2 beat 1 ("A bigger server, until there is none").
- **Renderer:** `scene` (data only).
- **Claim:** Scaling up (a bigger machine) is simple until it hits the largest size; after that, the only way to grow is more machines.
- **Story:** Students send 100 a second; a small server copes. Traffic grows to 400; the server is too small, asks the price list for a bigger size and becomes large (400 a second). Traffic grows to 1,000; the server asks again and gets xlarge (800 a second), still too small; the price list has no bigger size. Verdict: "Biggest size is still too small".
- **Numbers:** Sizes 100, 400 and 800 requests a second; demand 100, 400 and 1,000 a second. Made-up, labelled as such in the chapter.
- **Sources:** Story arithmetic. Vertical scaling's ceiling as a trade-off (dossier, Scaling out, no single primary source). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
