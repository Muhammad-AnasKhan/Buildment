# Canvas spec: sysdesign-m3-h3-streams

- **Course and chapter:** system-design, 3.4 beat 4.
- **Renderer:** `scene` (data only).
- **Claim:** HTTP/3 runs on QUIC, which has stream-level reliability, so a lost packet delays only the stream it carried.
- **Story:** Same as `sysdesign-m3-h2-stall`, but b and c are "shown" as soon as they arrive (tag "b, c usable 80 ms") and only a waits for its resend (tag "a usable 160 ms"). Verdict: "Only a waits for its resend".
- **Numbers:** 80 ms per round trip [S3]; the resend timing is illustrative, as in the HTTP/2 scene.
- **Sources:** [S3] napkin-math; [S12] RFC 9114 section 1 (per-stream flow control and stream-level reliability); [S13] RFC 9000. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
