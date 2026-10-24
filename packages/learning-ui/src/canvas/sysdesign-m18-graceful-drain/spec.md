# Canvas spec: sysdesign-m18-graceful-drain

- **Course and chapter:** system-design, 18.2 beat 6 (Drain, then exit).
- **Renderer:** `scene` (data only).
- **Claim:** A SIGTERM handler turns a kill into a clean stop: no request in flight is cut off.
- **Story:** A request is in progress. SIGTERM arrives. The service says draining, finishes the request and answers, then exits with code 0.
- **Numbers:** With a 2 s request in flight, docker stop took 2.5 s and the container exited with 0 (course challenge 17 part 1, 2026-10-24).
- **Limits shown under the picture:** In the challenge the service closes its listener and waits for open requests, with a limit of 8 seconds before it gives up. A real service may also need to close database connections and flush logs.
- **Sources:** Course challenge 17 part 1 measurement, 2026-10-24.
