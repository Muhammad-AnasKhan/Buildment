# Canvas spec: sysdesign-m9-salted-key

- **Course and chapter:** system-design, 9.4 beat 3 (Salting splits one key into four).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** Salting splits a hot key into sub-keys that hash to different shards, but placement is random, so check the hottest shard.
- **Story:** Sub-keys noor#0 to noor#3 fly to shards 2, 4, 4 and 1. Loads: 750, 750, 300, 1,200. Verdict: Better, but shard 4 is still over.
- **Numbers:** 1,800 / 4 = 450 per sub-key; shard loads 300 + 450 = 750 (shards 1, 2), 300 (shard 3), 300 + 900 = 1,200 (shard 4). Placement is hash32 of seller:noor-crafts#i, mod 4.
- **Sources:** Course simulation; salting is a standard technique with no dossier source.
