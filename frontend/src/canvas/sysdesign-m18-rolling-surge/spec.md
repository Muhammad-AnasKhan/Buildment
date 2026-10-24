# Canvas spec: sysdesign-m18-rolling-surge

- **Course and chapter:** system-design, 18.4 beat 6 (A rolling update swaps a few at a time).
- **Renderer:** `scene` (data only).
- **Claim:** A rolling update replaces pods in small steps and keeps enough ready pods during the change.
- **Story:** New 1 starts, becomes ready, then Old 1 stops. New 2 and Old 2 follow, then New 3 and Old 3. At every moment 3 pods are ready.
- **Numbers:** Defaults 25% max unavailable and 25% max surge [S35].
- **Limits shown under the picture:** Matches the careful manifest in the challenge: maxSurge 1 and maxUnavailable 0. The Kubernetes defaults are 25% for both, which for 4 pods is 1 and 1. The picture shows one version change; a rollback is another rolling update.
- **Sources:** Kubernetes Deployments documentation [S35].
