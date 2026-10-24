# Canvas spec: sysdesign-m3-keep-alive

- **Course and chapter:** system-design, 3.2 beat 5.
- **Renderer:** `scene` (data only).
- **Claim:** The handshakes are paid per connection, so a request on a connection that is already open and secure costs only its own round trip.
- **Story:** A grey tag shows a new TCP plus TLS 1.3 connection at 240 ms. The client sends `GET /cart` on its open connection and the answer comes back (tag "reused 80 ms"); the 240 ms tag turns red. Verdict: "Reused connection: 1 round trip".
- **Numbers:** 80 ms per round trip [S3]; 240 ms for a new connection derived from [S10] and [S11] as in 3.2 beat 2.
- **Sources:** [S3] napkin-math; [S10] RFC 9293; [S11] RFC 8446. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
