# Canvas spec: sysdesign-m13-lww-whole-item

- **Course and chapter:** system-design, 13.5 beat 3 ("Different fields, one edit lost").
- **Renderer:** `scene` (data only).
- **Claim:** Last write wins works on whole items, so it can drop an edit that did not conflict with anything.
- **Story:** Hana sets qty = 2 on node A at t = 10. Dina sets a gift note on node B at t = 12. Both are told OK. The nodes swap items and keep t = 12. The quantity is back to 1. Verdict: "Different fields, yet one edit is lost".
- **Numbers:** Stamps 10 and 12, made up.
- **Sources:** S43 (DynamoDB global tables: last writer wins per item), S52.
