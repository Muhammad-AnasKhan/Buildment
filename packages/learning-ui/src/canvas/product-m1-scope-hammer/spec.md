# Canvas spec: product-m1-scope-hammer

- **Course and chapter:** product-sense, 1.4 "Fit the scope to the time, say no to the rest", the playable sorter.
- **Renderer:** custom, on the reusable `Sorter` primitive (`primitives/sorter.tsx`, model `models/sorter.ts`). This folder holds only data. Reason: scope hammering is a set of decisions with reasons; the learner makes each decision and sees the reason when it is wrong.
- **Claim:** Fix the time first, then shape the scope to fit it. Ask of each feature: does the job fail without it, who does it affect, and what do people do today? A must have stays. A nice to have is marked with a tilde and usually is not built. The rest waits.
- **Model:** nine of Maryam's fourteen features, sorted for a 12-hour appetite and the job "find two or three classmates to revise with tonight or tomorrow". Must have: group search, create group. Nice to have: notifications, calendar sync. Not now: leaderboard, streaks, voice rooms, AI summary, chat. The five features not on the cards (file sharing, polls, badges, profile themes, dark mode) all go to Not now; the chapter's fold says so. Cards are dealt in data order (seed 0) and shuffled after "Sort again".
- **Inputs:** tap a bucket (a real button over each bucket), or drag the card onto a bucket.
- **What moves:** a right card flies into its bucket and the count ticks up; a wrong card shakes and shows its reason. Under reduced motion there is no flight or shake.
- **What the learner should notice:** the same question decides every card, "does the job fail without it?". Voice rooms and chat are not cut because they are bad; they are cut because students already have a way to talk, and the job fails at finding a group.
- **Accessibility:** bucket buttons are labelled with name, gloss and count; a polite live region reads each result and reason; text at least 11.5 units.
- **Limits (fold):** another job or time budget changes the answers. Halaqa is fictional.
- **Sources:** Shape Up, chapter 14, on scope hammering, nice-to-haves marked with a tilde and comparing to what the person has now [A76]; chapter 3 on appetite [A27]; the 12-hour appetite is the course case's own.
