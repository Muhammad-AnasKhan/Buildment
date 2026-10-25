# Canvas spec: product-m3-colour-not-alone

- **Course and chapter:** product-sense, 3.4 "Everyone can use it: access and small screens", beat 3.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about what a screen conveys, so the picture must be two versions of the same list.
- **Claim:** If colour is the only way a screen says something (here, how many seats are left), people who cannot tell the colours apart, or who see the screen in sunlight or in grey, lose it. Add a word, a shape or an icon [A3, A7].
- **Model:** Halaqa's "Tonight's groups" with three groups: Data structures, Statistics 101 and Arabic literature. Version 1: a green, amber or red bar beside each name and no other words. Version 2: the same bars plus a pill that says "4 seats left", "1 seat left" or "Full".
- **Versions:** "Colour" (bad: "Colour alone says too little") and "With words" (good: "Words carry the meaning").
- **Inputs:** the two-way switch under the picture.
- **What changes:** the list and the verdict banner.
- **What the learner should notice:** in the first version the colours may mean seats left, how soon the group starts, or how popular it is. The words remove the guess.
- **Accessibility:** the switch is a real two-button group; a polite live region reads the version, its screen description and the verdict; text at least 11 units.
- **Limits (fold):** colour is still useful as an extra cue; the picture cannot show colour-blindness; the lesson is to add words, not to pick colours. Halaqa is fictional.
- **Sources:** WCAG 1.4.1 Use of Color, level A [A3]; WCAG 3.3.1 on errors and colour [A7].
