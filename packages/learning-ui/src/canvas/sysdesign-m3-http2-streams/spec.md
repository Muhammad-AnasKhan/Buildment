# Canvas spec: sysdesign-m3-http2-streams

- **Course and chapter:** system-design, 3.4 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** HTTP/2 multiplexes many requests as streams on one TCP connection, so three small files take one round trip instead of three.
- **Story:** A grey tag shows HTTP/1.1 at 240 ms. GET a, b and c leave together; a, b and c return together (tag "all 3: 80 ms"). Verdict: "3 streams, 1 connection, 80 ms".
- **Numbers:** 80 ms per round trip [S3].
- **Sources:** [S3] napkin-math; [S12] RFC 9114 section 1 (HTTP/2 multiplexes streams on one TCP connection). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
