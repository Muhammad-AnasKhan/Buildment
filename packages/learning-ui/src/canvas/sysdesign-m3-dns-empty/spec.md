# Canvas spec: sysdesign-m3-dns-empty

- **Course and chapter:** system-design, 3.3 beat 6.
- **Renderer:** `scene` (data only).
- **Claim:** DNS is a dependency of everything that connects by name: an empty record makes a running service unreachable.
- **Story:** The app server asks the resolver for the database's address; the DNS record has 0 addresses; "no address" travels back; the app "cannot connect" while DynamoDB is "still running". Verdict: "Healthy database, no way to find it".
- **Numbers:** Dates only: 19 to 20 October 2025.
- **Sources:** [S135] AWS post-event summary for us-east-1, 2025-10-19 and 20 (a race in DynamoDB's DNS automation applied an old plan and deleted it, leaving the regional endpoint with no addresses). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
