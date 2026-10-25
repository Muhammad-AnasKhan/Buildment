# Canvas spec: sysdesign-m12-stale-write

- **Course and chapter:** system-design, 12.4 beat 2 (The old leader still writes).
- **Renderer:** `scene` (data only).
- **Claim:** A lease cannot stop a paused client from acting after its lease ended, because the client does not know. Storage that accepts any write loses the new leader's data.
- **Story:** A freezes, its lease ends, B takes over with token 34 and writes x = B. A wakes up, still holds token 33, and writes x = A. Storage accepts it. Verdict: "Old leader overwrote the new one".
- **Numbers:** Lease 10 s, freeze 14 s, tokens 33 and 34 [S70].
- **Sources:** S70.
