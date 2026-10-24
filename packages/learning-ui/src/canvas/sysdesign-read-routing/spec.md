# Canvas spec: sysdesign-read-routing

- **Course and chapter:** system-design, 8.4 beat 3 ("Three fixes, three costs").
- **Renderer:** custom wrapper around the `scene` renderer; the scene is `buildLagScene(routing)` from the tested replica lag model.
- **Claim:** Reading from the leader fixes read-your-writes and monotonic reads by loading the leader; routing to a replica at the client's position fixes both (with one writer) and keeps reads on replicas.
- **Input:** one choice of three: Any replica (default), Leader for own reads, Replica at my position. Changing it replays the story.
- **Verdicts:** "Her comment vanished, then came back" (any); "Always there; leader served 3 of 3" (leader); "Always there; reads stay on replicas" (position).
- **Sources:** Terry et al. 1994; PostgreSQL documentation (WAL positions). See the research dossier.
