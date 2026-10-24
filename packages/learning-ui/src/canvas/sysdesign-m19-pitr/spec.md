# Canvas spec: sysdesign-m19-pitr

- **Course and chapter:** system-design, 19.3 beat 4 ("Rewind to the second before the delete").
- **Renderer:** `scene` (data only).
- **Claim:** Point-in-time recovery restores a full backup, then replays the log of changes up to a chosen moment, so you can stop just before the mistake.
- **Story:** A new database takes the 02:00 full copy, replays the logs, and stops at 14:06. Verdict: "Back to just before the delete".
- **Numbers:** Logs uploaded every five minutes (Amazon RDS uploads transaction logs to S3 every five minutes). 14:06 and 02:00 follow the 19.3 story.
- **Sources:** Amazon RDS documentation, restoring a DB instance to a specified time (new instance, logs every five minutes). Not yet in the dossier.
