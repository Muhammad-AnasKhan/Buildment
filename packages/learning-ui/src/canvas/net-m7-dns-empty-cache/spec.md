# Canvas spec: net-m7-dns-empty-cache

Course and chapter: networking, 7.3 beat 2 (step through). Renderer: the existing `sequence` renderer, data only (`SequenceSpec`, `renderers/sequence/`). No new component.

## Claim

A resolver with an empty cache finds an address by walking the tree for the laptop: the root points to the .com servers, the .com servers point to the servers of example.com, and those servers give the address. Each server knows only who is below it; the laptop sees none of this [S24].

## Touch

**Next** and **Back** step through eight messages on four lanes: the resolver (10.5.0.1), the root, a .com server (TLD) and example.com's authoritative server. Step 1 is the laptop's question and step 8 the final answer, both drawn on the resolver's lane. At step 7 the address 203.0.113.45 appears with a TTL of 300.

## Limits

One scripted run: an empty cache, one A record, no DNSSEC. A sequence draws at most four lanes, so the laptop is not a lane. The names (shop.example.com), the address (203.0.113.45, a documentation address [S10]) and the TTL of 300 are made up for the lesson.
