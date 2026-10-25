# Canvas spec: product-m6-scene

- **Course and chapter:** product-sense, 6.1 "Set the scene: three AIs, three opinions", beat 1.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, four versions shown as pills). This folder holds only data. Reason: the learner should see, by switching, that three critiques of one screen would make three different screens.
- **Claim:** Three AI critiques of the same screen can pull in different directions at once. One cuts fields, one changes the size and colour of hint text, one adds a glow and renames the button. Nothing in the picture says which is right, and that is the chapter's question.
- **Model:** one phone screen of Halaqa's create-group form (fictional): a "New group" title, four labelled fields (Course, When, Where with a hint, Seats) and a "Create group" button. Three more versions, one per invented critique: AI 1 keeps two fields; AI 2 shows the hint under Where in darker, larger text; AI 3 adds a purple glow header and a glowing "Get started" button.
- **Versions:** Now, AI 1, AI 2, AI 3 (button labels at most 4 characters). All four verdicts use the neutral tone on purpose.
- **Inputs:** tap a version pill (or Tab and Enter).
- **What changes:** the screen, and a one-line verdict at the top ("Now: four fields", "AI 1: two fields only", "AI 2: darker, larger hint", "AI 3: glow, Get started").
- **What the learner should notice:** the three fixes cannot all be applied. AI 1 removes the Where field that AI 2 wants to change, and AI 3 changes the button that the others leave alone. Each version looks plausible; none comes with a reason.
- **Accessibility:** each version has a one-sentence alt and a polite live region that reads the version, the alt and the verdict; the pills are real buttons. The purple glow is drawn on purpose, as the thing AI 3 suggests (decision log, 2026-10-25).
- **Limits (fold):** the critiques are invented for the case, not output from a real tool. Halaqa is fictional.
- **Sources:** none needed for the picture; the chapter's case is the course's own.
