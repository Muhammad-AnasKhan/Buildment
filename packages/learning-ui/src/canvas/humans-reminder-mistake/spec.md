# Canvas spec: humans-reminder-mistake

- **Course and chapter:** build-with-ai (v2), 11.1 beat 1 ("A message that looked right in the test").
- **Renderer:** `scene` (data only; plays on its own and loops, with Replay).
- **Claim:** An AI-assisted mistake can pass the developer's own small test and still reach customers. The people who hear about it call the person who shipped it, not the assistant.
- **Story:** Jawad asks an AI assistant for reminder code and gets it back. He tests one visit on his laptop and it looks right. He deploys it to the reminder service, whose clock runs three hours behind. 230 texts go out and the patients' phones show 10:00 instead of 13:00. The clinic calls Jawad. The assistant is not on the call. Verdict: "Jawad answers, not the assistant".
- **Numbers:** 230 texts, three hours, 10:00 and 13:00. They match chapters 11.1 and 11.3 and the `own-the-incident` machine exactly. All are made up for a fictional booking service for nine small clinics.
- **Layout:** four actors on a 420 by 280 picture, two rows (y 110 and 228). Second lines are 15 characters or fewer, the verdict is under 38 characters, and every actor sits at least 44 units below the verdict banner.
- **Sources:** none beyond the course; the pattern (people answer) is the dossier's A56, A58 and A59, told in chapter 11.3.
- **Accessibility:** the reduced-motion frame is the final one, with the verdict; chapter 11.1 tells the same story in a fold.
