# Canvas spec: product-m5-boldness

- **Course and chapter:** product-sense, 5.4 "Real content, an editorial layout, a point of view", beat 3 ("Bold everywhere, then bold in one place").
- **Renderer:** custom, on the reusable specimen compare beat with four versions (pills) and the `blur` option that draws the squint test (`primitives/specimen-beats.tsx`). This folder holds only data. Reason: the learner must see a blurred twin to find out whether any first thing survives.
- **Claim:** Boldness spent on every line is the same as boldness spent nowhere: when four lines share one large, heavy style, a squint shows no first thing. Spent on one line, that line survives the blur. "Spend your boldness in one place" [B3]; the squint test [A69].
- **Model:** the same five facts about Wasel (writer pack canon: send before noon, 0.50 shekels a page for black and white, ready by 4 pm, open 8 am to 6 pm, an Upload a file button). Version "All bold": four lines at size 22, weight 800, and a large button. Version "One bold": "Send your file before noon" at 15, "Ready by" at 13, "4 pm" at 48 in the accent colour, the price and hours at 13 in muted type, and a normal button. Each has a blurred twin.
- **Inputs:** a four-pill switch (All bold, Blur A, One bold, Blur B).
- **What changes:** the screen, whether it is blurred, and the verdict.
- **What the learner should notice:** blurred, the all-bold screen is a block of equal marks; the one-bold screen still shows a single large shape where the time is.
- **Accessibility:** each version has a screen-reader description and a live-region announcement; labels at most 10 characters; verdicts at most 30 characters; text at least 11 units.
- **Limits (fold):** a blur shows what stands out, not whether it is the right thing for the person; that needs a few people. Wasel is fictional.
- **Sources:** Anthropic's frontend-design skill [B3]; NN/g, Gordon, on visual hierarchy and the squint test [A69].
