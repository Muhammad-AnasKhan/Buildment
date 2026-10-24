# Canvas spec: sysdesign-m3-anycast

- **Course and chapter:** system-design, 3.3 beat 4.
- **Renderer:** `scene` (data only).
- **Claim:** With anycast, one address is announced from several sites and routing delivers each user to one of them; when a site withdraws its route, its users are routed to another site.
- **Story:** Europe and Asia both send to 198.51.100.1 and reach Frankfurt and Singapore. Verdict: "Same address, nearest site answers". Then Frankfurt's route is withdrawn, the European user's next request travels to Singapore. Final verdict: "Site gone: routes move to the next".
- **Numbers:** None.
- **Sources:** [S14] RFC 4786 (anycast; routes must stay stable for longer than a transaction); [S112] AWS Global Accelerator (static anycast addresses from the AWS edge network); [S136] Meta 2021 (DNS servers withdrew their anycast routes). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
