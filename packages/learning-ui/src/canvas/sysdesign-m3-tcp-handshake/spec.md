# Canvas spec: sysdesign-m3-tcp-handshake

- **Course and chapter:** system-design, 3.2 beat 1.
- **Renderer:** `scene` (data only).
- **Claim:** A TCP connection costs one round trip (SYN, SYN-ACK) before the client can send its request.
- **Story:** The client sends SYN; the server answers SYN-ACK (tag "connected 80 ms"); the client sends ACK with `GET /` right behind it; the response arrives (tag "first byte 160 ms"). Verdict: "1 round trip before the request".
- **Numbers:** EU West to North America East round trip about 80 ms [S3]. Three-way handshake [S10].
- **Sources:** [S3] napkin-math; [S10] RFC 9293. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
