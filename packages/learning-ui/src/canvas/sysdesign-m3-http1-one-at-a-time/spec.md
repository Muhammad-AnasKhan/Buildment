# Canvas spec: sysdesign-m3-http1-one-at-a-time

- **Course and chapter:** system-design, 3.4 beat 1.
- **Renderer:** `scene` (data only).
- **Claim:** On one HTTP/1.1 connection, requests take turns: the next one waits for the previous answer, so N files cost N round trips. Browsers open several connections to get parallelism.
- **Story:** The browser needs a.css, b.js and c.png. It sends each GET only after the previous file arrives; tags at 80, 160 and 240 ms. Verdict: "One at a time on this connection".
- **Numbers:** 80 ms per round trip [S3].
- **Sources:** [S3] napkin-math; [S12] RFC 9114 section 1 (HTTP/1.1 clients open multiple TCP connections for parallelism). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
