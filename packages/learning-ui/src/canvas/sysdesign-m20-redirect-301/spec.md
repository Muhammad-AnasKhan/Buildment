# Canvas spec: sysdesign-m20-redirect-301

- **Course and chapter:** system-design, 20.4 beat 3 ("301 means keep this answer").
- **Renderer:** `scene` (data only).
- **Claim:** A 301 answer can be kept by the browser, so later taps skip the service: it cannot count or stop them.
- **Story:** The phone taps, Wasla counts 1 and answers 301. The phone follows it, keeps it, and on the second tap goes straight to the news site. Wasla never sees click 2. Verdict: "301: Wasla misses click 2".
- **Numbers:** None.
- **Sources:** (source needed: RFC 9110 is not in the dossier) RFC 9110 sections 15.4.2 (301) and 15.1 (cacheable by default); freshness rules in RFC 9111 [S22].
