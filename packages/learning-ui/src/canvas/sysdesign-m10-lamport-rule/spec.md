# Canvas spec: sysdesign-m10-lamport-rule

- **Course and chapter:** system-design, 10.3 beat 2 ("A receiver always lands after the sender").
- **Renderer:** `scene` (data only).
- **Claim:** Lamport rule: a local event or send adds 1; a receive sets the clock to max(own, stamp) + 1. So an effect always has a bigger number than its cause.
- **Story:** A does an event (1) and a send (2). B at 5 receives stamp 2: max(5,2)+1 = 6. B sends at 7. C at 0 receives 7: max(0,7)+1 = 8. Verdict: "Every receive lands after its send".
- **Numbers:** Course numbers chosen to show both branches of the rule.
- **Sources:** S58 (Lamport 1978: IR1 and IR2, the Clock Condition).
