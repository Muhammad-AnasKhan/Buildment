# Canvas spec: product-m1-signal-or-count

- **Course and chapter:** product-sense, 1.5 "Know if it worked", the playable sorter.
- **Renderer:** custom, on the reusable `Sorter` primitive (`primitives/sorter.tsx`, model `models/sorter.ts`). This folder holds only data. Reason: the skill is telling a number you can watch a person produce from a number that grows by itself; a sort with a reason for each wrong try practises exactly that.
- **Claim:** A signal is something you can watch a person do that shows the goal was met (or missed). A ratio such as "4 of 5" says how many of those who tried succeeded. A raw count such as "1,000 page views" or "4 people joined" can rise while the goal is missed, because it grows with the number of visitors.
- **Model:** eight cards in three buckets: Success signal ("4 of 5 classmates joined a group in their first visit.", "The first group was joined in about 2 minutes."), Failure signal ("3 of 5 gave up on the search screen.", "2 of 5 pressed Back twice and closed the app."), Count only ("1,000 page views this month.", "4 people joined a group this month.", "More sign-ups than last month.", "12 chat messages were sent today."). The goal throughout is "a student joins a study group for an upcoming exam".
- **Inputs:** tap a bucket (a real button over each bucket), or drag the card onto a bucket.
- **What moves:** a right card flies into its bucket and the count ticks up; a wrong card shakes and shows its reason. Under reduced motion there is no flight or shake.
- **What the learner should notice:** "4 people joined" and "4 of 5 joined" look close but differ: only the second says how many tried. Giving up and pressing Back are signals too; failure is often easier to see than success.
- **Accessibility:** bucket buttons are labelled with name, gloss and count; a polite live region reads each result and reason; text at least 11.5 units.
- **Limits (fold):** a count can still be useful context. Five people are too few for a proof. Halaqa is fictional.
- **Sources:** Rodden, Hutchinson and Fu, "Measuring the User Experience on a Large Scale" (CHI 2010) on Goals, Signals, Metrics, ratios and failure signals [A30].
