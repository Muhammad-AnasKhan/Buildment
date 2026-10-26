# Canvas spec: product-m1-last-time

- **Course and chapter:** product-sense, 1.2 "Start from the problem, not the feature", beat 2 (after the predict), the two questions.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about what an answer gives you, and a page of notes with the question, the answer and what Maryam can use shows that side by side in two taps.
- **Claim:** A question about next time ("Would you use voice rooms?") gets a polite yes, and a yes costs nothing. A question about the last time ("When did you last fail to join a group?") gets a story with a day, a place and what the person tried. This is the course's own habit, not a research finding.
- **Model:** two phone screens of Maryam's notes. "Next time": the question, Adel's answer "Yes, maybe. Sounds good.", and the line "A polite yes. No day, no place, no attempt." "Last time": the question, Adel's answer (Tuesday, the Statistics group was online, no way to join the call, he gave up) and the line "A day, a place and what he tried."
- **Inputs:** a two-way switch with the labels "Next time" and "Last time".
- **What changes:** the notes and the verdict banner: "A polite yes, no facts" (warn) and "A story that happened" (good).
- **What the learner should notice:** the first answer cannot point at a fix. The second names the moment, the place and the attempt, which is what the next beat turns into a smaller fix than voice rooms.
- **Accessibility:** the switch is a pair of real buttons with a group label; a polite live region reads the screen description and the verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** Adel, Maryam and Halaqa are fictional. One story is a start, not proof; chapter 1.2 ends with that point.
- **Sources:** none beyond the course case. Asking about the last time is the course's own habit; Shape Up, chapter 3, narrows the problem before choosing a solution [A27].
