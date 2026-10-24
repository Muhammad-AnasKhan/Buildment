# Canvas spec: sysdesign-m1-paste-ids

- **Course and chapter:** system-design, 1.4 beat 5 ("Deep dive: the paste ID").
- **Renderer:** `scene` (data only).
- **Claim:** Random short IDs can clash, and two servers cannot see each other's choices. A unique key in the database is the one place that sees both, so it must enforce uniqueness, and the app must retry on a clash.
- **Story:** App 1 inserts aB3xY9 and it is saved. App 2 picks the same ID; the database answers "ID taken!" (red ring). App 2 picks Qp7k2M and it is saved (green ring). Verdict: "The unique key catches the clash".
- **Numbers (in the chapter's fold):** 62 to the power 6 is about 56.8 billion IDs. With 3 million live pastes (100,000 a day for 30 days), a new random ID clashes about 1 time in 19,000, so about 5 times a day at 100,000 new pastes a day. Arithmetic only.
- **Sources:** none needed.
