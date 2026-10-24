# Canvas spec: sysdesign-m19-backup-leaves

- **Course and chapter:** system-design, 19.6 beat 4 ("Backups and copies are data too").
- **Renderer:** `scene` (data only).
- **Claim:** Data residency covers every copy: backups, replicas, logs and caches. A disaster recovery plan that copies to a region outside the allowed area breaks the rule, so the recovery site must be inside the area too.
- **Story:** A nightly backup from the EU database goes to NA storage (bad, verdict "Backup crossed the border"), then the plan is fixed and the backup goes to a second EU site (good, verdict "Backup stays inside the EU").
- **Numbers:** None. The rule is a course example.
- **Sources:** GDPR Chapter V, Articles 44 to 46, on transfers outside the EU (not yet in the dossier). Not legal advice.
