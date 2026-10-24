# Canvas spec: sysdesign-m24-nine-cells

- **Course and chapter:** system-design, 24.2 beat 4 (Look in nine boxes).
- **Renderer:** `scene` (data only).
- **Claim:** Searching only the rider's own box misses a close driver across the edge; searching the box and its eight neighbours does not.
- **Story:** Rider sends its box code; the map reads 9 boxes; it finds a driver in the east box; the rider is told the driver is 30 m away.
- **Numbers:** 30 m apart at latitude 30.05: the two codes stq4vy and stq4yn were computed with the module's geohash code.
- **Sources:** Computed by the course's own code (scratch folder).
