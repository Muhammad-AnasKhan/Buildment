# Canvas spec: sysdesign-m5-stale-race

- **Course and chapter:** system-design, 5.5 "Cache invalidation", beat "Move the slow reader, find the race". Model `models/stale-race.ts`; knob zone from `primitives/slider-zone.tsx`.
- **Claim:** With delete-on-write the danger is the order of two events: a stale set after the delete keeps the old value until the TTL. Leases refuse that set (S24).
- **Picture:** Reader app, Cache, Database and Writer app cards; a ruler from 0 to 60 ms with fixed tags (read 999 at 10, write 899 at 20, delete at 25) and a draggable knob "set 999 at N ms". A playhead sweeps the ruler and the messages fly between the cards as it passes them; the Cache pill shows what it holds. A tag beside the cache says how long the cache is wrong. While the knob is held the picture shows how the race ends. Toggle outside the picture: Leases on.
- **Model (ms):** set s < 20: cache holds 999 then it is stale 20 to 25, window 5 ms. 20 <= s < 25: stale from s to 25, window 25 - s. s >= 25, leases off: 999 stays until the 60 s TTL. s >= 25, leases on: the set is refused, the cache stays empty and the next read loads 899.
- **Inputs:** s from 11 to 60, step 1 (Page keys 10), snaps 15, 25, 40 on drag; leases toggle. Default 40, leases off.
- **Verdicts:** s < 25 "Delete wins: stale for a few ms"; s >= 25 off "Old price back until the TTL"; s >= 25 on "Lease refused the late set".
- **Reduced motion:** the playhead rests at 60 ms, so the final cache value, the stale tag and the verdict show.
