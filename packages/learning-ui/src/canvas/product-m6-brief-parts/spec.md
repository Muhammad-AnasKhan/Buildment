# Canvas spec: product-m6-brief-parts

- **Course and chapter:** product-sense, 6.2 "Design skills and agents that build screens", beat 2.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, two versions shown as a switch). This folder holds only data. Reason: the learner should see the five places a tool must guess, filled or empty, instead of reading a list of them.
- **Claim:** A short prompt leaves five places for the tool to guess: who it is for and where, the real content, the type and one colour, the sections and the one main action, and a reference. A brief puts a fact in each place [B2, B5, B8]. The five parts are the course's own template.
- **Model:** one page of five boxed slots under a prompt line. One line: every slot holds a "The tool guesses" pill (warn). Five parts: every slot holds a short fact for Halaqa (fictional): a student on a phone the night before an exam; three real groups with times and seats left; one font with body text at 16 px and one accent on Join only; one list with Join as the main action; a bus timetable as the reference.
- **Versions:** One line, Five parts. Verdicts: "5 places the tool guesses" (bad), "Each place has a fact" (good).
- **Inputs:** tap the switch (or Tab and Enter).
- **What changes:** the five slots swap between a guess pill and a fact, and the verdict changes.
- **What the learner should notice:** the brief is not longer for its own sake. Each line fills a place where a guess would have gone to the most common choice. The facts in the slots are things only the maker knows.
- **Accessibility:** each version has a one-sentence alt; a polite live region reads the version, the alt and the verdict; the switch buttons are real buttons.
- **Limits (fold):** the five parts are a course template, not a tested recipe; real tools vary from run to run. Halaqa is fictional.
- **Sources:** Anthropic's cookbook and frontend-design skill [B2, B3]; OpenAI's frontend guidance [B5]; NN/g on AI prototyping tools [B8].
