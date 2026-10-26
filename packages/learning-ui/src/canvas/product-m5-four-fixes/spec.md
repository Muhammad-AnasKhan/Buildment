# Canvas spec: product-m5-four-fixes

- **Course and chapter:** product-sense, 5.3 "Words anyone could write", beat 3 ("Four things make a sentence specific").
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`). This folder holds only data. Reason: the learner should see the same vague line replaced four different ways on the same screen, so only the line changes.
- **Claim:** A vague sentence is replaced by one of four things: a price you can check, a time you can keep, a thing a user did (from a real count) or a thing you gave up. Any one is enough [B3, B5].
- **Model:** four phone screens for Ehab's bakery (fictional; prices and hours match `product-m5-scene`: a loaf is 3 shekels, open 6 am to 2 pm, near the market). Each shows the old line in small muted type ("Instead of: We bake with love and passion every day."), the new line at size 21, the hours, and an "Order bread" button. Lines: "A loaf is 3 shekels. A roll is 1." / "Bread comes out of the oven at 7 am." / "We counted last week: 31 of 40 buyers came before 8 am." / "One bake a day, so we sell out by noon."
- **Inputs:** a four-pill switch (Price, Time, User did, Gave up).
- **What changes:** only the main line and the verdict.
- **What the learner should notice:** each new line breaks if you swap the product, and each can be checked. The count line needs a real count behind it.
- **Accessibility:** each version has a screen-reader description and a live-region announcement; labels at most 10 characters; verdicts at most 30 characters; text at least 11 units.
- **Limits (fold):** the numbers are invented for the picture. A real page needs real facts; an invented count is false, not specific.
- **Sources:** Anthropic's frontend-design skill on plain description [B3]; OpenAI's frontend guidance on filler copy [B5]. The four replacements are the course's own list.
