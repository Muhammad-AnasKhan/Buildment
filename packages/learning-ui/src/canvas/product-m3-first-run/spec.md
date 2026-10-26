# Canvas spec: product-m3-first-run

- **Course and chapter:** product-sense, 3.6 "The first run and the moment it clicks", beat 1 (the playable beat).
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about what a new person can do on the first screen, so the picture must be three first screens.
- **Claim:** Show the person the valuable thing as soon as you can, and teach inside the screen, not before it. A tour before any value, and a blank first screen, both delay or hide the valuable moment [A62, A22].
- **Model:** three first screens of Halaqa for a student who has never opened it. Tour: "Step 1 of 4", "Welcome to Halaqa", a line about groups, chat, files, polls, voice rooms and more, and Skip and Next buttons. Empty: a "My groups" screen that says "Nothing here". Value: "Tonight at your university" with two groups, their times, places and seats left, one Join button, and the hint "Tap Join to hold a seat. You can leave any time."
- **Versions:** "Tour" (bad: "Four steps before any value"), "Empty" (bad: "Empty, and no way to start"), "Value" (good: "Value now, help in place").
- **Inputs:** three pills under the picture; the first version shown is Tour.
- **What changes:** the screen and the verdict banner.
- **What the learner should notice:** on the first two screens the student cannot do the thing Halaqa is for. On the third, the first tap does it, and the help sits next to the button it explains.
- **Accessibility:** the pills are a real button group; a polite live region reads the version, its screen description and the verdict; text at least 11 units.
- **Limits (fold):** tutorials can help with a novel interaction; NN/g's evidence is expert judgment with no reported sample sizes; the best first screen depends on the job. Halaqa is fictional.
- **Sources:** NN/g on tutorials and pull revelations [A62]; NN/g on empty states [A22].
