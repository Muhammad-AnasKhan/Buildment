# Canvas spec: sysdesign-m17-use-queue

- **Course and chapter:** system-design, 17.5 beat 2 (Busy 60%, yet tasks wait).
- **Renderer:** `scene` (data only).
- **Claim:** Utilization and saturation are different. A resource can have a modest average utilization and still have work waiting; the USE method asks for both, plus errors.
- **Story:** The server shows 60% busy. Two bursts arrive; the run queue grows to 5, then 12. Verdict: "60% busy, yet 12 tasks wait".
- **Numbers:** Course numbers only.
- **Sources:** USE method: for every resource check utilization, saturation and errors; saturation example is run-queue length (Gregg, source needed in the dossier). Four golden signals, saturation as "how full" [S97].
