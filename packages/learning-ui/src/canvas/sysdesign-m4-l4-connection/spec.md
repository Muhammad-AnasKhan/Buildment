# Canvas spec: sysdesign-m4-l4-connection

- **Course and chapter:** system-design, 4.4 beat 1 ("L4 picks once per connection").
- **Renderer:** `scene` (data only).
- **Claim:** An L4 balancer chooses per connection, not per request, so all requests on one connection land on one server.
- **Story:** The phone opens a connection; the balancer hashes it to App 2. Requests 1, 2 and 3 travel the same connection and all go to App 2. App 2 shows 3 requests; App 1 and App 3 stay idle. Verdict: "L4: one connection, one server".
- **Numbers:** None.
- **Sources:** NLB selects a target per TCP connection with a flow hash over protocol, addresses, ports and TCP sequence number, and keeps the connection on that target [S15]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
