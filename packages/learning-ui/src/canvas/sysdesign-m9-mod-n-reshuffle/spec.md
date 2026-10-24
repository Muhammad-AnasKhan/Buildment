# Canvas spec: sysdesign-m9-mod-n-reshuffle

- **Course and chapter:** system-design, 9.2 beat 5 (Hash mod N: adding a shard moves most keys).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** With shard = hash mod N, changing N changes the home of most keys: N/(N+1) of them.
- **Story:** Key 17 goes from 17 mod 4 = 1 to 17 mod 5 = 2 and moves; key 20 is 0 both times and stays. Verdict: Adding 1 shard moves 80% of keys.
- **Numbers:** Derived: a key stays only if hash mod N equals hash mod (N+1), which is 1 key in N+1. Measured: 80.2% of 100,000 keys from 4 to 5 shards, 91.0% from 10 to 11.
- **Sources:** Derived (arithmetic); the measurement is the course's own simulation.
