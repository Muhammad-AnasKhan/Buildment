# Canvas spec: sysdesign-m21-pull-read

- **Course and chapter:** system-design, 21.3 beat 2 (Pull: gather posts when someone looks).
- **Renderer:** `scene` (data only).
- **Claim:** Fan-out on read does the work when someone looks: one lookup per followed account, then a merge. Posting is cheap and reading is heavy.
- **Story:** Omar opens the feed. The feed service asks Dina's, the news account's and the bakery's lists, merges them and replies. Verdict: "Pull: one lookup per account".
- **Numbers:** Everyday reader in chapter 21.3: 150 follows, so 150 lookups per feed open.
- **Sources:** A course story; the trade-off is standard.
