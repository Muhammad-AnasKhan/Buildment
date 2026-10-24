# Canvas spec: sysdesign-m24-stadium-night

- **Course and chapter:** system-design, 24.3 beat 6 (The stadium empties).
- **Renderer:** `scene` (data only).
- **Claim:** One box can carry far more traffic than its neighbours, and a short cache in front of it turns thousands of searches a second into one recompute every 2 seconds.
- **Story:** Fans send 4,000 searches a second to the stadium box; it shows 75 times the work of a quiet box; the map copy is added; searches go to the copy; the box is asked once every 2 seconds.
- **Numbers:** 3,000 drivers against 40 in a quiet box = 75 times. 20,000 fans / 5 s = 4,000 searches a second. A driver at 30 km/h moves about 17 m in 2 s.
- **Sources:** Arithmetic on course assumptions. Scan time measured by the course's own benchmark (about 0.1 ms to scan 3,000 drivers in plain JavaScript on one laptop).
