# Canvas spec: sysdesign-m7-last-ticket

- **Course and chapter:** system-design, 7.1 beat 1 (Set the scene).
- **Renderer:** `scene` (data only).
- **Claim:** Two buyers who read the same count before either writes it back can both succeed. The second write overwrites the first, so one sale is lost from the count and one ticket is sold twice.
- **Story:** Both phones ask for the count (1). Both see 1. Dina writes 0, Omar writes 0. Both get 'ticket sold'. Verdict: 'Two tickets sold, one seat'.
- **Numbers:** One seat, two buyers. No other numbers.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** Course example (a lost update). The general pattern is in chapter 7.4.
