# Canvas spec: sysdesign-m7-path-index

- **Course and chapter:** system-design, 7.6 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** The cheapest fix comes first: a missing index costs nothing to run and can remove most of the load.
- **Story:** A slow query keeps the database at 92% CPU. The team adds an index. The page drops from 3.2 s to 40 ms and the CPU to 28%.
- **Numbers:** CPU 92% to 28%; page time 3.2 s to 40 ms. Made up.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** Course example. Index effects: chapter 7.3.
