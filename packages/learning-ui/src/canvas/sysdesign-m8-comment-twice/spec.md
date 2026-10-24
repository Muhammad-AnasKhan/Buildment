# Canvas spec: sysdesign-m8-comment-twice

- **Course and chapter:** system-design, 8.1 beat 1 ("It looked lost, so she posted twice").
- **Renderer:** `scene` (data only).
- **Claim:** A replica answers from what it has. A user can post something and then load a page that does not show it.
- **Story:** Layla posts a comment. The app writes it to the leader and the leader confirms. The leader starts copying to the replica, slowly. Layla reloads; the app reads from the replica, which has no comments yet, and sends that back. She thinks her comment is lost and posts again. The leader now holds two comments. Verdict: "Looked lost, so she posted twice".
- **Numbers:** none (illustrative timing only)
- **Sources:** Terry et al. 1994 [S50] for read-your-writes; PostgreSQL docs [S38] for typical lag under one second.
