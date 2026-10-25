# Canvas spec: product-m1-two-jobs

- **Course and chapter:** product-sense, 1.3 "The job people hire your app for", the playable compare beat.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is that the same app takes a different shape for a different job, and only a screen can show a shape. Three versions show as pills.
- **Claim:** A job is the progress a person wants in a situation. The job decides what comes first on the home screen. The same fourteen features can be arranged for "find a group tonight before an exam" or for "keep a weekly study habit". Without a job, the screen offers fourteen things and puts none first.
- **Model:** three phone screens of Halaqa's home. "As built": the fourteen features as same-size pills. "Tonight": a heading, two study groups with time, place, seats left and a Join button each (the same groups as in `product-m2-spacing-groups`). "Weekly": a week of days with three finished, a progress bar "Sessions this week", a streak line and the next session.
- **Inputs:** three pills labelled "As built", "Tonight" and "Weekly".
- **What changes:** the screen and the verdict banner: "Fits no job: nothing first" (bad), "Fits: find a group tonight" (good), "Fits: keep a weekly habit" (good).
- **What the learner should notice:** both shaped screens are good, for different people in different situations. Neither is the as-built screen with a new colour. The streak and the calendar belong to one job; the seats left and the Join button belong to the other.
- **Accessibility:** the pills are real buttons with a group label; a polite live region reads the screen description and the verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** a real app can serve several jobs one after another. A screen can put only one thing first. Halaqa is fictional and the screens are sketches, not finished designs.
- **Sources:** the job as progress in a circumstance, from the Christensen Institute page on Jobs to Be Done [A29]; the "When I, I want, so that" sentence is the course's own template.
