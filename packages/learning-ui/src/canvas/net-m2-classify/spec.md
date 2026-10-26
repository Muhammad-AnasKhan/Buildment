# Canvas spec: net-m2-classify

- **Course and chapter:** networking, 2.4. Full spec: `agent-ip/work/networking/canvas-specs/net-m2-addr-modes-and-scenes.md`, section "net-m2-classify".
- **Renderer:** custom beat canvas, `mode="classify"` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `ClassifyView.tsx`). Model: `models/net-address.ts` (`classify`, `classifyReason`, `classifyFeedback`, `KIND_BLOCKS`), the same `classify()` the 2.5 exercise tests.
- **Claim:** every IPv4 address is public, private (RFC 1918), shared (`100.64.0.0/10`) or special (the IANA registry).
- **Data:** twelve addresses, mixed. Private: 192.168.1.23, 10.20.143.7, 172.17.0.3, 172.31.255.254. Public: 172.32.0.1, 192.169.1.1, 1.1.1.1. Shared: 100.72.14.9. Special: 127.0.0.1, 169.254.10.20, 203.0.113.45, 0.0.0.0.
- **Input:** tap an address, then a bucket. A wrong try stays unplaced and says why ("172.32.0.1 is just past 172.31.255.255, where the private block ends"). **Reset**.
- **Verdict:** "N of 12 sorted", then "All 12 sorted, no wrong tries" or the count of wrong tries.
- **Prefix list:** RFC 1918 (10/8, 172.16/12, 192.168/16), shared 100.64/10, special 0/8, 127/8, 169.254/16, the three documentation blocks, 198.18/15 and 240/4 from the dossier's registry table, plus 224/4 (multicast) so a multicast address is never called public. That one row is not in the dossier table and is flagged for the reviewer.
- **Limits (in the fold):** the course's prefix list; 203.0.113.45 is a documentation address sorted as special.
