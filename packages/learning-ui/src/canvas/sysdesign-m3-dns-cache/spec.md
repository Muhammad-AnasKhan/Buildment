# Canvas spec: sysdesign-m3-dns-cache

- **Course and chapter:** system-design, 3.3 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** Within the TTL, a resolver answers from its cache, and the name server is not asked.
- **Story:** Tags mark "cached 0 s" and "expires 300 s" on a seconds strip, and "Sara asks 60 s". Sara's phone asks; the resolver has a cache hit and answers with the address and the time left, 240 s. The name server stays "not asked". Verdict: "From the cache: no walk, no wait".
- **Numbers:** The 300 s TTL and the 60 s are example values.
- **Sources:** [S9] RFC 1035 (TTL: how long a record may be cached; 0 means do not cache). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
