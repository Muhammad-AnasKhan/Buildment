# Canvas spec: product-m5-point-of-view

- **Course and chapter:** product-sense, 5.4 "Real content, an editorial layout, a point of view", beat 1.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`). This folder holds only data. Reason: the learner must compare three versions of one first screen to see what changes when content, order and one bold choice replace claims in cards.
- **Claim:** Real content as the visual and one bold choice make a first screen worth remembering; cards that hold claims do not. Facts (writer pack canon): black and white 0.50 shekels a page, colour 2 shekels, binding 5, orders sent before noon are ready by 4 pm, open 8 am to 6 pm near the university gate. The headline of version 2 matches the fixed version in `product-m5-spot-the-slop`.
- **Model:** three phone screens for Wasel. Card grid: a friendly headline, three icon-tile cards with claims, a "Get started" button; no price, no time. Real content: a serif headline that says what happens, the price list as a receipt picture, "Upload a file", the before-noon rule, the hours. One bold: "4 pm" at size 48 in the accent colour with a muted "Ready by" above and "if you send your file before noon." below, then the smaller price picture, the button and the hours.
- **Inputs:** a three-pill switch (Card grid, Content, One bold).
- **What changes:** the content, the order, the one large element and the verdict.
- **What the learner should notice:** the second screen answers "what, how much, by when, how do I start" in that order. In the third, exactly one thing is large, and it is the fact that matches the customer's worry about the deadline.
- **Accessibility:** each version has a screen-reader description and a live-region announcement; labels at most 10 characters; verdicts at most 30 characters; text at least 11 units.
- **Limits (fold):** three drawings are not a test; a big number with a small label is also on a vendor's list of default treatments, so the reason must be nameable. Wasel is fictional.
- **Sources:** Anthropic's frontend-design skill on real content, "spend your boldness in one place" and the default hero treatment [B3]; OpenAI's frontend guidance on real content and one primary action [B5, B6]; NN/g on visual hierarchy [A69] and relevance [A67].
