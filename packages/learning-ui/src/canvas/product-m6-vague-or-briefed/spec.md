# Canvas spec: product-m6-vague-or-briefed

- **Course and chapter:** product-sense, 6.2 "Design skills and agents that build screens", beat 1 (the playable beat).
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, three versions shown as pills). This folder holds only data. Reason: the learner should switch between the three drafts and see for themselves where the screen stops being generic.
- **Claim:** A vague prompt gets the most common answer. A specific brief and a checklist give the right shape, but filler words remain. Real content (real group names, times, places and seats) is what makes the screen belong to this product [B5, B8].
- **Model:** three phone screens for Halaqa's home screen (fictional, hand-drawn for the lesson, not tool output). Vague: a purple glow box with an "AI-powered" pill, a hype headline, a filler line and a "Get started" button, then three icon cards (Connect, Learn, Grow). Briefed: a plain "Study groups tonight" title and a list of two group cards, each with a Join button, but the text is filler ("Study group", "Time and place", "Seats left"). Real content: the same layout with "Data structures, exam Thursday, Tonight 8 pm, library room 2, 2 seats left", "Statistics 101 revision, Tomorrow 5 pm, online, 4 seats left" and a full group as a plain line (the same group names as `product-m2-spacing-groups`).
- **Versions:** Vague, Brief, Real data. Verdicts: "Vague: the most common look" (bad), "Brief: right shape, no facts" (warn), "Real content: it is Halaqa" (good).
- **Inputs:** tap a version pill (or Tab and Enter).
- **What changes:** the screen and its verdict.
- **What the learner should notice:** the brief removes the glow and the icon cards, so the screen has a job and one main action. It still could be any app until real names, times and seats go in. With real content, the layout questions become real too (long names wrap, a full group has no Join button).
- **Accessibility:** each version has a one-sentence alt; a polite live region reads the version, the alt and the verdict; pills are real buttons. The purple glow is drawn on purpose, as the subject of the lesson (decision log, 2026-10-25).
- **Limits (fold):** hand-drawn, not tool output; real tools differ and vary from run to run; even good drafts can have weak hierarchy and spacing [B8]. Halaqa is fictional.
- **Sources:** Anthropic's cookbook and frontend-design skill [B2, B3]; OpenAI's frontend guidance [B5]; NN/g on AI prototyping tools [B8]; AIES 2026 on convergence [B9].
