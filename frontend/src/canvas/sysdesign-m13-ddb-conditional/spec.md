# Canvas spec: sysdesign-m13-ddb-conditional

- **Course and chapter:** system-design, 13.4 beat 4 ("A conditional write refuses a stale update").
- **Renderer:** `scene` (data only).
- **Claim:** With a leader to order writes, a conditional write turns a lost update into a refusal that the app can retry.
- **Story:** Both read version 4. Hana's put-if-4 is saved as version 5. Dina's put-if-4 is refused because the item is at 5. Dina re-reads, merges, and her put-if-5 is saved as version 6. Verdict: "Stale write refused; nothing lost".
- **Numbers:** Versions 4, 5 and 6, made up.
- **Sources:** S42 (DynamoDB conditional writes prevent the lost update).
