# Canvas spec: sysdesign-m26-content-hash

- **Course and chapter:** system-design, 26.4 beat 4 (Same body, stored once).
- **Renderer:** `scene` (data only). Export: `sysdesignM26ContentHash`.
- **Claim:** An exact content hash finds identical pages under different URLs, so they are stored once.
- **Story:** The page at shop.example/a has fingerprint 9f3a, which is new, so it is saved. The page at mirror.example/a has the same fingerprint, so the crawler keeps only a link to the stored copy. Verdict: "Same body, stored once".
- **Numbers:** The fingerprint 9f3a is a made-up short value.
- **Sources:** None needed.
