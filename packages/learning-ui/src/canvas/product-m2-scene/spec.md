# Canvas spec: product-m2-scene

- **Course and chapter:** product-sense, 2.1 "Set the scene: ten links, one morning", the opening picture.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the scene is three screens, and the reader should feel the problem by looking at them before any rule is named.
- **Claim:** Three project pages can all say true things and still differ in what a reviewer takes from a glance. On the first nothing comes first, on the second the person's name does, on the third (Laith's page, rebuilt a week later) the result does.
- **Model:** three phone screens (Fares, Yasmin, Laith, all fictional fellows). Fares: seven text lines in one size and weight. Yasmin: a very large name, then small grey lines. Laith (his page a week later, rebuilt so that the result comes first): a small label, a large result headline, a picture, one button and one small line. Verdicts: "Nothing comes first" (bad), "Her name comes first" (warn), "The result comes first" (good).
- **Inputs:** three buttons, one for each page.
- **What changes:** the screen and the verdict banner.
- **What the learner should notice:** the pages have the same kind of facts; what differs is which fact comes first. The chapter does not name a rule yet.
- **Accessibility:** the buttons form a labelled group ("Project page"); a polite live region reads the page's description and verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** three pages cannot show every failure; a glance is not a test; the people, apps and numbers are fictional.
- **Sources:** none needed: the picture sets up the problem. The rule it leads to is sourced in 2.2 [A69].
