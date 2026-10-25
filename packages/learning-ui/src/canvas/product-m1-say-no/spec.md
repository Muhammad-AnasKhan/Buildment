# Canvas spec: product-m1-say-no

- **Course and chapter:** product-sense, 1.4 "Fit the scope to the time, say no to the rest", beat 4, three replies to one request.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: a reply is a small screen of text, and the learner should read the three replies side by side in three taps. Three versions show as pills.
- **Claim:** A no needs a reason the other person can check, or it feels like a refusal. The course's template has four parts: the item, who it affects, what happens without it, and what you do instead.
- **Model:** three phone screens of Maryam's reply to Rawan, who asked for a leaderboard. "Too hard": "No. A leaderboard is too hard for me to build." (the reason is about the builder). "Later": "Good idea! I will add it later, when everything else is done." (a promise with no condition). "Four parts": the item, who it affects (students who like to compete, not students finding a group), what happens without it (nothing breaks for finding a group tonight) and what she does instead (it stays on the later list until after the check).
- **Inputs:** three pills labelled "Too hard", "Later" and "Four parts".
- **What changes:** the reply and the verdict banner: "The reason is about you" (bad), "A promise with no condition" (warn) and "Four parts, easy to check" (good).
- **What the learner should notice:** only the third reply gives Rawan something she can check or answer. The first talks about the builder, and the second turns a polite word into a promise.
- **Accessibility:** the pills are real buttons with a group label; a polite live region reads the screen description and the verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** the four-part no is the course's own template. Rawan, Maryam and Halaqa are fictional.
- **Sources:** Shape Up, chapter 14, on scope hammering [A76]; the "Do less" principle of GOV.UK's design principles [A75]. The four-part template is the course's own.
