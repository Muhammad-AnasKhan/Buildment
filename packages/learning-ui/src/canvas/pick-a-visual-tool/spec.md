---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 9.2 Visuals and demos with AI
slug: pick-a-visual-tool
version: 1
owner: interaction-designer
---

# Canvas spec: Pick a visual tool for the job

## Teaching claim
The kind of visual tool depends on the job (how parts fit, a screen, or the app working), on whether you can pay, and on your device. Every pick has a free path or a fallback.

## Why a canvas
A table of "if a diagram, then X" is read once and forgotten. Changing one fact and watching the pick move shows that money and device change the answer for a screen design but not for a diagram or a recording, which is the surprise the chapter's predict asks about.

## Model
- Inputs: three factors, one choice each.
  | Name | Choices | Default |
  |---|---|---|
  | What to show (`job`) | How parts fit, A screen, It working | A screen |
  | Can you pay? (`pay`) | Free only, Can pay | Free only |
  | Your device (`device`) | Phone only, Laptop | Phone only |
- Outputs: one of five kinds of tool and a one-line reason.
- Rules, first match wins (12 contexts, all reachable):
  1. How parts fit gives a text diagram (Mermaid), whatever the money or device. Four contexts.
  2. It working gives a short recording (phone recorder or OBS Studio), whatever the money or device. Four contexts.
  3. A screen and Can pay gives a design tool. Two contexts.
  4. A screen, Free only and Laptop gives a chat page (a chat assistant that builds a small page). One context.
  5. Fallback, a screen with Free only and Phone only, gives a paper sketch that is photographed and labelled. One context.
- Dossier ids behind the rules: a text diagram is the course's own method with no dossier claim; recordings and OBS Studio C15 (the phone recorder path is unsourced, U9, so the chapter says "if your phone has one"); the chat page C1, C2, C8, C9 and C6; the design tool C1 to C3 and C10, C11 (Claude Design is a paid research preview on its launch page; Stitch availability is unclear); the paper sketch is the course's free fallback.
- Assumptions: the rules are this course's advice for one small project. They are not a benchmark and they do not rank tools.
- Limitations: real choices have more than three facts, and a tool may not open for you or at your age. The chapter says to use the second tool or the fallback.

## Rendering
- Primary: the shared context picker primitive (inline SVG, 420 units wide).
- Why this renderer: the pills are the control and the ring on the cards moves in the same picture.
- Controls: SVG pills (buttons with `aria-pressed`) and one Reset button. Labels fit the primitive's limits: question at most 40 characters, factor labels at most 18, choice and option labels at most 14, option sub lines at most 18, reasons at most 90.
- Static fallback: the figure's text alternative lists the three facts, the pick and the reason.

## Controls
Three rows of pills. Nothing else.

## Visualisation
Five option cards, one ringed with a "Fits" pill. The banner under the cards gives the reason.

## Copy
- What this shows: the kind of tool that fits the facts you set, and why.
- Try this:
  1. Start with a screen, Free only, Phone only: the pick is a paper sketch. Change Your device to Laptop and the pick becomes a chat page.
  2. Change What to show to How parts fit, then change Can you pay? Nothing moves.
  3. Set It working and notice that a recording needs no payment and no laptop.
- What changed: the ring moves to the new card and the reason changes.
- Limits of the model: set in `limits` (a made-up rule set for one small project; check each tool's own page).

## Edge cases
Twelve contexts, each with one pick. Long reasons wrap to two lines in the banner. No context has no pick, because the fallback covers the rest.

## Accessibility
Pills are reachable by Tab and work with Enter and Space, with a visible focus ring. A polite live region announces the pick and the reason. The ring's move is a transition that is off under reduced motion.

## Acceptance criteria
- [x] The claim is testable: the pick for each of the 12 contexts is listed above.
- [x] The model is the shared primitive, which has its own tests; `checkContextConfig` returns no problems for this data.
- [x] The design is simple and legible at 375 px.
- [x] Prediction before (chapter 9.2: does paying change a diagram pick?), transfer check after (a quick check on a new case).
- [x] Reader fallback exists (`allContexts` lists every row).

## Build plan
`packages/learning-ui/src/canvas/pick-a-visual-tool/data.ts` (export `PICK_A_VISUAL_TOOL` and `pickAVisualTool`), primitive `makeContextPickerCanvas`. The orchestrator registers the slug.
