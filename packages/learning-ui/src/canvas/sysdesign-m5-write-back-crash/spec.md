# Canvas spec: sysdesign-m5-write-back-crash

- **Course and chapter:** system-design, 5.3 beat 4 ("Write-back is fast, until a crash").
- **Renderer:** `scene` (data only).
- **Claim:** With write-back (write-behind), the cache confirms a write before the database has it and writes it later. Writes are fast, and a crash before the flush loses writes that users were told are saved.
- **Story:** A shopper orders the phone; the cache lowers stock to 4 and says done at once. It plans to flush in 1 second, crashes first, and the database still says stock 5. Verdict: "Said done, but the write is gone".
- **Numbers:** the 1-second flush delay is a story number.
- **Predict before it (in the chapter):** whether a write the cache confirmed survives a crash of the cache node.
- **Sources:** no primary source in the dossier for the term write-back or write-behind (dossier "Unverified claims" 12); taught as a trade-off without attribution, as the dossier says.
