# Canvas spec: sysdesign-m3-tls-handshake

- **Course and chapter:** system-design, 3.2 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** HTTPS over TCP with TLS 1.3 costs 2 round trips (1 for TCP, 1 for TLS) before the request leaves, so the first byte arrives after 3.
- **Story:** SYN and SYN-ACK (tag "TCP 80 ms"); ClientHello and ServerHello (tag "TLS 160 ms"); Finished with the GET, then the response (tag "first byte 240 ms"). Verdict: "HTTPS: 2 round trips before GET".
- **Numbers:** 80 ms per round trip, EU West to North America East [S3]. TLS 1.3 full handshake is 1-RTT [S11]. Derived in the dossier: about 2 round trips before the request leaves.
- **Sources:** [S3] napkin-math; [S10] RFC 9293; [S11] RFC 8446. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
