# Canvas spec: sysdesign-m24-two-riders-one-driver

- **Course and chapter:** system-design, 24.4 beat 3 (Two riders, one driver).
- **Renderer:** `scene` (data only).
- **Claim:** A search that only reads the driver's state cannot stop a second search from picking the same driver.
- **Story:** Search A and search B both see D as free; both send an offer; D receives two offers; verdict says two rides, one driver.
- **Numbers:** About 600 ride requests a second at the busiest time (chapter 24.1).
- **Sources:** None.
