# Canvas spec: sysdesign-truetime-bug

- **Course and chapter:** system-design, 10.6 beat 4 ("The bug: Bob sees a photo he should not").
- **Renderer:** `scene` (data only), built by `buildTrueTimeScene(4, false)` in `models/truetime-scene.ts` from the tested TrueTime model.
- **Claim:** When two commits on different servers are closer together than their clocks disagree, the later commit can get the earlier timestamp, and a snapshot read between them shows an impossible state.
- **Story:** Alice sends "unfriend Bob" to A, which stamps s1 = 27.6; A says done at once; Alice posts the photo to B, which stamps s2 = 22.4; Bob reads at the midpoint (25 ms) and sees the photo. Verdict: "Photo stamped before the unfriend". Loops; Replay restarts; reduced motion shows the verdict frame.
- **Predict before it (in the chapter):** "Epsilon is 4 ms. Server A's clock is 3.6 ms fast and server B's is 3.6 ms slow. Alice posts the photo 2 ms after she sees done. Which commit gets the larger timestamp?"
- **Sources:** the TrueTime model (`models/truetime.ts`). The Alice and Bob story is a course example, not from the Spanner paper.
