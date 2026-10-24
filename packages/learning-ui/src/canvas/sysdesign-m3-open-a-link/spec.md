# Canvas spec: sysdesign-m3-open-a-link

- **Course and chapter:** system-design, 3.1 beat 1 ("One tap, three round trips").
- **Renderer:** `scene` (data only).
- **Claim:** Before a phone receives one byte of a page over HTTPS, it pays one round trip for TCP, one for TLS 1.3 and one for the request itself; distance multiplies all three.
- **Story:** Lina's phone asks the resolver for the shop's address (cached, not timed), then sends SYN and gets SYN-ACK (tag "TCP 160 ms"), sends the TLS hello and gets the keys (tag "TLS 320 ms"), sends `GET /` and gets the first byte (tag "first byte 480 ms"). Verdict: "3 round trips before one byte".
- **Numbers:** EU West to Singapore round trip about 160 ms [S3]. TCP opens with a three-way handshake [S10]; TLS 1.3's full handshake is 1 round trip [S11]; derived: TCP plus TLS 1.3 costs about 2 round trips before the request leaves (dossier, Networking).
- **Sources:** [S3] napkin-math; [S10] RFC 9293; [S11] RFC 8446. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`. Lina and the shop are a course example.
