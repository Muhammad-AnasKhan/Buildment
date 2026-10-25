# Canvas spec: product-m2-label-gap

- **Course and chapter:** product-sense, 2.4 "Space does the grouping", the second beat (an extra canvas).
- **Renderer:** custom, on the reusable specimen compare beat. This folder holds only data. Reason: the claim is about which label belongs to which field, which is shown by distance and nothing else.
- **Claim:** A label should sit closer to its own field than to the field above it. With equal gaps, a label floats halfway between two fields and the reader has to think about which one it names.
- **Model:** Halaqa's create-group form (Course and Place fields, a Create group button). Even: 14 between a label and its field, and 14 between the field and the next label. Grouped: 4 between a label and its field, and 22 between a field and the next label. The words, sizes and fields are the same in both. Verdicts: "Labels float between fields" (bad), "A label stays with its field" (good).
- **Inputs:** two buttons (Even, Grouped).
- **What changes:** the space around the labels and the verdict.
- **What the learner should notice:** nothing but space changed.
- **Accessibility:** the two buttons form a labelled group; a polite live region reads each version and verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** space is one signal among several: a label is also bold and lines up with its field; the gaps are drawn units, not pixels; Halaqa is fictional.
- **Sources:** NN/g on form labels, proximity and grouping [A64]; Material 3 on spacing that groups related content [A90].
