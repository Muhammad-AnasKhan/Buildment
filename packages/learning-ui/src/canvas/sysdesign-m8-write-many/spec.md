# Canvas spec: sysdesign-m8-write-many

- **Course and chapter:** system-design, 8.7 beat 1 ("No leader: write to many nodes").
- **Renderer:** `scene` (data only).
- **Claim:** A leaderless write succeeds once enough nodes confirm it, not all of them.
- **Story:** The client sends x = 7 to five nodes. Nodes 1, 2 and 3 confirm. Nodes 4 and 5 are slow and get the value later. With three confirmations the client treats the write as done. Verdict: "3 of 5 saved it: write succeeds".
- **Numbers:** five nodes and a write quorum of three; a majority of 5 is 3 [S52].
- **Sources:** Dynamo [S45]; Kleppmann on majority quorums [S52].
