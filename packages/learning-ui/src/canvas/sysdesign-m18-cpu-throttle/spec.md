# Canvas spec: sysdesign-m18-cpu-throttle

- **Course and chapter:** system-design, 18.2 beat 4 (A CPU limit slows).
- **Renderer:** `scene` (data only).
- **Claim:** CPU is a share of time: past the limit, the process waits. Memory is space: past the limit, the process dies.
- **Story:** A client sends 200 ms of work to two containers. The one with a whole CPU answers at 200 ms. The one with half a CPU is throttled and answers at 400 ms. Neither is killed.
- **Numbers:** 200 ms of CPU work; about 213 ms free and 406 ms at --cpus=0.5 (course challenge 17 part 1, 2026-10-24).
- **Limits shown under the picture:** Measured on Docker Desktop with --cpus=0.5: 213 ms with no limit and 406 ms with the limit. The kernel lets the container run for a share of each short time slice, then pauses it until the next slice. The request itself was one thread of pure CPU work.
- **Sources:** cgroups(7) [S117]. Course challenge 17 part 1 measurement, 2026-10-24.
