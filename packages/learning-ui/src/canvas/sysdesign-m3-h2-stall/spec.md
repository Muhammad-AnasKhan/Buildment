# Canvas spec: sysdesign-m3-h2-stall

- **Course and chapter:** system-design, 3.4 beat 3 (the key surprise; the chapter's predict comes right before it).
- **Renderer:** `scene` (data only).
- **Claim:** In HTTP/2, all streams share one TCP connection, so one lost packet stalls every stream until it is resent (head-of-line blocking).
- **Story:** GET a, b, c pass the network. The server sends a, b, c; the network drops a; b and c reach the browser but are "held" (tag "b, c here 80 ms"). The server resends a; then all three are usable (tag "usable 160 ms"). Verdict: "a is lost, so b and c wait too".
- **Numbers:** 80 ms per round trip [S3]. The resend arriving one round trip later is an illustrative simplification, stated in the limits.
- **Sources:** [S3] napkin-math; [S12] RFC 9114 section 1 ("a lost or reordered packet causes all active transactions to experience a stall"). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
