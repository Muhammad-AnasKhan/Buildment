# Canvas spec: sysdesign-m17-slo-window

- **Course and chapter:** system-design, 17.3 ("SLIs, SLOs and SLAs"), beat 4, "Pick a target and a window". Playable; new slug.
- **Renderer:** custom beat canvas on `BeatFrame`: the window is a radio group of four `SvgRadioChip`s inside the picture, the target is a `SnapStopsRail` (a real `role="slider"` on a rail drawn in the picture), `DotGrid`, `VerdictBanner`. `year-strip` was not used: it draws 365 day squares, and the window here is one bar split into 7 to 90 days.
- **Claim:** The same percentage means a very different number of bad minutes depending on the window, and each extra nine cuts the allowance ten times.
- **Input:** target 99%, 99.5%, 99.9%, 99.95%, 99.99% (default 99.9%; arrow keys, Home and End step the snaps); window 7, 28, 30 or 90 days (default 30).
- **Model** (`model.ts`): allowed bad minutes = (1 - target) x days x 1,440; bad requests per million = (1 - target) x 1,000,000. The probe is a 25 minute bad deploy.
- **Numbers to check** (tested, same as the chapter table): 99.9% over 30 days is 43.2 min and 1,000 per million; 99% is 100.8, 403.2, 432, 1,296 min; 99.5% is 50.4, 201.6, 216, 648; 99.95% is 5.0, 20.2, 21.6, 64.8; 99.99% is 1.0, 4.0, 4.3, 13.0.
- **Number format (a change to the first spec):** the spec said one decimal under 100 and whole minutes from 100, but the chapter table prints 100.8, 129.6, 403.2 and 201.6. The canvas follows the table: one decimal under 100, and from 100 up one decimal only when there is a fraction (216, 648, 1,296 stay whole).
- **Picture:** the window as one bar split into days with the allowed bad time as an amber sliver at its right end (at least 3 units wide, its width follows 1 - target); two number cards (bad minutes allowed, bad requests per million); under them two bars on one minute scale, the allowance and the 25 minute bad deploy. The longer of the two fills the row, so a deploy that fits is a shorter bar and one that does not has a red overflow.
- **Verdicts:** allowance of 25 min or more: "A 25 min outage leaves 18 min" (leftover rounded; good when the leftover is at least half the allowance, else warn); under 25: "A 25 min outage busts the budget" (bad).
- **Reduced motion:** the sliver and bars are drawn in place (the width transition is off).
- **Accessibility:** the rail is a slider ("target 99.9 percent, 43.2 bad minutes in 30 days"); the chips are a radio group; the verdict and the slider text are in a polite live region.
- **Sources:** chapter 2.6 for nines to downtime; error budget [S96]; SLO as "a target value or range of values" [S95]. The 25 minute probe is a course number.
