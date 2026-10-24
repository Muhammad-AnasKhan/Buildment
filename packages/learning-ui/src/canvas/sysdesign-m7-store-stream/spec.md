# Canvas spec: sysdesign-m7-store-stream

- **Course and chapter:** system-design, 7.2 beat 4.
- **Renderer:** `scene` (data only).
- **Claim:** When data arrives in time order and is read by time range, a store that keeps rows sorted by time (a time-series or wide-column store) turns each read into one contiguous range.
- **Story:** Three scans arrive and are appended at the newest end. The ops screen asks for the last 5 minutes and gets one range of 5,400 rows.
- **Numbers:** 18 scans per second x 300 seconds = 5,400 rows in 5 minutes (made-up rate).
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** Course example. Bigtable data model: rows kept in sorted order by row key (Chang et al., OSDI 2006, read 2026-10-24); Timescale hypertables partition time-series data by time (Tiger Data docs, read 2026-10-24).
