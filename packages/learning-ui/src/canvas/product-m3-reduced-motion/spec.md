# Canvas spec: product-m3-reduced-motion

- **Course and chapter:** product-sense, 3.5 "Motion with a reason", beat 3.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data, using the block `motion` field. Reason: the claim is about what is left when the motion is gone, so the learner compares a page that depends on a pulse with one that says the change in words. It replaces a three-box diagram of the setting.
- **Claim:** Reduced motion asks for less movement, not less information. The page should drop the movement and keep the news, in words or with a gentler cue [A43, A6].
- **Model:** Halaqa's group page ("Data structures, exam Thursday", Tonight 8 pm, library room 2) just after Join is tapped. Pulse only: a green tick tile pulses and nothing else says that the join worked. In words: the tick is still, with "You joined" and "1 seat left" beside it (the canon seat count drops from 2 to 1 after a join).
- **Versions:** "Pulse only" (warn: "Only a pulse says it worked"), "In words" (good: "Words say it worked").
- **Inputs:** the two-way switch under the picture; the first version shown is Pulse only.
- **What changes:** the tick, the words and the verdict banner.
- **What the learner should notice:** switch off the pulse in your mind and the first page says nothing. The second page does not need the pulse.
- **Accessibility:** the switch is a real two-button group; a polite live region reads the version, its screen description and the verdict; the pulse is off under `prefers-reduced-motion`, so a reader who asked for less motion sees a still tick on both pages; text at least 11 units.
- **Limits (fold):** a reader who asked for reduced motion sees no pulse on either screen. The first screen is drawn to show what would be left. Halaqa is fictional.
- **Sources:** MDN on `prefers-reduced-motion` [A43]; WCAG 2.3.3 (AAA) [A6].
