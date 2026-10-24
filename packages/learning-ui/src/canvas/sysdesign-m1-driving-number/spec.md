# Canvas spec: sysdesign-m1-driving-number

- **Course and chapter:** system-design, 1.2 beat 4 ("Find the number that drives design").
- **Renderer:** `scene` (data only).
- **Claim:** Of all the requirements, one number usually shapes the architecture most. For a notes app at exam time it is the peak read rate, which is about 100 times the upload rate.
- **Story:** "read" messages stream from students to Daftar; one amber "upload" goes by. Tags appear on a requests-per-second strip: "uploads 2/s" and "reads 200/s". Daftar's line becomes "read-heavy". Verdict: "Reads drive this design, 100 to 1".
- **Numbers:** 2 uploads and 200 reads a second at the exam peak are illustrative for a fictional app.
- **Predict before it (in the chapter):** total users (20,000) versus peak reads (200 a second): which number shapes the design more.
- **Sources:** none needed for the picture.
