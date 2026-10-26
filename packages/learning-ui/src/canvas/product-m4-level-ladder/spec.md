# Canvas spec: product-m4-level-ladder

- **Course and chapter:** product-sense, 4.2 "Average, good, best, remarkable", beat 1 ("Each level adds checks to the one below").
- **Renderer:** custom, on the reusable specimen ladder (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about what a screen gains at each level, so the picture must be a screen the learner steps through, not a diagram about one.
- **Claim:** Each level of the course's scale keeps every check of the level below and adds its own. Average works with defaults. Good adds labels, hints, readable text and a clear button. Best puts one thing first and cuts what the job does not need, and has been tried by three to five people. Remarkable adds one named choice with a reason.
- **Model:** four versions of one printer-booking page that Omar built (fictional): Average (a "Welcome" title, placeholder-only fields, pale hint text, a small Submit button), Good (labels above fields, a hint, one wide button that names the action), Best (the free printer and time is the largest line, extra text gone, a button that names the time), Remarkable (the number of people ahead in the queue is the largest figure, because the wait decides which printer a student picks).
- **Inputs:** drag anywhere across the picture, or use the arrow keys on the slider; four stops.
- **What changes:** the screen and the verdict: "Works, nothing checked", "Standards pass", "One thing first, tested", "A choice: the queue leads".
- **What the learner should notice:** each version keeps the earlier fixes; Best and Remarkable change what leads on the screen; a check with people cannot be drawn, so the verdict says it.
- **Accessibility:** the wrapper is a real slider with a value text ("Average", "Good", "Best", "Remarkable"); a polite live region reads the verdict; the SVG has a title with the screen's description; text at least 11 units.
- **Limits (in the data):** a picture shows some checks and not others; the scale is the course's own; the units are not pixels; Omar and Lab Print are fictional.
- **Sources:** the level checks in the chapter's fold [A1, A2, A4, A5, A8, A11, A16, A20, A21, A22, A23, A38, A39, A49, A58, A67, A69, A90]; the scale itself is the course's own method.
