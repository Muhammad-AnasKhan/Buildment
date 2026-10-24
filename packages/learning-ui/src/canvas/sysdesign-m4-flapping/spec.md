# Canvas spec: sysdesign-m4-flapping

- **Course and chapter:** system-design, 4.6 beat 4 ("Scale in slowly, or flap").
- **Renderer:** `scene` (data only).
- **Claim:** Scale out fast and scale in slowly: removing capacity on a short dip makes the fleet flap and leaves it short when load returns.
- **Story:** The servers report 40%; the autoscaler (no window) computes 6 x 40 / 60 = 4 and stops 2. Load comes back: 4 servers at 90%; it computes 6 and starts 2, which boot for 90 s. The servers' card says "slow for 90 s". Verdict: "No window: removed, then missed".
- **Numbers:** 6 servers at 40% gives ceil(6 x 40 / 60) = 4; 4 at 90% gives ceil(4 x 90 / 60) = 6; boot 90 s (made up).
- **Sources:** HPA rule and the scale-down stabilisation window [S34]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
