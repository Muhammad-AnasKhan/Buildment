# Canvas spec: product-m1-count-or-share

- **Course and chapter:** product-sense, 1.5 "Know if it worked", beat 3 (after the predict), the count and the share.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the surprise is that a larger count can sit beside a smaller share, and two stat screens side by side show both numbers at once.
- **Claim:** A raw count grows when more people come. A share asks how many of the people who tried succeeded. Use shares, written "x of y", or averages per person.
- **Model:** two phone screens with invented numbers for Halaqa. "Month 1": 10 students visited, 5 joined a group, "5 of 10: half of the visitors". "Month 2": 100 visited, 8 joined, "8 of 100: 8 in every 100". The count rose by 3; the share fell from half to 8 percent (a fall of 42 percentage points).
- **Inputs:** a two-way switch with the labels "Month 1" and "Month 2".
- **What changes:** the numbers and the verdict banner: "5 of 10 joined" (good) and "Count up, share down" (warn).
- **What the learner should notice:** joined went up from 5 to 8 and the share went down from half to 8 in 100, because the number of visitors grew faster than the number who joined.
- **Accessibility:** the switch is a pair of real buttons with a group label; a polite live region reads the screen description and the verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** the numbers are invented and are not Maryam's checks. A small group makes a share coarse: each of five people is 20 percentage points.
- **Sources:** Rodden, Hutchinson and Fu, CHI 2010, on ratios and averages per user [A30].
