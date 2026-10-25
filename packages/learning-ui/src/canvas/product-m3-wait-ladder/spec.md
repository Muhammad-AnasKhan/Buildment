# Canvas spec: product-m3-wait-ladder

- **Course and chapter:** product-sense, 3.2 "Empty, loading, error: the states nobody draws", beat 2.
- **Renderer:** custom, on the reusable specimen ladder (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the rule depends on how long the wait is, so the learner should move along the length and watch both columns change.
- **Claim:** Under about a second, show nothing special. For about 2 to 10 seconds, show that something is happening. Over about 10 seconds, say how long it will take, and use a bar for uploads [A21, A24]. A slider whose every stop is right teaches nothing by contrast, so each stop draws the indicator that does not fit beside the one that does.
- **Model:** four waits on Halaqa's study groups screen, each drawn as two columns on a screen with no frame. Left, tagged "Not this": the indicator that does not fit. Right, tagged "This": the indicator that does. 0.4 seconds: a spinner that only flashes, against the list appearing at once. 3 seconds: a blank area, against a spinner with "Finding groups...". 12 seconds: a spinner with no words, against a bar "Loaded 3 of 8 groups" and "About 12 seconds on a slow connection." 40 seconds: a spinner "Uploading...", against a bar "Uploading: 45%" and "About 20 seconds left." (45% of 40 seconds is 18 seconds gone and 22 left, rounded to about 20.)
- **Versions (verdicts, all about the left column):** "A spinner here only flashes" (warn), "A blank leaves people guessing" (bad), "A bare spinner hides the time" (bad), "An upload needs a bar" (warn).
- **Inputs:** drag anywhere across the picture, or use the arrow keys on the slider; four stops.
- **What changes:** both columns and the verdict.
- **What the learner should notice:** the right amount of feedback grows with the wait, and each wrong choice is a real thing that apps ship. A spinner at 0.4 seconds only flashes. A bare spinner at 12 seconds is a blank in motion.
- **Accessibility:** the wrapper is a real slider with a value text ("Wait of 12 seconds"); a polite live region reads the verdict; text at least 11 units; the tag pills carry the words "Not this" and "This", so colour is not the only cue.
- **Limits (fold):** the limits are Nielsen's guidance and NN/g's advice, practical guides and not new measurements. The sources give no firm rule between 1 and 2 seconds. The numbers on the fictional screen are made up.
- **Sources:** Nielsen on response times [A21]; NN/g on skeleton screens, spinners and progress bars [A24].
