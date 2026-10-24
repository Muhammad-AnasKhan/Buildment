# Canvas spec: sysdesign-m18-pod-replaced

- **Course and chapter:** system-design, 18.4 beat 2 (Kill a pod, a new one starts).
- **Renderer:** `scene` (data only).
- **Claim:** You declare how many copies you want. A control loop keeps reality equal to the declaration.
- **Story:** Three pods run. Pod B crashes. The controller notices 2 of 3 are running, starts a new pod B, and it becomes ready.
- **Numbers:** Replaced after 0.3 to 0.7 s; 3 pods ready again after 6.1 to 6.7 s (course challenge 17 part 3, 2026-10-24, k3s in Docker standing in for kind).
- **Limits shown under the picture:** The new pod needs time to start and pass its readiness check. In the challenge run, a deleted pod was replaced in under a second and all 3 pods were ready again after about 6 seconds, with the 3-second warm-up of the sample service.
- **Sources:** Kubernetes Deployments documentation [S35]. Course challenge 17 part 3 measurement.
