# Canvas spec: sysdesign-m18-hpa-scale

- **Course and chapter:** system-design, 18.4 beat 7 (Autoscaling by CPU).
- **Renderer:** `scene` (data only).
- **Claim:** The same rule as chapter 4.6 runs inside Kubernetes: desired = ceil(current x measured / target).
- **Story:** The metrics store reports 90% CPU. The autoscaler computes 4.5, rounds up to 5, tells the Deployment to run 5 pods, and CPU falls to 54%.
- **Numbers:** 3 x 90 / 60 = 4.5, ceil 5 pods; 270 / 5 = 54%.
- **Limits shown under the picture:** CPU is measured against each pod's request, not the machine's size. The autoscaler checks about every 15 seconds, ignores changes inside a 10% tolerance, and waits up to 5 minutes before scaling down. New pods still need time to start.
- **Sources:** Kubernetes HPA documentation [S34]: 15 s loop, utilisation as a percentage of the request, tolerance 0.1, scale-down stabilisation 300 s [verified 2026-10-24, add details to dossier].
