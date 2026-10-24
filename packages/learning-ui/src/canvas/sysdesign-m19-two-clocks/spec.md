# Canvas spec: sysdesign-m19-two-clocks

- **Course and chapter:** system-design, 19.3 beat 2 ("Two clocks: how much, how long").
- **Renderer:** `scene` (data only).
- **Claim:** A failure starts two separate measurements. The data lost is the gap back to the last recovery point (the RPO view). The time down is the gap until service is back (the RTO view).
- **Story:** A tag at 02:00 marks the last copy, a tag at 14:07 marks the failure, a tag at 15:24 marks the return. Orders lose 12 h 7 min of data; the app is down 77 min. Verdict: "RPO is data lost, RTO is time down".
- **Numbers:** 14:07 minus 02:00 is 12 h 7 min. 77 min = 1 TB at 250 MB/s (about 67 min) + 10 min to switch the app. All made up, matching the 19.3 playable.
- **Sources:** RPO and RTO definitions [S108].
