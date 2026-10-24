# Canvas spec: sysdesign-m7-index-scan

- **Course and chapter:** system-design, 7.3 beat 1.
- **Renderer:** `scene` (data only).
- **Claim:** An index lets the database find rows by touching a handful of pages instead of the whole table.
- **Story:** The app asks for buyer 91. With no index the database reads all 12,739 table pages. After CREATE INDEX the same question reads 21 pages.
- **Numbers:** Measured on PostgreSQL 18.6 in Docker, 2026-10-24: 2,000,000 rows, 12,739 table pages, buyer 91 has 18 tickets. Scan: 12,739 buffers. Index: 3 index buffers + 18 table buffers = 21. The B-tree on buyer_id had 3 levels.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** Course measurement with EXPLAIN (ANALYZE, BUFFERS) on PostgreSQL 18.6, 2026-10-24. PostgreSQL pages are usually 8 kB (storage page layout docs, read 2026-10-24).
