# Canvas spec: sysdesign-m17-rollback-first

- **Course and chapter:** system-design, 17.6 beat 4 (Roll back first, find the cause later).
- **Renderer:** `scene` (data only), with a minute strip.
- **Claim:** The first job in an incident is to stop the harm, not to find the bug. If a change caused it, undoing the change is usually the fastest way.
- **Story:** v42 goes live at minute 20, errors reach 6%, Dina is paged at 27, rolls back at 33, errors are gone at 36. Verdict: "Rollback ended it in 3 minutes".
- **Numbers:** Course numbers only (20, 27, 33, 36; 6% errors). 36 - 33 = 3 minutes.
- **Sources:** Incident practice from the Google SRE book chapter on managing incidents (source needed in the dossier). The story is a course composite.
