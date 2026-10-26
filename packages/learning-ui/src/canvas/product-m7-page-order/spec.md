# Canvas spec: product-m7-page-order

- **Course and chapter:** product-sense, 7.3 "A case study page that passes the skim", beat 3.
- **Renderer:** custom, on the reusable specimen compare (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about which sections a phone's first screen holds, so the picture should be the page as a stack of sections with a line where the first screen ends.
- **Claim:** The same five sections can sit in two orders. In story order, the first screen holds the author and the tools, and the result is last. With the result first, the first screen holds the result and the problem. Most viewing time falls near the top of a page, so the order decides what a busy reader sees [B58, B59].
- **Model:** two versions of the page of Maryam's case study for Halaqa (fictional), drawn as five numbered boxes and a "First screen ends here" marker after the second box. "Story first": 1 About me, 2 Tools and tech stack, then 3 How I built it, week by week, 4 Screens, 5 The result: 4 of 5 joined. "Result first": 1 The result: 4 of 5 joined, up from 2 of 5, 2 The problem and the job, then 3 My role, 4 Choices and what I gave up, 5 Before and after, and how I know. The boxes above the marker are shaded.
- **Inputs:** a two-way switch (Story, Result).
- **What changes:** the order of the sections and the verdict: "The result is out of sight" (bad), "The result is on screen one" (good).
- **Numbers on screen:** 4 of 5 and 2 of 5 (Maryam's check, from module 1).
- **What the learner should notice:** the sections are the same in both orders. Only the order changes, and with it what a busy reader sees.
- **Accessibility:** a real switch with a name ("Order of the page"); a polite live region reads the version and the verdict; the SVG has a title with the screen's description; text at least 13 units.
- **Limits (fold):** where a first screen ends depends on the phone. The line is a drawing aid. Maryam and Halaqa are fictional.
- **Sources:** time near the top of a page [B58, B59]; what hiring managers want to see [B60, B62].
