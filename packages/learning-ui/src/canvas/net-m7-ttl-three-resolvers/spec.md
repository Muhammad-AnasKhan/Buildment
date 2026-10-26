# Canvas spec: net-m7-ttl-three-resolvers

Course and chapter: networking, 7.4 beat 4 (playable). Renderer: the existing `slider` renderer, data only (`SliderSpec`, `renderers/slider/`), standing in for the planned `[timeline]` model, which has no data-driven renderer yet. Same slug. No new component.

## Claim

Resolvers with a short TTL pick up a change quickly and resolvers with a long TTL keep the old answer for a long time: after a change at 10:00, a resolver with a TTL of 60 seconds gives the new address within a minute, one with a TTL of 1 hour within an hour, and one with a TTL of 1 day within a day [S24].

## Touch

Four sliders: when the record changes (default 10:00) and when each of the three resolvers made its copy (60 s: 09:59:30, 1 hour: 09:58, 1 day: 09:58). Three numbers show when each resolver starts to give the new address; three bars show how long each keeps the old address after the change on one shared scale of one day. A sentence says which resolvers moved after each drag.

## Limits

A fixed model: three resolvers, one copy each, TTLs of 60 seconds, 1 hour and 1 day. It has no live DNS, no resolvers that ignore TTLs and no negative caching. Lowering a record's TTL does not change copies that are already held: this slider does not model a TTL change. The name, the times and the addresses (documentation range [S10]) are made up.
