# Canvas spec: sysdesign-m20-redirect-302

- **Course and chapter:** system-design, 20.4 beat 4 ("302 sends every click through").
- **Renderer:** `scene` (data only).
- **Claim:** A 302 answer is not kept by default, so every tap reaches the service, which can count it, change it or stop it.
- **Story:** Same story as the 301 scene, but the second tap goes back to Wasla, which counts 2. Verdict: "302: every click reaches Wasla".
- **Numbers:** Peak 100,000 redirects a second (chapter estimate: 500M links a month, 100 reads each, 5 times peak).
- **Sources:** (source needed: RFC 9110 is not in the dossier) RFC 9110 section 15.4.3 (302); freshness rules in RFC 9111 [S22].
