# Canvas spec: sysdesign-m10-vector-compare

- **Course and chapter:** system-design, 10.4 ("Vector clocks"), beat 3 "Pick two events and compare". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`, `DotGrid`, `VerdictBanner`. The events are buttons on three lanes; the compare cards show the two vectors side by side.
- **Claim:** Comparing two vectors slot by slot says whether one event happened before the other or the two are concurrent.
- **Model** (`models/vector-compare.ts`): nine events A1, A2, B1, B2, C1, B3, C2, C3, A3 with vectors [1,0,0], [2,0,0], [0,1,0], [2,2,0], [0,0,1], [2,3,0], [2,3,2], [2,3,3], [3,3,3]. x before y when every slot of x is at most that of y and they differ; concurrent when each is bigger in some slot (`compareVectors` from the sim clocks).
- **Worked values:** 36 pairs, 29 ordered and 7 concurrent (A1-B1, A1-C1, A2-B1, A2-C1, B1-C1, B2-C1, B3-C1). A2 before B2; B2 before C2; A3 after C3; A1 before A3.
- **Inputs:** tap one event, then a second; a third tap starts again; tapping the first event again clears it. Arrow keys move between the events (focus), Enter and Space pick.
- **Picture:** the deciding slots are ringed (ordered pair: the first slot where the earlier event is smaller, on both cards; concurrent pair: one slot where each leads, one ring on each card). For an ordered pair the chain of message and same-node steps that joins the two events glows. A pill counts the concurrent pairs found, out of 7.
- **Verdicts:** "A2 happened before B2" and "A3 happened after C3" (in tap order), "Concurrent: each leads in one slot", and "All 7 concurrent pairs found" on the pair that completes the set.
- **Accessibility:** every event is a `role="button"` with `aria-pressed`, its vector and what happens in its label.
- **Sources:** [S45], [S52].
