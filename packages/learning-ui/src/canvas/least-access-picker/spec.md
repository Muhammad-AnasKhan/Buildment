---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 9.5 CLIs and connectors, read-only first
slug: least-access-picker
version: 1
owner: interaction-designer
---

# Canvas spec: How much access does the job need?

## Teaching claim
Give a command-line tool or a connector the least access the task needs. Read-only for reading, write on one repository for a pull request, a cost-only view for costs, and some tasks stay with a person.

## Why a canvas
Access is a choice between a few settings that all "work". Changing the task, the place and who runs it, and watching the smallest access that works change, shows that least access is not one setting but a habit of asking.

## Model
- Inputs: three factors, one choice each.
  | Name | Choices | Default |
  |---|---|---|
  | The task (`task`) | Read, Change, Pay or delete | Read |
  | Where (`place`) | GitHub repo, Cloud bill, No account | GitHub repo |
  | Who runs it (`runner`) | You type, An AI tool | An AI tool |
- Outputs: one of five accesses and a one-line reason.
- Rules, first match wins (18 contexts, all five options reachable):
  1. Pay or delete gives "You, by hand" (a person), in all contexts. Six contexts.
  2. No account gives a sample report. Four more contexts (the remaining ones of the No account row).
  3. Cloud bill and Read gives a cost view only. Two contexts.
  4. Cloud bill and Change gives "You, by hand". Two contexts.
  5. GitHub repo and Read gives read-only (a token with read permission on one repository and an expiry). Two contexts.
  6. GitHub repo, Change and You type gives write on one repository with an expiry, and you read the change before it merges. One context.
  7. GitHub repo, Change and An AI tool gives read-only: the tool drafts and you type the change. One context.
  8. Fallback "You, by hand" never fires for these 18 contexts; it stays as a safe default.
- Dossier ids: fine-grained tokens limited to chosen repositories with an expiry C42; the GitHub CLI commands that read and the four that change C41; MCP consent and arbitrary code C43; read-only mode and lockdown mode C44; hidden instructions in issues C45; cost views, budgets that alert but do not stop spending, and a billing read-only policy that also shows invoices and payment details C46 to C48 and C50; a supplied sample report as the safe practice path C52 and U16; the exact minimal cost-reading policy is untested (U17), so the picker says "custom policy" and the chapter says to ask the instructor for the tested one.
- Assumptions: a person types and reviews every change that matters. The rules are this course's advice, not a security standard.
- Limitations: stated in `limits`.

## Rendering
- Primary: the shared context picker primitive.
- Why this renderer: the pills are the control; the ring on the cards moves in one picture.
- Controls: three rows of SVG pills and Reset. Labels fit the primitive's limits (choice and option labels at most 14 characters, sub lines at most 18, reasons at most 90).
- Static fallback: the figure's text alternative.

## Controls
Three rows of pills. Reset.

## Visualisation
Five option cards, one ringed with a "Fits" pill. The banner gives the reason.

## Copy
- What this shows: the smallest access that does the job.
- Try this:
  1. Start with Read, GitHub repo, An AI tool: read-only. Change the task to Change and see that an AI tool still gets read-only.
  2. Set You type: write on one repository appears.
  3. Set Cloud bill and Read: a cost view, and notice the reason about invoices.
  4. Set Pay or delete: no tool acts.
- What changed: the ring moves and the reason changes.
- Limits of the model: set in `limits`.

## Edge cases
Eighteen contexts, each with one pick. No Pay or delete context offers a tool. The "No account" row always gives the sample report unless the task is Pay or delete.

## Accessibility
Pills are keyboard reachable with a visible focus ring. A polite live region announces the pick and the reason. Reduced motion removes the ring's transition.

## Acceptance criteria
- [x] The claim is testable: the pick for each of the 18 contexts is derived from the rules above.
- [x] `checkContextConfig` returns no problems.
- [x] No dash characters; all labels fit the primitive's limits.
- [x] Prediction before the hidden-instruction scene (chapter 9.5), transfer check after.
- [x] Reader fallback exists (`allContexts`).

## Build plan
`packages/learning-ui/src/canvas/least-access-picker/data.ts` (export `LEAST_ACCESS_PICKER` and `leastAccessPicker`), primitive `makeContextPickerCanvas`. The orchestrator registers the slug.
