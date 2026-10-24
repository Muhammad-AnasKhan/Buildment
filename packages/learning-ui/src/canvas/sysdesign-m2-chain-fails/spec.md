# Canvas spec: sysdesign-m2-chain-fails

- **Course and chapter:** system-design, 2.6 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** A request through parts in series fails when any part fails.
- **Story:** A page passes load balancer, app and database and works; then the database goes down and the same page returns an error. Verdict: "Any link down: the page fails".
- **Numbers:** Example targets: load balancer 99.99%, app 99.9%, database 99.9%; series 99.79%.
- **Sources:** Series formula is probability arithmetic under independent failures (source needed for a citable reference). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
