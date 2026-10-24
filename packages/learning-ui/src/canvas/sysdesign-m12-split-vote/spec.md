# Canvas spec: sysdesign-m12-split-vote

- **Course and chapter:** system-design, 12.5 beat 3 (A split vote and a retry).
- **Renderer:** `scene` (data only).
- **Claim:** Each server votes once per term, so two candidates in the same term can split the votes and nobody reaches a majority. A new random wait breaks the tie.
- **Story:** S1 is down. S2 and S3 time out at 220 ms. S4 backs S2 and S5 backs S3. Both have 2 of 5, so no leader. New timers are 160 ms and 290 ms. S2 starts term 3 first and everyone votes for it.
- **Numbers:** Majority of 5 is 3. Timers inside 150 to 300 ms [S68]. In challenge 11 part 1, a 150 to 300 ms range elected a leader in about one round on average.
- **Sources:** S68.
