# Canvas spec: product-m5-asked-order

- **Course and chapter:** product-sense, 5.4 "Real content, an editorial layout, a point of view", beat 2 ("Facts in the order a person asks").
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`). This folder holds only data. Reason: the learner should see where the one real fact sits in each order.
- **Claim:** An editorial layout puts the facts in the order a reader asks: what is this, which groups, when, how do I start. A template puts a slogan and three claims first and the only real fact last [A67, A68, B3].
- **Model:** two phone screens for Halaqa (Maryam's app; canon in the writer pack). Template: a purple glow holding an "AI-powered" pill, "Supercharge your studying" and "Connect, collaborate, succeed.", then three icon cards (Connect, Share, Succeed), "Get started", and a small grey line "Groups for exams, tonight or tomorrow." Asked: a serif headline "Find a study group for your exam, tonight or tomorrow.", the two canon groups ("Data structures, exam Thursday", "Tonight 8 pm, library room 2", "2 seats left"; "Statistics 101 revision", "Tomorrow 5 pm, online", "4 seats left") and "Find a group".
- **Inputs:** a two-way switch (Template, Asked).
- **What changes:** the order, the content of the first screen and the verdict.
- **What the learner should notice:** the template page has the same fact as the asked page, but a student has to scroll past a slogan and three claims to meet it.
- **Accessibility:** each version has a screen-reader description and a live-region announcement; labels at most 10 characters; verdicts at most 30 characters; text at least 11 units.
- **Limits (fold):** the four questions are the course's template for a small app, not a standard. Halaqa is fictional.
- **Sources:** NN/g on relevance and the F-shaped pattern [A67, A68]; Anthropic's frontend-design skill on real content [B3].
