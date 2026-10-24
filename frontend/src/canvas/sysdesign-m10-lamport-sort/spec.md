# Canvas spec: sysdesign-m10-lamport-sort

- **Course and chapter:** system-design, 10.3 beat 5 ("Ties broken by node name give one order").
- **Renderer:** `scene` (data only).
- **Claim:** Sorting events by (Lamport counter, node name) gives every server the same total order, whatever order the events arrive in.
- **Story:** The same three events arrive in three different orders. After sorting, each server holds A4, C4, B6. Verdict: "Every server sorts the same way".
- **Numbers:** Course numbers.
- **Sources:** S58 (a total order from the clocks plus a tie-break by process).
