# Canvas spec: product-m1-the-cheaper-fix

- **Course and chapter:** product-sense, 1.2 "Start from the problem, not the feature", beat 3, after the two questions: the small fix under "add voice rooms".
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about a screen, so the learner should see the screen before and after the fix, not read about it.
- **Claim:** The request "add voice rooms" hid a smaller problem: Adel could not tell how to join an online group. Once the problem is named, a much smaller fix can answer it. This is the same move as in the Shape Up example, where a request for complex permission rules became a warning on one action.
- **Model:** two phone screens of one online study group (Statistics 101 revision, tomorrow 5 pm, 4 seats left). "Before": the group is marked Online and has a Join group button, but no way to reach the call. "After": the group's creator added a call link, and a Join call button shows.
- **Inputs:** a two-way switch with the labels "Before" and "After".
- **What changes:** the screen and the verdict banner: "Online, but no way to join" (bad) and "A call link, one button" (good).
- **What the learner should notice:** the fix is one field for the creator and one button for the student. It answers Adel's problem without building a voice room.
- **Accessibility:** the switch is a pair of real buttons with a group label; a polite live region reads the screen description and the verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** the fix is one possible answer. A real check could show that students also need something that a call link does not give. Halaqa and the group are fictional.
- **Sources:** Shape Up, chapter 3 [A27]. The course's habit of asking about the last time it happened is its own.
