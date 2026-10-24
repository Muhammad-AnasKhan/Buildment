# Canvas spec: sysdesign-m4-session-lost

- **Course and chapter:** system-design, 4.3 beat 1 ("Logged in on one server only").
- **Renderer:** `scene` (data only).
- **Claim:** If a server keeps state in its own memory, the next request must come back to that server, or the state is missing.
- **Story:** Hana logs in; the balancer sends it to App 1, which saves her session in memory and returns a cookie. Her next request, "my notes", goes to App 2, which has no session for her ("who is this?") and returns the log-in page. Verdict: "Her session lives only on App 1".
- **Numbers:** None.
- **Sources:** Stateless app servers as a design rule (dossier, Domain model and Scaling out). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
