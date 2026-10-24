# Canvas spec: sysdesign-m18-oom-kill

- **Course and chapter:** system-design, 18.2 beat 3 (A memory limit kills).
- **Renderer:** `scene` (data only).
- **Claim:** A memory limit is a hard wall: the process is not slowed down, it is killed.
- **Story:** Five 20 MB requests arrive. The memory tags climb 20, 40, 60, 80. The fifth request pushes the container past the 100 MB line, the kernel kills the process, and the container exits with code 137.
- **Numbers:** Limit 100 MB. Exit code 137 is 128 plus 9 (SIGKILL). In the challenge run the service held 80 MB and then the container exited with exit=137 and OOMKilled=true.
- **Limits shown under the picture:** Measured on Docker Desktop with --memory=100m and --memory-swap=100m. Without a swap limit a container may use disk swap first. Kubernetes memory limits work the same way, and the pod shows OOMKilled.
- **Sources:** cgroups(7) [S117]. Course challenge 17 part 1 measurement, 2026-10-24.
