# Canvas spec: sysdesign-m2-storage-piles-up

- **Course and chapter:** system-design, 2.3 beat 5.
- **Renderer:** `scene` (data only).
- **Claim:** Storage accumulates year after year while request rate stays flat, so storage drives Sada's design.
- **Story:** Each year adds 22 TB to storage (22, 44, 66, 88, 110 TB) while users still send 700 req/s at peak. Verdict: "Storage piles up; traffic does not".
- **Numbers:** 100,000 notes x 200 KB = 20 GB a day; x 365 = 7.3 TB; x 3 copies = about 22 TB a year.
- **Sources:** Arithmetic only; Dynamo's common N = 3 [S45] motivates three copies. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
