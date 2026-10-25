# Canvas spec: product-m2-squint-test

- **Course and chapter:** product-sense, 2.2 "One thing first: visual hierarchy", the playable beat.
- **Renderer:** custom, on the reusable specimen compare beat with the `blur` option (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the squint test is something you do to a screen, so the learner must be able to blur one and compare it with a fix.
- **Claim:** When every line has the same size and weight, nothing comes first, and squinting shows it as an even smear. When the important thing is larger and bolder and the main action is the only filled button, those two shapes survive the blur.
- **Model:** four versions of Halaqa's Find a group screen. As built: five bold lines at 14 (the app name and four lines about a group) and three identical outlined buttons at 14, plus a row of feature pills. Fixed: the group's name at 22 bold, time and place at 16 in grey, seats at 16 semibold, one filled Join button, small quiet actions at 13. Squint 1 and Squint 2 are the same two screens with the blur on. Verdicts: "Same size, same weight" (bad), "Nothing stands out" (bad), "One group first, then Join" (good), "Two clear shapes survive" (good). The fixed screen has no app bar and uses exactly three text sizes: 22, 16 and 13 (the Join label is 16).
- **Inputs:** four pills (As built, Squint 1, Fixed, Squint 2).
- **What changes:** the screen, whether it is blurred, and the verdict.
- **What the learner should notice:** the blur takes away the words and leaves size, weight and contrast. The first screen leaves an even smear; the second leaves the title and the button.
- **Accessibility:** the pills form a labelled group; a polite live region reads each version, its description and verdict; the SVG has a title; text at least 11 units. The blur is a visual aid only: the alt text describes what the screen contains.
- **Limits (fold):** a blur shows size, weight and contrast, not meaning; the blur is drawn, not your eyes; Halaqa is fictional.
- **Sources:** NN/g on visual hierarchy and the squint test [A69].
