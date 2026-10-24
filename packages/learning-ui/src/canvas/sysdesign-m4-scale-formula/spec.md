# Canvas spec: sysdesign-m4-scale-formula

- **Course and chapter:** system-design, 4.6 beat 1 ("Scale on a signal, toward a target").
- **Renderer:** `scene` (data only).
- **Claim:** Autoscaling is a control loop: measure a signal, compute desired = ceil(current x signal / target), and add or remove servers to match.
- **Story:** The servers report CPU 90%. The autoscaler applies the rule with target 60%: 4 x 90 / 60 = 6. It asks for 6 and adds 2; they boot; the fleet settles at 6 servers at 60% CPU. Verdict: "ceil(4 x 90 / 60) = 6 servers".
- **Numbers:** 4 servers, 90% CPU, 60% target, 6 servers.
- **Sources:** desiredReplicas = ceil(currentReplicas x currentMetricValue / desiredMetricValue) [S34]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
