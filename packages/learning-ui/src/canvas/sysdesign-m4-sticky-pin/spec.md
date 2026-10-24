# Canvas spec: sysdesign-m4-sticky-pin

- **Course and chapter:** system-design, 4.3 beat 2 ("Sticky sessions: same user, same server").
- **Renderer:** `scene` (data only).
- **Claim:** Sticky sessions keep a user on the server that holds their state, but the state still lives on one server, so losing that server loses it.
- **Story:** Hana's requests carry "app=1"; the balancer sends both to App 1, which serves her. App 1 crashes. Her next request still says app=1; the balancer notes App 1 is gone and sends it to App 2, which has no session and returns the log-in page. Verdict: "Sticky works until her server dies".
- **Numbers:** None.
- **Sources:** Load balancer behaviour per connection and per request [S15]; stateless servers (dossier). {source needed: how a load balancer implements cookie-based stickiness} Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
