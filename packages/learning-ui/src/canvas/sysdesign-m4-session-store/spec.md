# Canvas spec: sysdesign-m4-session-store

- **Course and chapter:** system-design, 4.3 beat 4 ("Move the session to a shared store").
- **Renderer:** `scene` (data only).
- **Claim:** When session state lives in a shared store, the app servers hold nothing unique, so any server can serve any request and any server can be removed.
- **Story:** Hana logs in through App 1, which saves her session to the store and returns a session id. Her next request goes to App 2, which asks the store for the session, gets "Hana" and serves her notes. Verdict: "Any server can serve her now".
- **Numbers:** None in the picture. The fold cites about 500 microseconds for a Redis-style query [S3].
- **Sources:** Stateless app servers (dossier, Domain model); Valkey BSD-3 licence [S125] and image size [S119]; query cost [S3]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
