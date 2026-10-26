# Canvas spec: product-m7-scene

- **Course and chapter:** product-sense, 7.1 "Set the scene: the link nobody opened", beat 1.
- **Renderer:** custom, on the reusable specimen compare (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the scene is three screens, so the picture should be screens the learner switches between, not a diagram about them.
- **Claim:** A strong piece of work can reach a reviewer as nothing: a login wall stops them before they see it, and a video that needs sound tells them nothing when it plays muted. The good part sits behind both.
- **Model:** three versions of what Dalia (a product manager, fictional) met when she opened Maryam's Halaqa work. "Login wall": a sign-up page with an email field, a password field and a Sign up button. "No sound": a demo video paused at 0:14 of 2:10 on a settings page, with a "Sound off" pill and no words or captions on screen. "The work": the screen behind them, with the result of Maryam's check (4 of 5 classmates joined a group in their first visit) and tonight's group with a Join button.
- **Inputs:** touch one of three buttons (Login wall, No sound, The work). Nothing else.
- **What changes:** the screen and the verdict: "Dalia stops here" (bad), "A silent video says nothing" (bad), "The good part she never saw" (good).
- **Numbers on screen:** 0:14 of 2:10 (the video); 4 of 5 (Maryam's check, from module 1); the group card uses the same text as the spacing canvas in 2.4.
- **What the learner should notice:** nothing on the first two screens tells a stranger what Halaqa does or that it worked. The third screen does, and it was one tap away from nobody.
- **Accessibility:** a real switch or button group with a name ("What Dalia met"); a polite live region reads the version and the verdict; the SVG has a title with the screen's description; text at least 11.5 units.
- **Limits (fold):** this is one morning and one reviewer. Real people open links in many ways. Halaqa, Maryam and Dalia are fictional.
- **Sources:** the chapter's own story. Muted feed video: LinkedIn Help [B66]; a login wall as the norm app stores avoid, used as an analogy only [B83].
