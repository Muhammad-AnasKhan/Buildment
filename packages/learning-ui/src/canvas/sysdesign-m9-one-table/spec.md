# Canvas spec: sysdesign-m9-one-table

- **Course and chapter:** system-design, 9.1 beat 1 (One table, one disk).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** One machine has two ceilings, disk space and write rate. Suq's orders table is close to the first one.
- **Story:** Buyers send orders through the app to one orders database. Tags on the strip show 1.8 TB used and the 2 TB limit; the database says it grows 40 GB a day and is full in 5 days. Verdict: The disk is full in about 5 days.
- **Numbers:** Made-up story numbers: 1.8 TB used of 2 TB, +40 GB a day, so (2,000 - 1,800) / 40 = 5 days; 700 writes a second against 1,000.
- **Sources:** None needed (course story).
