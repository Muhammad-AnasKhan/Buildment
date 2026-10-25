# Canvas spec: product-m4-rule-or-myth

- **Course and chapter:** product-sense, 4.5 "Popular rules that fail a check", beat 2 ("Sort nine popular rules"), right after the predict.
- **Renderer:** custom, on the reusable `Sorter` primitive (`primitives/sorter.tsx`, model `models/sorter.ts`) with three buckets. This folder holds only data. Reason: the skill is to judge a claim by its evidence, which the learner practises by sorting claims and reading why a wrong bucket is wrong.
- **Claim:** Popular design rules differ in how much evidence they have. Some are backed by a standard, a study or a written practice. Some have a true core that people use in the wrong place. Some failed their test, have mixed evidence, or were dropped by their own source. Judging this is part of taste.
- **Model:** nine cards. Supported (3): normal text needs 4.5 to 1 [A1]; most viewing time is near the top of a page [A53]; a form label should stay visible above its field [A25, A74]. Misread (3): five users find all the problems [A20]; a menu should hold seven items, plus or minus two [A55, A83]; lay out your page to follow the F-pattern [A68]. Unsupported (3): every page within three clicks [A54]; the golden ratio makes a design beautiful [A56]; blue makes people trust you [A57].
- **Inputs:** tap a bucket or drag the card onto a tray. Each wrong try shows a reason written for that card and bucket.
- **What changes:** bucket counts, the card, and the reason shown after a wrong try.
- **What the learner should notice:** a popular rule that sounds precise (three, seven, 1.618) usually has an origin narrower than the rule; "supported" rules name a standard, a study or a maker's reasons.
- **Accessibility:** tray buttons are labelled with the name, gloss and count; a polite live region reads each result and reason; text at least 11.5 units; every reason fits two lines of 60 characters.
- **Limits (in the data):** evidence changes and some of it is thin or old; the labels describe the sources opened for this course, checked 2026-10-25; unsupported does not mean the opposite is true.
- **Sources:** [A1], [A20], [A25], [A53], [A54], [A55], [A56], [A57], [A59], [A68], [A74], [A83].
