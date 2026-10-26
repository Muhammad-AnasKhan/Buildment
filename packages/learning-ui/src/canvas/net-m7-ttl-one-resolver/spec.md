# Canvas spec: net-m7-ttl-one-resolver

Course and chapter: networking, 7.4 beat 3 (playable). Renderer: the existing `slider` renderer, data only (`SliderSpec`, `renderers/slider/`), standing in for the planned `[timeline]` model, which has no data-driven renderer yet. Same slug. No new component.

## Claim

A resolver keeps an answer for its TTL, so after a record changes, laptops behind a resolver that cached it at 09:58 with a TTL of 3600 seconds still get the old address until 10:58. A copy can never outlive its TTL, so the wait is at most one TTL [S24]. The DNS TTL counts seconds of cache life; the IP TTL from 4.4 counts router hops.

## Touch

Two sliders: when the record changes (minutes after 09:00, default 60 = 10:00) and when the resolver made its copy (default 58 = 09:58). Three numbers update: the time the old address is served until (10:58 at the defaults), how long it stays old after the change (58 min), and when the new address arrives. A bar shows the wait against the longest possible, one TTL. A sentence says what changed after each move. If the copy was made after the change, or ran out before it, nothing is old.

## Limits

A fixed model: one resolver, a TTL of 3600 seconds, a single copy. It has no live DNS, no resolvers that ignore TTLs and no negative caching. The name, the times and the addresses (documentation range [S10]) are made up.
