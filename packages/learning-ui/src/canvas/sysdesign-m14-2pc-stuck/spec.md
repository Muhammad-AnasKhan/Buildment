# Canvas spec: sysdesign-m14-2pc-stuck

- **Course and chapter:** system-design, 14.2 beat 4 (Locked rows queue up).
- **Renderer:** `scene` (data only).
- **Claim:** A prepared database promised not to decide alone. When the coordinator is gone, it waits, and its locks wait with it.
- **Story:** Prepare, both yes, coordinator crashes. Both databases show waiting. The queue of other orders grows from 5 to 30 while the coordinator is down.
- **Numbers:** Course numbers: 2 orders per second, so 15 seconds down gives 30 waiting orders. Not from the dossier.
- **Sources:** S77 for 'blocks if the coordinator fails'.
