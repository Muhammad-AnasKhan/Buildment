# Canvas spec: product-m3-motion-with-a-job

- **Course and chapter:** product-sense, 3.5 "Motion with a reason", beat 1 (the playable beat).
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data, using the block `motion` field (`bounce`, `pulse`, `spin`, `ping`). Reason: the claim is about what moves on a screen, so the picture must move.
- **Claim:** Decorative loops pull the eye away from what the person came to read. Motion earns its place when it shows a change. When the reader asks for reduced motion, the change must still be said, in words or with a gentler cue [A43, A6, A18].
- **Model:** the same Halaqa group page ("Data structures, exam Thursday", tonight 8 pm, 3 seats left) in three versions. All move: a "New" pill bounces, a star spins, a bolt pings and the Join button pulses. One change: after Join is tapped, one spinner turns beside "Joining the group..." and nothing else moves. Reduced: nothing moves; a "Joining" pill and a line say that the person is being added and what the line says when it is done.
- **Versions:** "All move" (bad: "Four loops, no job"), "One change" (good: "One motion, one job"), "Reduced" (good: "The change is said in words").
- **Inputs:** three pills under the picture; the first version shown is All move.
- **What changes:** which shapes move, the screen and the verdict. The motion classes are `motion-safe:` only, so a reader who asks for reduced motion sees the first two versions without movement as well.
- **What the learner should notice:** in the first version the eye goes to the moving parts, not to the time and the seats. In the second, the one moving part is the one that answers "is it working?". The third keeps that answer when nothing moves.
- **Accessibility:** the pills are a real button group; a polite live region reads the version, its screen description and the verdict; motion is off under `prefers-reduced-motion`; text at least 11 units.
- **Limits (fold):** the loops repeat so you can see them; a real motion that shows a change plays once and stops. Reduced motion means less non-essential motion, not no feedback. Halaqa is fictional.
- **Sources:** MDN on `prefers-reduced-motion` [A43]; WCAG 2.3.3 (AAA) [A6] and 2.2.2 (A) [A18].
