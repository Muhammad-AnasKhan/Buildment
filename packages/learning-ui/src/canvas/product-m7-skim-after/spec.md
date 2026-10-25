# Canvas spec: product-m7-skim-after

- **Course and chapter:** product-sense, 7.3 "A case study page that passes the skim", the second playable beat. Its pair is `product-m7-skim-before`.
- **Renderer:** custom, on the reusable specimen skim (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the learner should feel the same ten seconds on the rewritten page and compare.
- **Claim:** A case study that puts the result, the job and the author's role in its first screen passes a ten-second skim.
- **Model:** the first screen of Maryam's rewritten case study for Halaqa, in a browser frame: the result as the biggest element ("4 of 5 classmates joined a study group in their first visit. Before: 2 of 5."), one sentence about the job, two tags (her role, her time: 12 hours over 2 weeks), a "Try it as a guest" button, a divider and a "Next: the problem, my choices and what I gave up" line. The learner starts a 10-second look, then answers the same question as in the old page: "What was the first thing the page told you?"
- **Inputs:** a Start button, then one of four answers.
- **What changes:** the page is shown for 10 seconds with a shrinking bar, hidden, then the answer is graded. Right: "That the redesign worked, with a number".
- **What the learner should notice:** the same question, the same four answers, a different right answer, because the page now says the result first. The job and the role fit in the same screen.
- **Accessibility:** a real Start button; the answers are real buttons; the hint region reads the explanation after an answer; text at least 12 units.
- **Limits (fold):** the number comes from a check with five classmates, which finds problems and does not prove the design is good. Maryam and Halaqa are fictional.
- **Sources:** the same as the old page [B58, B59, B61]; before and after needs a stated result and how much [B62]; the scaled-down check habit from module 1 [A20, A30].
