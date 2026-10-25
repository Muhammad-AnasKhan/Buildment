# Canvas spec: sysdesign-m2-ssd-read

- **Course and chapter:** system-design, 2.2 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** A random SSD read is about a human day when 1 ns becomes 1 s.
- **Story:** Your code makes a system call (5 human minutes) and the kernel reads 8 KiB from the SSD while a ring counts to 28 hours. Verdict: "One SSD read: about a day".
- **Numbers:** System call 300 ns; random 8 KiB SSD read 100 microseconds (100,000 s = 27.8 h).
- **Sources:** [S3] napkin-math (re-measured March 2026, 2 to 3 times caveat). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
