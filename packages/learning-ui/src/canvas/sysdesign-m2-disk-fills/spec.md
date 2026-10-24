# Canvas spec: sysdesign-m2-disk-fills

- **Course and chapter:** system-design, 2.1 beat 1.
- **Renderer:** `scene` (data only).
- **Claim:** Without one line of arithmetic, a team launches on a disk that fills in under two weeks.
- **Story:** 2,000 students upload notes photos through one app server onto a 500 GB disk; the disk's second line climbs from 40 GB to 480 GB and then full. Verdict: "Disk full on day 13".
- **Numbers:** 2,000 x 10 photos x 2 MB = 40 GB a day; 500 / 40 = 12.5 days. Course story numbers, labelled as assumptions.
- **Sources:** None needed (story arithmetic). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
