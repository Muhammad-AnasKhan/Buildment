# Canvas spec: product-m4-five-testers

- **Course and chapter:** product-sense, 4.5 "Popular rules that fail a check", beat 3 ("Testers overlap, so each adds less").
- **Renderer:** custom, on the reusable specimen ladder (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about a curve that flattens, which the learner feels by dragging along it; a progress bar on a small screen carries the number.
- **Claim:** Testers meet many of the same problems, so each new tester adds less than the one before. In the five-user model, one tester finds about 31 percent of one user group's problems and five find about 84 percent (the article rounds this to 85). That is why the advice is to fix what you find and test again with new people, and why "five users find all the problems" is a misreading.
- **Model:** the formula 1 - (1 - L)^n with L = 0.31 [A20]. Stops: 1 tester 31 percent, 2 testers 52, 3 testers 67, 5 testers 84, 8 testers 95, 12 testers 99 (computed 31.0, 52.4, 67.1, 84.4, 94.9, 98.8). The screen shows the number, a progress bar and one short note.
- **Inputs:** drag anywhere across the picture, or use the arrow keys on the slider; six stops.
- **What changes:** the share found and the note. Verdicts: "Finds about a third", "Less than double", "Each one adds less", "Five: most big problems", "Few new problems appear", "Mostly repeats now".
- **What the learner should notice:** two testers do not find twice as much as one; after five the bar barely moves; no number of testers reaches every problem of every group.
- **Accessibility:** the wrapper is a real slider with a value text ("5 testers, about 84 percent found"); a polite live region reads the verdict; the SVG has a title with the screen's description; text at least 11 units.
- **Limits (in the data):** the model is not a measurement of any one page; L = 31 percent comes from the authors' projects; it covers one user group; it finds problems and does not prove a design is good.
- **Sources:** Nielsen, "Why You Only Need to Test with 5 Users", NN/g [A20].
