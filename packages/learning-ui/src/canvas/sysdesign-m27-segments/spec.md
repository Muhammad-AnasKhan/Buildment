# Canvas spec: sysdesign-m27-segments

- **Course and chapter:** system-design, 27.4 beat 1 ("A video is a list of short pieces").
- **Renderer:** `scene` (data only), with a strip of video time in seconds.
- **Claim:** A video is delivered as a playlist plus short pieces, each an ordinary file that any cache can hold.
- **Story:** The player gets the playlist, picks 720p, then fetches pieces 1, 2 and 3. Each green tag sits at the middle of the 6 second span it covers (3, 9, 15). Verdict: "A video is a list of 6 s pieces".
- **Numbers:** 6 second pieces, five qualities (course choices, chapter 27.1).
- **Sources:** HLS RFC 8216 and DASH ISO/IEC 23009-1 are listed as "source needed" in the chapter.
