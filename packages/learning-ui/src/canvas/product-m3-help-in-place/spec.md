# Canvas spec: product-m3-help-in-place

- **Course and chapter:** product-sense, 3.6 "The first run and the moment it clicks", beat 3.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: where help sits is a matter of place, so the learner compares three places for the same help. It replaces a three-box diagram of help in place.
- **Claim:** Help works best when it appears at the moment the person needs it, next to the one control it explains, short and easy to ignore. A pop-up over the content blocks what it explains. The same hint repeated everywhere becomes noise [A62, A22].
- **Model:** Halaqa's first screen with the same help in three places. Pop-up: a bordered card "How Halaqa works" with four short facts and a Got it button, drawn above the first group so the list sits below it. Everywhere: the hint "Tap Join to hold a seat. You can leave any time." under the Join button of every group. Beside it: the same hint under the first group's Join button only.
- **Versions:** "Pop-up" (bad: "Blocks the groups it explains"), "Everywhere" (warn: "Repeated until it is noise"), "Beside it" (good: "One hint, at the control").
- **Inputs:** three pills under the picture; the first version shown is Pop-up.
- **What changes:** the screen and the verdict banner.
- **What the learner should notice:** the hint is the same sentence in all three. Only its place changes how much it helps.
- **Accessibility:** the pills are a real button group; a polite live region reads the version, its screen description and the verdict; the hint is plain visible text, so it needs no hover; text at least 11 units.
- **Limits (fold):** NN/g's advice is expert guidance with no sample sizes, so it is a heuristic. The best place depends on the product. Halaqa is fictional.
- **Sources:** NN/g on onboarding tutorials and help that appears when it is needed [A62]; NN/g on empty states [A22].
