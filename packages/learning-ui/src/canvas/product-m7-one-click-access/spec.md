# Canvas spec: product-m7-one-click-access

- **Course and chapter:** product-sense, 7.4 "Show it where people look, open in one click", the playable beat.
- **Renderer:** custom, on the reusable specimen compare (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about what a reviewer meets when a link opens, so the picture must be the screens they meet.
- **Claim:** A reviewer must reach the core of the work in one step. A login wall stops them; a guest button that opens an empty app opens a door onto nothing; a guest button with sample data opens the core; when the live demo is down, a short video, screenshots and a README keep the work visible.
- **Model:** four versions of the same Halaqa link. "Login wall": a sign-in page with email and password fields and a "No account? Sign up" line. "Empty": guest mode with no data, an inbox icon, "No groups yet." and a "Start a group" button. "Sample": guest mode with a "Guest mode: sample groups" pill, tonight's groups, a Join button and "Nothing you do here is saved." "Fallback": "The live demo is paused", a demo video of 70 seconds with captions, a Watch the demo button, a See the screenshots button and a README line.
- **Inputs:** touch one of four buttons (Login wall, Empty, Sample, Fallback).
- **What changes:** the screen and the verdict: "A reviewer stops here" (bad), "One tap, but nothing to see" (warn), "The core opens in one tap" (good), "A down demo still shows value" (good).
- **Numbers on screen:** 70 seconds (the demo video, the same length as the story in 7.2).
- **What the learner should notice:** on the login wall the reviewer has seen nothing of the work. A guest button alone is not enough: with no sample data the reviewer is inside an empty app. With sample groups the reviewer is inside the core. On the fallback page the live app is gone, and the case study is still not useless.
- **Accessibility:** a real switch or button group with a name ("How the link opens"); a polite live region reads the version and the verdict; the SVG has a title with the screen's description; text at least 11.5 units.
- **Limits (fold):** four designs, not a ranking of hosting tools. Guest mode must show sample data, never real people. Halaqa is fictional.
- **Sources:** app stores ask for a demo account when an app has a login, used as an analogy only [B83]; a fallback chain of video, screenshots and README is the course's own recommendation (dossier B, D5); hosting terms [B49, B78, B79].
