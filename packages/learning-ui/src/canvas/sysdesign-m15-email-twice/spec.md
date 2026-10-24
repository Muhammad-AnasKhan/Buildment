# Canvas spec: sysdesign-m15-email-twice

- **Course and chapter:** system-design, 15.1 beat 2 ("The retry sends it twice").
- **Renderer:** `scene` (data only).
- **Claim:** A caller cannot tell a slow answer from a lost one, so a retry can do the work twice.
- **Story:** The API calls the email service and waits. After 2 seconds there is no answer, so it sends the request again. The first request was only slow. Both are delivered. Layla gets two welcome emails. Verdict: "One signup, two welcome emails".
- **Numbers:** Course numbers: 2 s timeout.
- **Sources:** None needed (set-the-scene story).
