# Canvas spec: sysdesign-m22-group-fanout

- **Course and chapter:** system-design, 22.2 beat 5 ("A group is one write and many sends").
- **Renderer:** `scene` (data only).
- **Claim:** A group message is saved once. The cost that grows with the group is the number of deliveries, and batching them per gateway turns 499 sends into about 60 messages between servers.
- **Story:** Layla posts to a group of 500. The chat service saves the message once, looks up each member's gateway, and sends one batch to each gateway. Each gateway then writes to its own members' open lines. Verdict: "1 write, about 60 batches, 499 sends".
- **Numbers:** Course numbers: 500 members, 60 gateways (from chapter 22.1), 9 and 8 members on the two drawn gateways.
- **Sources:** None needed (course design).
