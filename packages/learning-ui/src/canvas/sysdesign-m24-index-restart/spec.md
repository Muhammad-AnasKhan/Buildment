# Canvas spec: sysdesign-m24-index-restart

- **Course and chapter:** system-design, 24.3 beat 7 (Restart empty, refill in seconds).
- **Renderer:** `scene` (data only).
- **Claim:** Because the map holds only the latest place and every driver repeats it every 4 seconds, a lost map heals itself within one ping interval.
- **Story:** The map restarts empty and the rider sees no cars; pings arrive and refill it; after 4 seconds it is full and the rider sees all cars.
- **Numbers:** Ping every 4 s (chapter 24.1).
- **Sources:** None.
