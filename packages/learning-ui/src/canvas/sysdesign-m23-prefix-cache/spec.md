# Canvas spec: sysdesign-m23-prefix-cache

- **Course and chapter:** system-design, 23.3 beat 5 ("Cache the short prefixes").
- **Renderer:** `scene` (data only).
- **Claim:** The shortest prefixes are the most requested and the fewest, so a small cache answers most of the traffic and only longer prefixes reach the trie servers.
- **Story:** The phone types s, sh and shoes r. The first two are cache hits. The third is not kept, so the cache passes it to Suggest, which answers. Verdict: "Short prefixes never reach the trie".
- **Numbers:** 26 one-letter prefixes and 26 x 26 = 676 two-letter prefixes (a to z only): 702 in total. The share of traffic they take is not claimed here.
- **Sources:** Arithmetic. Cache behaviour: chapters 5.3 and 5.4.
