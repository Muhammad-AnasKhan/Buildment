# Canvas spec: product-m1-scene

- **Course and chapter:** product-sense, 1.1 "Set the scene: fourteen features, three users", the opening picture.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the scene is two views of one app, and the learner should see the home screen and the usage numbers side by side in two taps.
- **Claim:** An app can have many features and almost no users. Building was fast; choosing what the app is for was skipped.
- **Model:** two phone screens of Maryam's Halaqa. "Built": the home screen with the fourteen features from the course canon (group search, create group, chat, file sharing, polls, voice rooms, streaks, badges, leaderboard, profile themes, dark mode, calendar sync, alerts, AI notes) as fourteen pills of the same weight. "Used": two numbers, 14 features built and 3 weekly users (Maryam, Adel and Rawan).
- **Inputs:** a two-way switch with the labels "Built" and "Used".
- **What changes:** the screen and the verdict banner: "14 features, nothing first" (warn) and "3 people use it each week" (bad).
- **What the learner should notice:** fourteen things of the same size give a new student no place to start, and the number of users is far smaller than the number of features.
- **Accessibility:** the switch is a pair of real buttons with a group label; a polite live region reads the screen description and the verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** Maryam, Adel, Rawan and Halaqa are fictional. The numbers are the case's own.
- **Sources:** none beyond the course case. The writer pack (section 2, cast) fixes the facts.
