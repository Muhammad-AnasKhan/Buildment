# Canvas spec: net-m1-scene-broadcast-mac

- **Course and chapter:** networking, 1.6 beat 5 (watch only). Full spec: `agent-ip/work/networking/canvas-specs/net-m1-packet-and-replay.md`, section C.
- **Renderer:** the existing `scene` renderer, data only (`SceneSpec`, `renderers/scene/`). No new component.
- **Claim:** A packet sent to the broadcast MAC `ff:ff:ff:ff:ff:ff` is heard by every device on the link; the unicast reply goes to one.
- **Story:** four devices on one link (laptop .10, phone .20, TV .31, printer .40). The laptop's ARP request goes to `ff:ff:ff:ff:ff:ff` and reaches the other three; the phone says "that is me", the TV and printer say "hears, no reply"; the phone answers by unicast to the laptop's MAC (`02:00:00:00:00:10`, made up); the laptop says "got the MAC".
- **Input:** none; **Replay**.
- **Verdict:** "One broadcast, one answer."
- **Accessibility:** the scene's own description and status text; the verdict is in words; reduced motion shows the final frame.
- **Limits (in the fold):** made-up devices and MACs; ARP is module 3; no switch is drawn.
