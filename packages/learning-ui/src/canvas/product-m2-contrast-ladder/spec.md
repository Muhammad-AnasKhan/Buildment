# Canvas spec: product-m2-contrast-ladder

- **Course and chapter:** product-sense, 2.5 "Colour with a job, contrast you can measure", the playable beat.
- **Renderer:** custom, on the reusable specimen ladder, with a screen on `background: "paper"` and literal text colours (`models/ui-specimen.ts`). This folder holds only data. Reason: contrast is a number that depends on exact colours, so the page must be white in both themes and the colours must not change with the theme (decision log, 2026-10-25).
- **Claim:** Light grey text that looks fine to the designer can fail the AA bar for normal text. Grey #999999 on white is 2.85 to 1. #777777 is 4.48 to 1 and fails by a hair. #767676 is 4.54 to 1 and passes. Darker greys pass with room.
- **Model:** a Halaqa group card on a white page: a title in #111111 (18.88 to 1), then a description (15), a time (13) and a seats line (13, semibold) in the grey under test. Five steps: #999999, #777777, #767676, #595959, #000000. The ratios, from `contrastRatio()` against #ffffff: 2.85, 4.48, 4.54, 7.00 and 21. Verdicts: "2.85:1 fails 4.5 and 3" (bad), "4.48:1 fails by a hair" (bad), "4.54:1 passes AA" (good), "7.00:1 passes with room" (good), "21:1 the highest possible" (good). The text is 13 to 15 units, which is not "large text", so 4.5 to 1 is the bar.
- **Inputs:** drag across the picture, or use the arrow keys on the slider; five stops.
- **What changes:** the grey of the secondary text, the ratio in the slider's value text and the verdict.
- **What the learner should notice:** the step from #777777 to #767676 looks like nothing and flips a fail to a pass; the number, not the eye, decides.
- **Accessibility:** the wrapper is a real slider with a value text ("#767676, 4.54 to 1"); a polite live region reads the verdict; the SVG has a title with the screen's description; text at least 13 units. The ratio is also in words, so colour is not the only signal.
- **Limits (fold):** the page is white and the colours are exact, so the ratios hold in both themes; real screens have other backgrounds (the same #767676 on a light grey panel #F3F4F6 is 4.13 to 1); passing a ratio does not make a design good.
- **Sources:** WCAG 1.4.3 Contrast (Minimum), Level AA, with the contrast formula [A1, A17]; the course's arithmetic [A87].
