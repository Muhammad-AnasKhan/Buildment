# Canvas spec: sysdesign-m10-sync-pulls-back

- **Course and chapter:** system-design, 10.2 beat 2 ("A sync pulls the clock back").
- **Renderer:** `scene` (data only).
- **Claim:** Time sync (NTP) corrects drift but leaves a small error, so clocks are close, never equal.
- **Story:** A asks the time server, gets the time and the trip, adjusts. Error goes from +180 ms to about +2 ms. Verdict: "180 ms error drops to a few ms".
- **Numbers:** Quiet local network within 1 ms, wider networks "it all depends" [S64]; slewing keeps clocks within a few ms [S52]. The 2 ms is illustrative.
- **Sources:** S64, S52.
