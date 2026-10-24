# Canvas spec: sysdesign-m13-orset

- **Course and chapter:** system-design, 13.7 beat 4 ("An add the remover never saw survives").
- **Renderer:** `scene` (data only).
- **Claim:** Each add gets a unique tag and a remove marks only the tags it observed, so a concurrent add survives the remove.
- **Story:** Both hold milk with tag A:1. A removes it (tag A:1 removed). B adds milk again (new tag B:1). They swap. Both have tag B:1 alive and tag A:1 removed, so milk is in the set. Verdict: "The add survives: milk stays".
- **Numbers:** Tags A:1 and B:1.
- **Sources:** S74 (OR-Set specification), S75.
