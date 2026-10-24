# Canvas spec: sysdesign-m10-drift-apart

- **Course and chapter:** system-design, 10.2 beat 1 ("Clocks drift apart on their own").
- **Renderer:** `scene` (data only).
- **Claim:** A clock that is off by 50 ppm gains or loses 50 microseconds every second; two such clocks in opposite directions are 360 ms apart after one hour.
- **Story:** Both servers read 12:00:00. After an hour, A shows +180 ms and B shows -180 ms. Verdict: "360 ms apart after one hour".
- **Numbers:** 1 ppm = 1 microsecond per second = 86 ms per day; most computer clocks are within 50 ppm [S52]. 50 us/s x 3,600 s = 180 ms (course arithmetic).
- **Sources:** S52.
