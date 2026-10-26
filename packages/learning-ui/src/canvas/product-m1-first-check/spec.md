# Canvas spec: product-m1-first-check

- **Course and chapter:** product-sense, 1.5 "Know if it worked", beat 1, the goal, the signal and the two checks.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the goal, the signal and the check are shown as Maryam's own notes with the numbers in them, which a line of boxes joined by arrows could not show.
- **Claim:** One goal and one signal you can watch, written as "x of y" with a time, turn a hope into something Maryam can check with five classmates. A good second result is a sign, not proof.
- **Model:** two phone screens of Maryam's notes. "Check 1" (current app): task "find a group for Thursday's exam and join it", 2 of 5 joined in their first visit, 2 of 5 pressed Back twice and left, they stopped at the search screen. "Check 2" (after the redesign, five new classmates): 4 of 5 joined in their first visit, in about 2 minutes, and one person still asked where the Join button was. These numbers are the course canon.
- **Inputs:** a two-way switch with the labels "Check 1" and "Check 2".
- **What changes:** the notes and the verdict banner: "2 of 5 joined: fix first" (bad) and "A good sign, not proof" (good).
- **What the learner should notice:** the signal is a share of people who were watched, with a time, and it comes with a failure signal. Even the good result keeps a problem in it (one person asked where the button was).
- **Accessibility:** the switch is a pair of real buttons with a group label; a polite live region reads the screen description and the verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** five people from one group are not proof. Maryam and the numbers are fictional.
- **Sources:** Rodden, Hutchinson and Fu, CHI 2010, on goals, signals and task success [A30]; Nielsen, "Why You Only Need to Test with 5 Users" [A20]. The numbers are the course case's own.
