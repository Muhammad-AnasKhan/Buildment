# Canvas spec: sysdesign-m11-session-writes

- **Course and chapter:** system-design, 11.5, beat 3 "Writes can break too".
- **Renderer:** custom timeline canvas on `BeatFrame`, `use-beat-clock.ts`, `SvgNode` and `VerdictBanner`; model in `models/session-writes.ts`. Toggles are pressed `BeatButton`s (`BeatToggle` does not exist in `beat-frame.tsx`).
- **Claim:** Writes need order too. A write number keeps one user's edits in order. A dependency carried by a reply keeps an effect from showing before its cause.
- **Model:** two panels, one toggle each.
  - Panel 1, "Write numbers": Amna sends edit 1 (`name = Amna`) at 0 and edit 2 (`name = Amna K.`) at 10. The leader receives edit 2 at 20 and edit 1 at 35 (the spec's "delays 20 and 25" do not match those arrival times; the arrival times are what the picture uses). Off: applied in arrival order, name `Amna K.` after 20 and `Amna` after 35, "Her last edit was overwritten". On: edit 2 is held until edit 1 is applied at 35, final `Amna K.`, "Edits applied in her order".
  - Panel 2, "Dependencies": Omar read question 1 and replied at 10. The Replies copy has the reply at 30 ms; the Questions copy gets question 1 at 120 ms. Hana reads replies at 50 ms and questions at 60 ms. Off: the questions read goes to the Questions copy (position 0) and shows nothing, "Reply shown before its question". On: the reply carries `after question 1`, Hana needs questions >= 1, so her questions read goes to the leader (one leader read, longer arrow), "Question read from the leader".
- **Inputs:** two 44 px toggles outside the picture, "Write numbers" and "Dependencies" (both off). Hint: "Switch each promise on and compare."
- **What moves:** edit chips travel to the leader on two tracks and cross; the name field changes; a "holding edit 2" chip shows while it is held; the Replies, Questions and Leader strips fill at 30, 120 and 0 ms; Hana's two reads land in time order. A sweep loops; fades are CSS transitions; with reduced motion the final state shows.
- **Verdicts:** one per panel, as in the model section (each at most 31 characters).
- **Sources:** [S50] monotonic writes and writes-follow-reads; [S46] causal implies writes-follow-reads.
