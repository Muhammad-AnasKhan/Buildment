# Canvas spec: product-m2-label-gap

- **Course and chapter:** product-sense, 2.4 "Space does the grouping", the second beat (an extra canvas).
- **Renderer:** custom, on the reusable specimen compare beat. This folder holds only data. Reason: proximity is easier to believe when the learner sees a label float between two fields and then settle next to its own.
- **Claim:** The space between things decides which belong together. A label closer to its own field than to the field above is read as that field's label; with equal gaps it floats between two fields.
- **Model:** Halaqa's Start a group form with the four fields in the course's order: Course, When, Where, Seats, and the button "Start the group". Each label is a semibold line above its own field. Even: 12 between a label and its field, and 12 between a field and the next label. Grouped: 4 between a label and its field, and 24 between a field and the next label. All gaps are multiples of 4. Verdicts: "Labels float between fields" (bad), "A label stays with its field" (good).
- **Inputs:** two buttons (Even, Grouped).
- **What changes:** the gaps and the verdict. The words are the same.
- **What the learner should notice:** nothing changed but space, and the reader no longer has to think about which field a label names.
- **Accessibility:** the two buttons form a labelled group; a polite live region reads each version and its verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** space is one signal among several; the gaps are drawn units, not pixels; Halaqa is fictional.
- **Sources:** NN/g on labels close to their own fields and the law of proximity [A64]; Material 3 on spacing [A90].
