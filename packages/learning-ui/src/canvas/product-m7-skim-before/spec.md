# Canvas spec: product-m7-skim-before

- **Course and chapter:** product-sense, 7.3 "A case study page that passes the skim", the first playable beat. Its pair is `product-m7-skim-after`.
- **Renderer:** custom, on the reusable specimen skim (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about what a person gets from a page in a short time, which only a timed look can show.
- **Claim:** A case study that starts with the author's story and hides the result below the first screen fails a ten-second skim, even when the result is on the page.
- **Model:** the first screen of Maryam's first case study for Halaqa, in a browser frame: a greeting ("Hi, I am Maryam"), two paragraphs about her and the app (14 features), a line about the page, a divider and a "Next: the tech stack, my tools and my process" line. The result is in the last section, below this screen. The learner starts a 10-second look, then answers "What was the first thing the page told you?" with one of four options.
- **Inputs:** a Start button, then one of four answers.
- **What changes:** the page is shown for 10 seconds with a shrinking bar, hidden, then the answer is graded. Right: "Who Maryam is and what she built". The three other options explain what the page did not say.
- **What the learner should notice:** the page is honest and well written, and it still tells a stranger nothing about whether the redesign worked. Reading faster would not help; the page chose to say the wrong thing first.
- **Accessibility:** a real Start button; the answers are real buttons; the hint region reads the explanation after an answer; the page is hidden from the picture title while covered; text at least 12 units.
- **Limits (fold):** the picture shows only the first screen, because that is what a skimmer sees. A reader may scroll. Maryam and Halaqa are fictional. Ten seconds is the course's target, not a measured fact about reviewers.
- **Sources:** users often leave a page in 10 to 20 seconds unless the value is clear [B58]; 57% of viewing time is above the fold [B59]; reviewers are often not designers [B61]; the 10-second skim is the course's own test.
