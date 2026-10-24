# Canvas spec: sysdesign-m13-hint-lost

- **Course and chapter:** system-design, 13.3 beat 4 ("A lost hint leaves a copy behind").
- **Renderer:** `scene` (data only).
- **Claim:** Hinted handoff only covers a failure that ends while the stand-in is alive, so a second mechanism must find the rest.
- **Story:** C is down. The write goes to A, B and the stand-in D with a hint for C. Then D crashes and loses its hint. C comes back still holding x = 6. Verdict: "Hint lost: C stays behind".
- **Numbers:** No numbers. Story only.
- **Sources:** S45 (Dynamo: hinted handoff for temporary failures; anti-entropy with Merkle trees for permanent failures).
