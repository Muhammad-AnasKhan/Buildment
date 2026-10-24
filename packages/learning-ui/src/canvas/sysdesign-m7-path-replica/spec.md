# Canvas spec: sysdesign-m7-path-replica

- **Course and chapter:** system-design, 7.6 beat 4.
- **Renderer:** `scene` (data only).
- **Claim:** Read replicas multiply read capacity, but every replica is a little behind, so some reads must go to the primary.
- **Story:** The app writes to the primary. The copy is still on its way when a read reaches the replica, and the replica returns the old value.
- **Numbers:** One primary, one replica. Lag is a short delay (not drawn to scale).
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** PostgreSQL docs: streaming replication is asynchronous by default, lag typically under 1 s [S38]; Aurora replica lag usually much less than 100 ms [S39].
