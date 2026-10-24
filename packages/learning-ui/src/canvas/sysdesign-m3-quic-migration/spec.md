# Canvas spec: sysdesign-m3-quic-migration

- **Course and chapter:** system-design, 3.4 beat 5.
- **Renderer:** `scene` (data only).
- **Claim:** QUIC identifies a connection by a connection ID, so it survives a change of network (connection migration); a TCP connection would have to be opened again.
- **Story:** The phone downloads over Wi-Fi with connection 7f3a. Wi-Fi goes out of range and the phone gets a new address on mobile data. It sends "conn 7f3a" through the mobile network; the server says "same conn" and data continues. Verdict: "New network, same QUIC connection".
- **Numbers:** None. The connection ID is made up.
- **Sources:** [S13] RFC 9000 (connection migration between networks using connection IDs). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
