# Canvas spec: sysdesign-m10-lamport-no-cause

- **Course and chapter:** system-design, 10.3 beat 4 ("A smaller number does not mean earlier").
- **Renderer:** `scene` (data only).
- **Claim:** If a happened before b then C(a) < C(b), but C(a) < C(b) does not mean a happened before b.
- **Story:** A makes 5 events and C makes 3, with no messages between them. A wrote at 5, C wrote at 3. Verdict: "3 < 5, but neither caused the other".
- **Numbers:** Course numbers.
- **Sources:** S58 (the converse of the Clock Condition does not hold), S52.
