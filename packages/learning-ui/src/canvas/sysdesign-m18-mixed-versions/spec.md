# Canvas spec: sysdesign-m18-mixed-versions

- **Course and chapter:** system-design, 18.6 beat 1 (Rolling: two versions at once).
- **Renderer:** `scene` (data only).
- **Claim:** Any strategy that runs two versions together needs changes that both versions can live with.
- **Story:** The v2 pod writes a note in the new format. The v1 pod reads the same note and cannot read it.
- **Numbers:** None.
- **Limits shown under the picture:** A made-up example. The usual fix is to change the database in small steps that both versions accept, then remove the old way later (expand, then contract).
- **Sources:** Fowler, Blue Green Deployment: deploy schema changes separately so both versions work [S109].
