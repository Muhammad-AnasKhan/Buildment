# Canvas spec: product-m3-wait-ladder

- **Course and chapter:** product-sense, 3.2 "Empty, loading, error: the states nobody draws", beat 3.
- **Renderer:** custom, on the reusable specimen ladder (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the rule depends on how long the wait is, so the learner should move along the length and watch the right screen change.
- **Claim:** Under about a second, show nothing special. For about 2 to 10 seconds, show that something is happening. Over about 10 seconds, say how long it will take, and use a bar for uploads [A21, A24].
- **Model:** four waits on Halaqa's study groups screen. 0.4 seconds: the list simply appears. 3 seconds: a spinner with the words "Finding groups...". 12 seconds: a bar "Loading groups: 3 of 8" and a line "This takes about 12 seconds on a slow connection." 40 seconds: an upload of notes.pdf (6 MB) at 45% with "About 20 seconds left." (45% of 40 seconds is 18 seconds gone and 22 left, rounded to about 20.)
- **Versions:** all four are right for their length, so every verdict is good: "Show nothing special", "Show that it is working", "Say how long it will take", "Use a bar for uploads".
- **Inputs:** drag anywhere across the picture, or use the arrow keys on the slider; four stops.
- **What changes:** the screen grows or loses an indicator, and the verdict names the rule for that length.
- **What the learner should notice:** the right amount of feedback grows with the wait. A spinner at 0.4 seconds would only flash.
- **Accessibility:** the wrapper is a real slider with a value text ("Wait of 12 seconds"); a polite live region reads the verdict; text at least 11 units.
- **Limits (fold):** the limits are Nielsen's guidance and NN/g's advice, rules of thumb and not new measurements; the sources give no firm rule between 1 and 2 seconds; the numbers on the fictional screen are made up.
- **Sources:** Nielsen on response times [A21]; NN/g on skeleton screens, spinners and progress bars [A24].
