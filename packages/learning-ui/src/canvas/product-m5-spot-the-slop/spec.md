# Canvas spec: product-m5-spot-the-slop

- **Course and chapter:** product-sense, 5.2 "The generic look: defaults you did not choose", the playable beat.
- **Renderer:** custom, on the reusable specimen spot beat (`primitives/specimen-beats.tsx`). This folder holds only data. Reason: the learner must find the parts themselves and get a reason for each tap, which a static before and after cannot do.
- **Claim:** The generic AI-made look comes from defaults nobody chose: a decorative glow, a badge about how the page was made, a headline that could sell anything, identical icon cards with claims and no proof, and a button that does not say what happens. Real content (a price, a time, opening hours) is not the problem; it should move up.
- **Model:** one phone screen of Wasel's landing page (canon in the writer pack). Five targets: the glow box, the "AI-powered" pill, the hype headline, the row of three icon cards, the "Get started" button. Two fine parts: the price line and the opening hours. A tap on a target marks it with a numbered red ring and shows its reason; a tap on a fine part explains why it is fine. When all five are found, a switch shows a version that leads with the real content.
- **Inputs:** tap or Tab and Enter on each part; "Start again"; after all five, the "Problems" and "Real content" switch.
- **What changes:** the found count in the banner ("Find the 5 generic parts", "Found 2 of 5", "All 5 found"), the rings, the reason line, and the fixed version.
- **What the learner should notice:** each generic part answers no question a customer has; the fixed page answers "what, how much, by when" first.
- **Accessibility:** every part is a focusable button with a label ("Check this part" or "<name>, found"); the reason line is a polite live region; the SVG has a title; text at least 11 units. The purple gradient is drawn on purpose, as the subject of the lesson (decision log, 2026-10-25).
- **Limits (fold):** no single part makes a page generic; a gradient or icon can be right when it has a job. Wasel is fictional.
- **Sources:** Anthropic's frontend-design skill and blog [B1, B3]; OpenAI's frontend guidance [B5, B6].
