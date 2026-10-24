# Canvas spec: sysdesign-m13-ddb-write

- **Course and chapter:** system-design, 13.4 beat 2 ("One leader per partition").
- **Renderer:** `scene` (data only).
- **Claim:** DynamoDB replicates each partition through one leader and a quorum of its three copies, which is not the leaderless write of the Dynamo paper.
- **Story:** The client sends a put to the leader. The leader sends a log record to two replicas. One acks first. Two of three have stored it, so the leader tells the client OK. Verdict: "OK once a quorum has the log record".
- **Numbers:** Three replicas per partition; a write is acknowledged when a quorum stores the log record [S44].
- **Sources:** S44 (DynamoDB: Multi-Paxos group of three replicas with a leader; writes acknowledged when a quorum persists the log record).
