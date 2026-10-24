# Canvas spec: sysdesign-m24-write-every-ping

- **Course and chapter:** system-design, 24.3 beat 1 (A ping every 4 seconds, a million drivers).
- **Renderer:** `scene` (data only).
- **Claim:** Writing every location ping to a disk database needs about 100 database nodes for data that is old after 4 seconds.
- **Story:** Driver pings; gateway writes to the table; again; the table says 250,000 a second; verdict says one disk write per ping adds up.
- **Numbers:** 1,000,000 / 4 s = 250,000 pings a second. 250,000 / 2,500 = 100 database nodes.
- **Sources:** Arithmetic on course assumptions (24.1, 20.2).
