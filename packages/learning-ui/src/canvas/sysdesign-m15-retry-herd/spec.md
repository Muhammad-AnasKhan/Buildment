# Canvas spec: sysdesign-m15-retry-herd

- **Course and chapter:** system-design, 15.5 beat 4 ("Same schedule, same moment").
- **Renderer:** `scene` (data only).
- **Claim:** Retries with the same schedule arrive together and can knock a recovering service down again.
- **Story:** Three workers fail together and wait 2 seconds. All three retry at once. The database shows 3 at once and is overloaded again. Verdict: "Same schedule: all retry together".
- **Numbers:** Course numbers: 3 workers, 2 s wait.
- **Sources:** S90 (Brooker, 2015: without jitter, clients retry in clumps) and S91 (Google SRE: retries can overload a recovering service).
