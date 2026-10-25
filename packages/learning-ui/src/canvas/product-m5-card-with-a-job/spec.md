# Canvas spec: product-m5-card-with-a-job

- **Course and chapter:** product-sense, 5.2 "The generic look: defaults you did not choose", beat 4 ("Cards are fine when they hold something").
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`). This folder holds only data. Reason: the learner must see two versions side by side with the same container and a different job.
- **Claim:** Cards are not wrong in themselves. Three cards that each hold a claim ("Fast", "Secure", "Smart") give a student nothing to compare. Three cards that each hold a price (black and white 0.50 shekels a page, colour 2 shekels a page, binding 5 shekels) do a job. A default is a choice you did not make, so the test is the job, not the container.
- **Model:** two versions of a short phone screen for Wasel (canon in the writer pack). Version 1: a heading and three bordered cards, each with an icon tile and a title and a claim. Version 2: a heading and three bordered cards with a title and a price, then one line with the 4 pm promise and its condition.
- **Inputs:** a two-way switch (No job, A job).
- **What changes:** the content of the three cards and the verdict. The container, border and spacing stay the same.
- **What the learner should notice:** the card is the same in both. Only the second answers a question Nour has.
- **Accessibility:** each version has a screen-reader description and a live-region announcement; labels at most 10 characters; verdicts at most 30 characters; text at least 11 units.
- **Limits (fold):** a plain list could do the same job; cards are one choice among several. Wasel is fictional.
- **Sources:** Anthropic's frontend-design skill [B3]; OpenAI's frontend guidance [B5, B6]. The test "did you choose it, and why" is the course's own reading of "defaults rather than choices" [B3].
