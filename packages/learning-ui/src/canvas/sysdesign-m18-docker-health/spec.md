# Canvas spec: sysdesign-m18-docker-health

- **Course and chapter:** system-design, 18.3 beat 5 (A health check reports, it does not restart).
- **Renderer:** `scene` (data only).
- **Claim:** A Dockerfile HEALTHCHECK is a status, not a repair. Something else must act on it.
- **Story:** Docker checks and gets 200. Then the service gets stuck. Three checks fail at 10, 20 and 30 seconds. Docker says unhealthy and nothing restarts the container.
- **Numbers:** Interval 10 s, 3 retries; unhealthy at about +31 s, restarts 0 (course challenge 17 part 1, 2026-10-24). Defaults: interval 30 s, timeout 30 s, retries 3.
- **Limits shown under the picture:** Measured with HEALTHCHECK --interval=10s --retries=3. The status changed about 30 seconds after the service got stuck, and the restart count stayed at 0. Docker Swarm and Kubernetes act on health, plain docker run does not.
- **Sources:** Dockerfile reference, HEALTHCHECK defaults [verified 2026-10-24, add to dossier]. Course challenge 17 measurement.
