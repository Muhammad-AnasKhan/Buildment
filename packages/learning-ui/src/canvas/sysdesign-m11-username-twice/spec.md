# Canvas spec: sysdesign-m11-username-twice

- **Course and chapter:** system-design, 11.3 beat 3 ("A unique name needs one order").
- **Renderer:** `scene` (data only).
- **Claim:** A rule like "this name is unique" needs every claim to be checked against the latest state, which a copy that only looks at itself cannot do.
- **Story:** User 1 and user 2 both ask for noor on different copies. Both copies see the name as free and say yes. The copies then exchange their claims and find two owners. Verdict: "Two people own the same name".
- **Numbers:** Course numbers.
- **Sources:** Kleppmann Cambridge notes on uniqueness constraints needing linearizability [S52]; DynamoDB conditional writes as the single-store fix [S42].
