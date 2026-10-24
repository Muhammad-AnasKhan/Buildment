# Canvas spec: sysdesign-m27-abr-switch

- **Course and chapter:** system-design, 27.4 beat 2 ("The player chooses the quality").
- **Renderer:** `scene` (data only), with a strip of video time in seconds.
- **Claim:** Adaptive bitrate streaming: the player measures how long pieces take and chooses the quality of the next piece, so a slow network gives a softer picture and not a stall.
- **Story:** Pieces 1 and 2 arrive at 720p. Piece 3 arrives slowly (the long message). The player switches to 360p for piece 4. Verdict: "Player steps down, no stall".
- **Numbers:** none beyond the five-quality ladder of chapter 27.1 (course numbers).
- **Sources:** Published adaptive bitrate algorithms are listed as "source needed" in the chapter; the rule in the picture is an invented example.
