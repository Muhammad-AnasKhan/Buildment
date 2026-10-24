# Canvas spec: sysdesign-m12-paused-wakes

- **Course and chapter:** system-design, 12.2 beat 3 (A paused node does not know).
- **Renderer:** `scene` (data only).
- **Claim:** A node that was paused has no way to see that it was paused, so it cannot be trusted to know it was replaced.
- **Story:** A runs, freezes at t = 2 s, B pings and gets nothing, B declares A dead and starts to replace it. A wakes at t = 14 s, sees only that its clock jumped, and still says it is the main.
- **Numbers:** Course numbers: 12 s freeze, jump from 2 s to 14 s.
- **Sources:** S70 (Kleppmann on pauses and leases); S52.
