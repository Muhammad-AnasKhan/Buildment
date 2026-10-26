# Canvas spec: product-m5-big-number

- **Course and chapter:** product-sense, 5.4 "Real content, an editorial layout, a point of view", beat 4 ("A bold choice has a reason"). The predict sits right before this beat.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`). This folder holds only data. Reason: the learner should see two figures of identical shape and judge them by what a student decides from each.
- **Claim:** A big figure with a small label can be a default or a choice. The shape does not decide. The reason does: a figure is a choice when it answers the person's worry in the job [B3]. Facts are Wasel canon: 30 to 40 orders a day in exam weeks; orders sent before noon are ready by 4 pm.
- **Model:** two phone screens for Wasel. Count: "30 to 40" at size 40 in the accent colour, "orders a day in exam weeks" in muted type, "Upload a file". Time: "Ready by" in muted type, "4 pm" at size 40 in the accent colour, "if you send your file before noon.", "Upload a file".
- **Inputs:** a two-way switch (30 to 40, 4 pm).
- **What changes:** the figure, its label and the verdict.
- **What the learner should notice:** both screens have one big figure and a small label. Only the second answers a question a student has before sending a file.
- **Accessibility:** each version has a screen-reader description and a live-region announcement; labels at most 10 characters; verdicts at most 30 characters; text at least 11 units.
- **Limits (fold):** a reason is not proof; a few students must be asked what they noticed first. Wasel is fictional.
- **Sources:** Anthropic's frontend-design skill on a big number with a small label as a default treatment, and on spending boldness in one place [B3]; the course's own template of the job and the worry.
