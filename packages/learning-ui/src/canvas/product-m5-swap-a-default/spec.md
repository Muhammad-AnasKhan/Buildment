# Canvas spec: product-m5-swap-a-default

- **Course and chapter:** product-sense, 5.2 "The generic look: defaults you did not choose", beat 3 ("Swapping a default is not a choice"). The predict sits right before this beat.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`). This folder holds only data. Reason: the learner must see three versions of one top section and read the same headline twice before the words change.
- **Claim:** Removing the purple glow does not make a page chosen. A quiet page with a serif font and the same words is another default, because nobody decided it for Wasel. A default is a choice you did not make [B3].
- **Model:** three phone screens for Wasel (writer pack canon). Glow: the generic top section as in `product-m5-spot-the-slop`. Swapped: no glow, a muted page, a serif headline "Revolutionize your printing experience", the same subline, a secondary "Get started" button. Chosen: the shop name as a small label, the headline "Send your file before noon. Pick it up printed by 4 pm." (the 5.2 canon headline), and "Upload a file".
- **Inputs:** a three-pill switch (Glow, Swapped, Chosen).
- **What changes:** the look and, only in the third version, the words. The verdict changes.
- **What the learner should notice:** the second page looks calmer and reads exactly the same. Only the third page says anything about printing.
- **Accessibility:** each version has a screen-reader description and a live-region announcement; labels at most 10 characters; verdicts at most 30 characters; text at least 11 units.
- **Limits (fold):** one possible swap is drawn; a quiet serif page can be a good choice with a reason. Wasel is fictional.
- **Sources:** Anthropic's frontend-design skill, which names whole styles as defaults and says the patterns are defaults rather than choices [B3].
