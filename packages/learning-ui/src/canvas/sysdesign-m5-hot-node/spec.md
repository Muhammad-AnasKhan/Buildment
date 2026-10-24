# Canvas spec: sysdesign-m5-hot-node

- **Course and chapter:** system-design, 5.6 beat 6 ("A hot key can melt one node").
- **Renderer:** `scene` (data only).
- **Claim:** A cache cluster spreads keys over nodes, but all reads of one key go to the node that holds it. A very hot key can overload one node while others are idle. A short copy in each app server's own memory takes the load off.
- **Story:** Shoppers ask for phone-x; every get goes to node 1, which turns red ("overloaded") while node 2 is "idle". The app keeps a 1-second copy in its own memory and answers "from memory"; node 1 now gets about one read a second per app server. Verdict: "A local copy shields the hot node".
- **Numbers:** the 1-second local copy is a story choice.
- **Sources:** consistent hashing balances key ranges, not a single hot key; hot partitions remain a top problem (dossier misconception 17) [S45, S44]. Consistent hashing was introduced for caches to relieve hot spots [S18].
