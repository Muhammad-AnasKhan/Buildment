# Canvas spec: sysdesign-m4-health-check

- **Course and chapter:** system-design, 4.4 beat 3 ("Health checks take a sick server out").
- **Renderer:** `scene` (data only).
- **Claim:** A health check finds a dead server only after interval x failures; until then the balancer keeps sending it requests, which fail.
- **Story:** The balancer sends requests to all three servers. App 2 crashes. A ring by the balancer counts the seconds while checks 1, 2 and 3 fail and one more request to App 2 fails. After the third failure App 2 is out and App 1 and App 3 go from about 33% to 50% busy. Verdict: "3 failed checks: App 2 taken out".
- **Numbers:** Check every 10 s; out after 3 failures; up to about 30 s of failing requests (example settings). Load 33% per server becomes 50% on two.
- **Sources:** Health checks and the danger of removing capacity [S19]; readiness probes decide when a container gets traffic [S20]. {source needed: real default interval and threshold for a named load balancer} Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
