# Canvas spec: sysdesign-m10-wall-breaks-cause

- **Course and chapter:** system-design, 10.5 beat 1 ("Wall time alone stamps the effect first").
- **Renderer:** `scene` (data only).
- **Claim:** Plain wall-clock timestamps do not respect cause and effect when clocks disagree by more than the message travel time.
- **Story:** A sends at 100; B, 40 ms behind, receives 10 ms later and reads 70. Verdict: "Receive stamped before its send".
- **Numbers:** Course numbers: skew 40 ms, travel 10 ms, so B reads 100 + 10 - 40 = 70.
- **Sources:** S59 (Kulkarni et al. 2014: the problem hybrid clocks solve), S52.
