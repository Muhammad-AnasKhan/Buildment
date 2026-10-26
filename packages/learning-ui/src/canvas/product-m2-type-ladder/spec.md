# Canvas spec: product-m2-type-ladder

- **Course and chapter:** product-sense, 2.3 "Type that reads on a phone", the playable beat.
- **Renderer:** custom, on the reusable specimen ladder (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about how a size feels on a small screen, so the learner must drag the size and see the page change.
- **Claim:** Body text that is too small strains the reader. About 16 with a line height of 1.5 reads well. Very large body text leaves only a few words on each line of a phone and pushes the rest of the page down.
- **Model:** one Halaqa group page (a back bar, the title at 20 bold, a description, the time at 13, a Join button) with the description at 11, 13, 16, 20 and 26 drawn units and a line height of 1.5 at every step. The description has 18 words. It takes 2, 3, 4, 5 and 5 lines at the five sizes; the page is 280, 305, 341, 394 and 438 units tall. Verdicts: "Too small: it strains" (bad), "Small: under the 16 start" (warn), "Reads well" (good), "Still reads, longer page" (good), "Too large: few words a line" (bad).
- **Inputs:** drag across the picture, or use the arrow keys on the slider; five stops.
- **What changes:** the size of the description, the height of the page and the verdict.
- **What the learner should notice:** 16 is a start, not a rule: 20 still reads; the trouble at the two ends is different (strain at the small end, a long page and few words a line at the large end).
- **Accessibility:** the wrapper is a real slider with a value text ("Body text 16"); a polite live region reads the verdict; the SVG has a title with the screen's description; text at least 11 units.
- **Limits (fold):** sizes are drawn units, close to but not the same as pixels on a phone; the line height stays at 1.5; the sources' numbers are for Latin letters, and for Arabic the course asks for a check by a native reader on a real phone; Halaqa is fictional.
- **Sources:** Tailwind default body size and line height [A50]; Material 3 line height [A36]; Apple HIG default and minimum text size [A37]; one typography guide's body size range [A32].
