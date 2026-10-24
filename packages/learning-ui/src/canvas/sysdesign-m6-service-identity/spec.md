# Canvas spec: sysdesign-m6-service-identity

- **Course and chapter:** system-design, 6.7 beat 6 ("Services prove who they are too").
- **Renderer:** `scene` (data only).
- **Claim:** A service should trust a caller because it proves its identity, not because it is inside the network.
- **Story:** Orders calls Payments with its certificate and is accepted; an unknown caller on the same network has no certificate and is refused. Verdict: "Unknown caller refused, even inside".
- **Numbers:** none.
- **Sources:** mutual TLS and zero trust are source-needed notes in the chapter.
