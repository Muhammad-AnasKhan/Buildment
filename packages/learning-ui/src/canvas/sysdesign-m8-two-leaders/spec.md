# Canvas spec: sysdesign-m8-two-leaders

- **Course and chapter:** system-design, 8.6 beat 1 ("Each region writes at home").
- **Renderer:** `scene` (data only).
- **Claim:** Multi-leader gives fast local writes in every region, at the price of copying to each other afterwards.
- **Story:** A user in the EU writes to the EU leader and a user in Singapore writes to the Singapore leader, both in a couple of milliseconds. Then each leader sends its write to the other. Verdict: "Each region writes at home, fast".
- **Numbers:** 160 ms EU West to Singapore round trip [S3].
- **Sources:** napkin-math latency table [S3]; DynamoDB global tables, any Region accepts writes [S43].
