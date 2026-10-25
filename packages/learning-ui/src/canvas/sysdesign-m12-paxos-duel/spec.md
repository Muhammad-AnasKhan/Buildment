# Canvas spec: sysdesign-m12-paxos-duel

- **Course and chapter:** system-design, 12.7 beat 3 (Two proposers keep outbidding).
- **Renderer:** `scene` (data only).
- **Claim:** Paxos is always safe, but two proposers that keep sending higher numbers can stop each other from finishing. That is why real systems pick one distinguished proposer.
- **Story:** P1 prepares 1, P2 prepares 2, P1's accept 1 is refused, P1 prepares 3, P2's accept 2 is refused. Verdict: "Two proposers keep outbidding".
- **Numbers:** Proposal numbers 1, 2, 3.
- **Sources:** S67 (progress needs a single distinguished proposer).
