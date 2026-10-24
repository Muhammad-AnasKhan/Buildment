# Canvas spec: sysdesign-m7-fix-cas

- **Course and chapter:** system-design, 7.5 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** Compare-and-set writes only if the value or version is still what you read. If someone else changed it, the write is refused and you decide what to do.
- **Story:** Both read 1 at v7. Dina's write succeeds: left 0, v8. Omar's write finds v8, changes 0 rows and is refused. Omar reads again and sees 0.
- **Numbers:** Version 7 to 8. 1 row changed for Dina, 0 for Omar.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** DynamoDB conditional writes: a write that checks the item's current value stops Bob overwriting Alice, and is idempotent when it checks the attribute it changes [S42]. etcd transactions compare on revisions [S53].
