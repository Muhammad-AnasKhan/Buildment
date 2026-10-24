# Canvas spec: sysdesign-m5-signed-url

- **Course and chapter:** system-design, 5.7 beat 6 ("A signed URL is a ticket").
- **Renderer:** `scene` (data only).
- **Claim:** A signed URL carries an expiry time and a signature. The CDN edge checks both itself and serves a private file only while the link is valid, without asking the app on every download.
- **Story:** A buyer who paid for a manual asks the app; the app returns a link valid for 5 minutes. The edge checks it ("sig ok, in time") and serves `manual.pdf`. At 6 minutes the same link is refused ("expired: 403"); the app was "not asked". Verdict: "The edge checks it, no call home".
- **Numbers:** a 5-minute link, a story choice.
- **Sources:** source needed. The dossier has no source for signed URLs (for example the CloudFront signed URL documentation). The status code 403 for an expired link is also unsourced and should be checked against the chosen CDN's documentation.
