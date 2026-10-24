# Canvas spec: sysdesign-m22-drain-gateway

- **Course and chapter:** system-design, 22.3 beat 4 ("Drain before you stop").
- **Renderer:** `scene` (data only).
- **Claim:** A gateway should not drop its phones at once. It asks each phone to reconnect after its own random wait, so the other gateways see a stream of new connections, not a wall. It stops only when it holds no lines.
- **Story:** Gateway 2 enters draining mode and sends "move later" to its phones. Each phone picks a random wait between 0 and 30 seconds, then connects through the balancer to a gateway with room (Gateway 5). When the last phone has moved, Gateway 2 shows "0 lines: stop". Verdict: "Spread out, then stop the gateway".
- **Numbers:** Course numbers: 50,000 lines on the gateway, wait window 0 to 30 s.
- **Sources:** None needed (course design). The random wait is the jitter of chapter 15.5.
