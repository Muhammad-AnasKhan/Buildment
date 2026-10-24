# Canvas spec: sysdesign-m1-paste-estimate

- **Course and chapter:** system-design, 1.4 beat 3 ("Estimate: turn the day into seconds").
- **Renderer:** `scene` (data only).
- **Claim:** A daily number becomes a per-second rate by dividing by 86,400. Three short sums tell you whether the system is small or large before you choose any blocks.
- **Story:** "Per day: 100k pastes" sends three sums: "/ 86,400 s" to Writes (1.2 per second), "x 10 reads" to Reads (12 per second), "x 10 KB x 30 days" to Storage (30 GB). Verdict: "Small numbers: keep it simple".
- **Numbers:** inputs are assumptions for a fictional pastebin. 100,000 / 86,400 = 1.16; 1,000,000 / 86,400 = 11.6; 100,000 x 10 KB = 1 GB a day, x 30 days = 30 GB.
- **Predict before it (in the chapter):** is 100,000 pastes a day about 1 or about 100 writes a second.
- **Sources:** arithmetic only.
