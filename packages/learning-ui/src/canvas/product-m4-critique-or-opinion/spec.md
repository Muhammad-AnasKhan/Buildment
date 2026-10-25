# Canvas spec: product-m4-critique-or-opinion

- **Course and chapter:** product-sense, 4.4 "Study real products: collect, compare, critique", beat 3 ("A critique, an opinion and a guess"), right after the predict.
- **Renderer:** custom, on the reusable `Sorter` primitive (`primitives/sorter.tsx`, model `models/sorter.ts`) with three buckets. This folder holds only data. Reason: telling a critique from an opinion from a guess is a skill the learner practises by sorting real-looking sentences and reading why a wrong bucket is wrong.
- **Claim:** A critique names what you see, a rule and proof. An opinion is a feeling about the look. A guess claims to know why the maker did something, which no one can see on the screen. Only a critique helps the maker decide what to change.
- **Model:** nine sentences about the made-up apps A, B and C from the same-task canvas. Critique (3): placeholder-only labels in App A with GOV.UK's rule; free hours first in App B tied to the task; a map and no times in App C tied to the task. Opinion (3): "feels more professional", "make the Book button pop more", "I love the colours". Guess (3): App C hides times so people stay longer; App A asks five questions because the owner wants data; App B copied its layout from a famous app.
- **Inputs:** tap a bucket or drag the card onto a tray. Each wrong try shows a reason written for that card and bucket.
- **What changes:** bucket counts, the card, and the reason shown after a wrong try.
- **What the learner should notice:** dates, rules and facts mark a critique; "pop", "professional" and "love" mark an opinion; "so that", "because the owner" and "copied from" mark a guess.
- **Accessibility:** tray buttons are labelled with the name, gloss and count; a polite live region reads each result and reason; text at least 11.5 units; every reason fits two lines of 60 characters.
- **Limits (in the data):** real sentences mix the three kinds, so the canvas asks what each sentence mainly does. The apps and the dates are made up.
- **Sources:** critique against objectives, and a facilitator turning opinions into questions [A31]; the GOV.UK Design System on labels and its reasons [A74]; the course's own rule never to guess a company's reasons.
