# Canvas spec: sysdesign-m10-drift-sync

- **Course and chapter:** system-design, 10.2 ("Physical clocks lie"), beat 4 "Drag the drift and the sync interval". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`, two `RailSlider` rails drawn inside the picture, `DotGrid`, `VerdictBanner`, the beat clock for the sweep.
- **Claim:** Two clocks that drift in opposite directions and are synced every T seconds are at most 2 x drift x T apart; while that gap is above the gap between two writes (1 ms), the later write can get the smaller timestamp.
- **Model** (`models/drift-sync.ts`): node A runs d ppm fast, node B d ppm slow, both exactly right at each sync. The gap t seconds after a sync is 2 x d x t microseconds. Largest gap = 2 d T / 1000 ms. The gap passes 1 ms after 500 / d seconds. Share of each cycle above 1 ms = max(0, 1 - (500 / d) / T).
- **Inputs:** drift 1, 5, 10, 20, 50, 100 ppm and sync every 1 s, 10 s, 1 min, 10 min, 1 h, 1 day, both snap points on log rails. Defaults 50 ppm and 1 min.
- **Worked values (d = 50 ppm):** 1 s: 0.1 ms, 0%. 10 s: 1 ms, 0% (only touches). 1 min: 6 ms, 83%. 10 min: 60 ms, 98%. 1 h: 360 ms, 99.7%. 1 day: 8.64 s, 99.99%. d = 10 ppm at 1 min: 17%. d = 1 ppm at 10 min: 17%.
- **Picture:** a sawtooth of the gap over three sync cycles (the top of the chart is the largest gap, so the 1 ms line moves), the part above the dashed 1 ms line filled red, and a cursor sweeping across the cycles with two write tags (1 ms apart). The tags show the order the stamps give; they swap and turn red when the cursor is in the red part.
- **Verdicts:** largest gap 1 ms or less "Safe: the gap never passes 1 ms"; a day with drift above 5 ppm "A day: wrong almost all the time"; otherwise "Flips after N s: P% of each cycle". P is cut at one decimal place from 99%, so it never rounds up to 100.
- **Motion:** the sweep takes 7 s a loop and pauses while a rail is held. Under reduced motion the cursor rests inside the red part of the second tooth (or the middle of it if there is none).
- **Accessibility:** each rail is a `role="slider"` with value text naming the drift or interval and the verdict; the SVG description gives the largest gap.
- **Sources:** [S52] 1 ppm is 86 ms a day, most clocks within 50 ppm; [S64] NTP error on a quiet network within 1 ms (left out of the model, said in the limits fold).
