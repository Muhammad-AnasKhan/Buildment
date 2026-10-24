# Canvas spec: sysdesign-m6-jwt-verify

- **Course and chapter:** system-design, 6.7 beat 3 ("JWT: a signed note, checked alone").
- **Renderer:** `scene` (data only).
- **Claim:** A signed token can be verified by any service with the issuer's public key, with no lookup, until it expires.
- **Story:** The login server gives Huda's app a JWT (huda, 15 min); the app sends it to Orders; Orders checks "signature OK" and "exp OK: huda"; the login server is "not asked"; Orders replies 200. Verdict: "Checked alone: no lookup needed".
- **Numbers:** the 15-minute lifetime is a made-up Kitabi setting.
- **Sources:** JWT structure and checks are source-needed notes in the chapter (RFC 7519, RFC 8725).
