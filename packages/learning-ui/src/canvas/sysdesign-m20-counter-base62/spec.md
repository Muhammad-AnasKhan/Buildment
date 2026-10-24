# Canvas spec: sysdesign-m20-counter-base62

- **Course and chapter:** system-design, 20.3 beat 3 ("A counter never repeats").
- **Renderer:** `scene` (data only).
- **Claim:** A counter plus base62 gives codes that never clash, but they are in order, so the next code is easy to guess.
- **Story:** The app asks the counter for the next number, gets 125 and writes it as 0000021 (base62, padded to 7). The next link gets 126, 0000022. Verdict: "Unique, but easy to guess".
- **Numbers:** 125 in base62 is 21 (2 x 62 + 1); checked by running the encoder in the code exercise.
- **Sources:** Course reasoning; chapter 10.7 [S65] covers counters and Snowflake IDs.
