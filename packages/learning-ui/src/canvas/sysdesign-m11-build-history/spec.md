# Canvas spec: sysdesign-m11-build-history

- **Course and chapter:** system-design, 11.2 ("A consistency model is a contract on histories"), beat 1 "A history is a list of bars".
- **Renderer:** custom beat canvas on `BeatFrame`, drawn with the new reusable `primitives/history-view.tsx` (lanes of bars over a time axis). No existing primitive draws operations with a start and an end, which is why the history picture is a new primitive. Rules in `models/history.ts`, geometry and text fitting in `models/history-layout.ts`, this beat's rules in `models/history-build.ts`.
- **Claim:** A history is a list of operations with a start, an end and a result. Two bars are ordered when one ends before the other starts, and concurrent otherwise.
- **Model:** lanes Ada, Ben and Cam on a time axis from 0 to 100 (made-up milliseconds). Preset: Ada writes x = 1 from 10 to 30; Ben reads from 20 to 40; Cam reads from 50 to 70. Real-time order: a is before b when `a.end < b.start`; bars that touch overlap.
  - A tap on a lane adds a bar of length 20. Its start snaps to the nearest 5 and is clipped to 0 to 80. It is a read unless the Write chip is on. The k-th write stores x = k (the largest value so far plus one).
  - A lane never holds two overlapping bars. A tap that would overlap is refused: "A client does one thing at a time".
  - At most six operations. Tap a bar once to select it and again to remove it.
  - Each read shows a "may return" chip: the values of the writes that overlap it, the values of the finished writes that no later finished write hides, and the starting value 0 only when no write finished before it.
- **Check points (preset):** Ada and Ben overlap; Ada before Cam; Ben before Cam; "3 operations, 1 pair overlaps". Ben may return 0 or 1; Cam may return only 1.
- **Inputs:** tap a lane (a keyboard press on a lane adds a bar at the first free slot), tap a bar, the read/write chips in the picture. One control outside the picture: Reset. One hint line.
- **Verdicts:** "N operations, M pairs overlap"; refused: "A client does one thing at a time"; sixth bar: "Six operations is the most"; selected bar: "Tap the bar again to remove it".
- **Accessibility:** every lane and bar is a real `role="button"` with a label that gives the client, the operation and its start and end; the chips are a radio group; the SVG has a title and a description listing every operation and what each read may return.
- **Sources:** [S47] Herlihy and Wing, operations with an invocation and a response.
