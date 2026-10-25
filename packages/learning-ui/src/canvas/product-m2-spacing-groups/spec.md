# Canvas spec: product-m2-spacing-groups

- **Course and chapter:** product-sense, 2.4 "Space does the grouping", the playable beat.
- **Renderer:** custom, on the reusable specimen ladder (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about a screen, so the picture must be a screen the learner changes, not a diagram about one.
- **Claim:** People read things that sit close together as one group. When the space inside a group is smaller than the space between groups, the groups appear; when the two are equal, the list blurs into lines; when the space between grows too large, the groups drift apart and a phone shows fewer of them.
- **Model:** five versions of Maryam's Halaqa list of study groups (three groups of three lines each). The space inside each group stays at 4 units; the space between groups is 4, 12, 24, 40 and 64 units, all multiples of 4. The screen grows taller as the space grows.
- **Inputs:** drag anywhere across the picture, or use the arrow keys on the slider; five stops.
- **What changes:** the screen's spacing and height, and the verdict: "Nine lines, no groups" (bad), "Groups start to show" (warn), "Each group reads as one" (good), "Clear, but fewer fit" (warn), "Groups drift apart" (bad).
- **What the learner should notice:** the grouping comes from the difference between the two spaces, not from any one number.
- **Accessibility:** the wrapper is a real slider with a value text ("24 between groups, 4 inside"); a polite live region reads the verdict; the SVG has a title with the screen's description; text at least 11 units.
- **Limits (fold):** real screens group with lines, cards and type size too; the amounts are viewBox units, not pixels; Halaqa is fictional.
- **Sources:** law of proximity in NN/g form guidance [A64]; Material 3 on spacing and grouping [A90].
