# Canvas spec: sysdesign-m12-old-leader-cut-off

- **Course and chapter:** system-design, 12.6 beat 2 (Two leaders, one can commit).
- **Renderer:** `scene` (data only).
- **Claim:** A leader on the small side of a split keeps accepting writes but cannot commit them, because it cannot reach a majority. The majority side elects a new leader and carries on.
- **Story:** The network splits {S1, S2} from {S3, S4, S5}. S1 stores y = 9 on 2 of 5 and waits. S3 wins term 2 and commits z = 7 on 3 of 5.
- **Numbers:** 5 servers, majority 3. Sides of 2 and 3.
- **Sources:** S68; S134 for a real split that produced two writers.
