# Canvas spec: sysdesign-m3-quic-handshake

- **Course and chapter:** system-design, 3.2 beat 3.
- **Renderer:** `scene` (data only).
- **Claim:** QUIC combines the transport and cryptographic handshakes, so a new secure connection costs 1 round trip instead of 2.
- **Story:** The client sends its Initial packet with the TLS hello; the server answers with its hello and handshake done (tag "QUIC ready 80 ms"); the client sends its last handshake message with the GET; the response arrives (tag "first byte 160 ms"); a grey tag shows TCP plus TLS 1.3 at 240 ms for comparison. Verdict: "QUIC: 1 round trip, then GET".
- **Numbers:** 80 ms per round trip [S3]. QUIC over UDP with a combined cryptographic and transport handshake [S13]; TLS 1.3 handshake 1-RTT [S11]. The 1 round trip setup is derived from these two sources.
- **Sources:** [S3] napkin-math; [S11] RFC 8446; [S13] RFC 9000. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
