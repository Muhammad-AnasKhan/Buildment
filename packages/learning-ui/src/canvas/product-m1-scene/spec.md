# Canvas spec: product-m1-scene

- **Course and chapter:** product-sense, 1.1 "Set the scene: fourteen features, three users", the opening picture.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the scene is three views of one app, and the learner should see how it grew and who uses it in three taps. Three versions show as pills.
- **Claim:** An app can have many features and almost no users. Building was fast; choosing what the app is for was skipped.
- **Model:** three phone screens of Maryam's Halaqa. "First": the app after the first evening, with one feature (group search) and one group found. "Built": the home screen with the fourteen features from the course canon (group search, create group, chat, file sharing, polls, voice rooms, streaks, badges, leaderboard, profile themes, dark mode, calendar sync, notifications, an AI summary of notes) as fourteen pills of the same weight. "Used": two numbers, 14 features built and 3 weekly users (Maryam, Adel and Rawan).
- **Inputs:** three pills labelled "First", "Built" and "Used".
- **What changes:** the screen and the verdict banner: "One feature, one evening" (good), "14 features, nothing first" (warn) and "3 people use it each week" (bad).
- **What the learner should notice:** one feature grew into fourteen of the same size, which gives a new student no place to start, and the number of users is far smaller than the number of features.
- **Accessibility:** the pills are real buttons with a group label; a polite live region reads the screen description and the verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** Maryam, Adel, Rawan and Halaqa are fictional. The numbers are the case's own.
- **Sources:** none beyond the course case. The writer pack (section 2, cast) fixes the facts.
