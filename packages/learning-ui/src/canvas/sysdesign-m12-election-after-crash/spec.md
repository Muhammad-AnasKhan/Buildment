# Canvas spec: sysdesign-m12-election-after-crash

- **Course and chapter:** system-design, 12.5 beat 2 (The first timer to fire wins).
- **Renderer:** `scene` (data only).
- **Claim:** A follower that hears no leader for a random time becomes a candidate in a new term and wins if a majority votes for it.
- **Story:** S1 beats to S2, then crashes. Timers are 190 to 270 ms. S3 fires first, becomes candidate for term 2, gets three yes votes, and with its own vote has 4 of 5.
- **Numbers:** Timers inside 150 to 300 ms [S68]; majority of 5 is 3.
- **Sources:** S68.
