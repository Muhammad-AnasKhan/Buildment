# Canvas spec: product-m2-signals

- **Course and chapter:** product-sense, 2.2 "One thing first: visual hierarchy", the first beat.
- **Renderer:** custom, on the reusable specimen ladder (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is that signals add up, which a learner sees best when one signal is added at a time to a real screen. It replaces a diagram of five boxes that only listed the signals.
- **Claim:** A part comes first when several signals point at it: size, weight, contrast, position and grouping. One signal alone is a hint. Several together decide the order.
- **Model:** six versions of one Halaqa group page (four lines: the group's name, when and where, seats left, one sentence about the group). Step 0 has no signal: every line is 14, regular, normal colour, and the name is the second line. Step 1 makes the name 22. Step 2 makes it bold. Step 3 sets the other three lines in grey. Step 4 moves the name to the top. Step 5 puts 24 of space below the name and 4 between the three details, so the details group together. Verdicts: "None: all lines equal" (bad), "Size: a first hint" (warn), "Weight: a stronger hint" (warn), "Contrast: the rest is grey" (good), "Position: it is read first" (good), "Grouping: a clear order" (good).
- **Inputs:** drag anywhere across the picture, or use the arrow keys on the slider; six stops.
- **What changes:** one signal per step, the screen and the verdict. The words are the same.
- **What the learner should notice:** each step helps a little, and the order is clear only when several signals point at the same thing.
- **Accessibility:** the wrapper is a real slider with a value text ("Contrast added"); a polite live region reads the verdict; the SVG has a title with the screen's description; text at least 14 units.
- **Limits (fold):** the five signals are a guideline from experts, not a measured recipe; weight and position are common practice added by the course; the sizes are drawn units; Halaqa is fictional.
- **Sources:** NN/g on visual hierarchy: scale, contrast and grouping [A69].
