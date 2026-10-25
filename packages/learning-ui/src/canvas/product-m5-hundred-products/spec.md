# Canvas spec: product-m5-hundred-products

- **Course and chapter:** product-sense, 5.3 "Words anyone could write", beat 2 ("Sort Wasel's sentences").
- **Renderer:** custom, on the reusable `Sorter` primitive (`primitives/sorter.tsx`, model `models/sorter.ts`). This folder holds only data. Reason: the learner must make a choice and get a reason for each wrong one; any course can sort its own cards with the same component.
- **Claim:** A sentence a hundred products could say tells a reader nothing. The test looks at what the sentence tells, not at which words it uses: a line with no hype words ("Quality prints at great prices") fails, and a plain line with a price, a time or a place passes.
- **Model:** two buckets, Any product and Only Wasel. Eight cards in data order; a right bucket moves the card on, a wrong bucket keeps it and shows the reason for that card. Four cards fail the test: the hype headline, the hype subline, the sign-board line, the trusted-partner line. Four pass: the black and white price (0.50 shekels a page), the send-before-noon promise, the opening hours and place, and the exam-week number (30 to 40 orders a day). Every fact on a passing card is Wasel canon from the writer pack.
- **Inputs:** tap a bucket, or drag the card onto it.
- **What changes:** the bucket counts, the card, the reason line after a wrong try, and the verdict (how many took a second try).
- **What the learner should notice:** the tricky card is "Quality prints at great prices". It sounds like a print shop and has no hype word, and it still fails.
- **Accessibility:** inherited from the Sorter: labelled bucket buttons with counts, a live region for results, focus rings. Bucket labels at most 15 characters; cards at most about 60 characters.
- **Limits (fold):** the test is a rule of thumb; a sentence can pass and still read badly. Wasel is fictional.
- **Sources:** Anthropic's frontend-design skill on plain description and specific copy [B3]; OpenAI's frontend guidance on filler copy and repeated mood statements [B5]. The hundred products test is the course's own rule (dossier B, accepted outline change 3).
