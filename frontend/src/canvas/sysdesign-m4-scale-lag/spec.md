# Canvas spec: sysdesign-m4-scale-lag

- **Course and chapter:** system-design, 4.6 beat 2 ("New servers are not ready at once").
- **Renderer:** `scene` (data only).
- **Claim:** Autoscaling reacts after the fact: the gap is the time to notice plus the time to start and warm a server, and the fleet must survive that gap on headroom.
- **Story:** A strip shows seconds 0 to 120. The spike lands at 0 s and the servers turn red ("overloaded"). At 15 s the autoscaler's check sees CPU at 100% and starts 3 more servers. A ring counts the 90-second boot. At 105 s the new servers are ready and the fleet has 7. Verdict: "Help came 105 s after the spike".
- **Numbers:** Check every 15 s [S34]; 90 s boot (made up); 4 servers become 7, by ceil(4 x 100 / 60) = 7.
- **Sources:** HPA loop every 15 seconds and the scaling rule [S34]. {source needed: typical instance or container start-up and warm-up times} Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
