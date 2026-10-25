# Canvas spec: career-m6-empty-phrases

- **Course and chapter:** career-brand (course 16), module 6, chapter 6.4 beat 3, "Tap the empty phrases".
- **Renderer:** the house phrase fixer (`primitives/phrase-fixer.tsx`, model `models/phrase-fixer.ts`) built with `makePhraseFixerCanvas` (`primitives/canvas-factories.tsx`). All data is in `data.ts`.
- **Claim:** An AI-written summary can read well and still hold no fact a reader can check. Each empty phrase has to be replaced by something the writer can back up.

## Text and segments

Waed's summary as a phone card ("Resume summary"): "Results-driven and passionate operations professional with a proven track record of driving efficiency and delivering exceptional outcomes in fast-paced environments." Five segments: four weak ones, each with a why of 60 characters or fewer and a fix, and one fine joining word ("and"). `checkableBefore` is 0.

Rewrite: "Operations coordinator for a five-person online shop for 2 years. Cut order packing time from 3 hours to 2 hours a day, from the shop's order sheet, and wrote the returns checklist the team still uses."

## Inputs and what moves

Tap (or Tab and Enter) a phrase. A weak phrase is underlined, numbered, and the strip says why and gives the fix; a fine one says so and stays plain. Counters in the picture: "Found N of 4" and "Facts a reader can check: N". When all four are found, the card fades into the rewrite (instant under reduced motion) and the banner gives the verdict. "Show the rewrite" skips the finding; "Show the original" compares; "Try again" clears. The card border pulses until the first tap, only while on screen and never under reduced motion.

## What the learner should notice

The facts count goes from 0 to 4 only when each empty phrase is replaced by a role, a time, a measured change with its source, or a thing that exists. Deleting words alone leaves the count at 0.

## Limits

Which phrases count as empty is a judgment; one word proves nothing. The fixes are facts Waed must be able to defend; the edit pass removes filler, it does not invent results.

## Sources

Module brief 6 (`agent-ip/work/career-brand/module-briefs/06-a-resume-that-reads-as-you.md`), 6.4 beat 3.
