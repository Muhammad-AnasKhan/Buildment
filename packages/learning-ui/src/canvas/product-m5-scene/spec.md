# Canvas spec: product-m5-scene

- **Course and chapter:** product-sense, 5.1 "Set the scene: a shop page made in one evening", beat 1.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`). This folder holds only data. Reason: the learner must see that the page stays the same while the shop changes, which only a switch between versions shows.
- **Claim:** Wasel's generated page could sell anything. Change one word of the headline and two small grey lines, and the same glow, badge, three icon cards and button fit a bakery or a gym club as well as a print shop.
- **Model:** three versions of one phone screen, built by one function so that everything but the headline word and the two lines at the bottom is identical. The first is Wasel's page as in the writer pack (canon: purple glow, "AI-powered" pill, "Revolutionize your printing experience", "Seamless, powerful and effortless.", glowing "Get started", three icon cards Fast, Secure, Smart, then the price with the 4 pm promise and the opening hours in small grey text). The bakery and the gym club are invented for the comparison.
- **Inputs:** a three-pill switch (Print shop, Bakery, Gym club).
- **What changes:** the headline word, the two small lines and the verdict. Nothing else.
- **What the learner should notice:** the large, loud part of the page says the same thing for every shop. Only the small grey lines at the bottom belong to one shop.
- **Accessibility:** each version has a screen-reader description and a live-region announcement; labels at most 10 characters; verdicts at most 30 characters; text at least 11 units. The purple glow is drawn on purpose, as the subject of the module (decision log, 2026-10-25).
- **Limits (fold):** the other shops are invented; no tool always makes this page; a page like this can be right for a shop that chose it.
- **Sources:** Anthropic's frontend-design skill and blog [B1, B3]; OpenAI's frontend guidance [B5, B6]; NN/g, "AI Prototyping in Real Design Contexts" [B8].
