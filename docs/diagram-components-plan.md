# Diagram components: findings and plan

Course authors and the agent-ip course factory need diagrams that look like Edorax, stay readable on a 320px phone, and cost almost nothing to download. Today most chapter diagrams are Mermaid. This plan replaces new Mermaid use with a small text spec that the reader draws as a branded, interactive diagram, and that a script can also export as a static SVG.

## What exists today

### Mermaid in courses

Course source now lives in the private `devweekends/Buildment-core` repository (`courses/`, `agent-ip/`), not in this one (see `docs/15-content-separation.mdx`). A count on 2026-10-28:

| Kind | Fences |
| --- | --- |
| `flowchart` (389 TD, 284 LR, 7 TB) | 680 |
| `sequenceDiagram` | 58 |
| `stateDiagram-v2` | 22 |
| `erDiagram` | 11 |
| **Total**, across 757 chapter files in 11 courses | **771** |

Most are short flowcharts: four to eight boxes, a few labelled arrows, sometimes two branches. Mermaid draws them with its own theme, font and spacing, so they look unlike the rest of the app. On a phone it shrinks the whole picture until labels are unreadable. The reader also loads the Mermaid library (`mermaid.min.js`, about 3.6 MB before compression, served from `public/vendor`) for every chapter that has one.

### How a fence becomes a component

- `server/src/shared/mdx/remark-mermaid.ts` turns a ```` ```mermaid ```` code node into `<MermaidDiagram chart="..." />` in the MDX tree. It runs in the reader (`frontend/src/mdx/compile.tsx`) and in `server/scripts/validate-course-source.ts`.
- `frontend/src/mdx/transform-visual-fences.ts` turns YAML fences (`quiz`, `diagram`, `walkthrough` and others) into tags by rewriting the text first.
- The importer (`server/scripts/import-course.ts`) leaves code fences untouched, so a fence is stored in the chapter exactly as written. No escaping rules apply to its body.
- `server/src/shared` is the contract code both apps run. `pnpm sync-shared` copies it to `frontend/src/shared`, and the files listed in `packages/learning-ui/contracts.json` to `packages/learning-ui/src/shared`.

### Validation

`server/src/shared/mdx/canvas-tags.ts` (`collectCanvasProblems`) checks `<InteractiveCanvas>` tags. It runs when a mentor publishes a chapter (`server/src/services/teach/chapters.ts`) and in `validate-course-source.ts`, which `courses:check` runs for Buildment-core. A bad slug fails with a plain sentence. Diagram checks plug in at the same two places.

### The canvas registry

`packages/learning-ui/src/canvas/registry.ts` maps about 1,100 slugs to specs. Each spec is TypeScript data in its own folder, and each new slug is added to `server/src/shared/canvas/slugs.ts` and synced. `CanvasForSpec` in `InteractiveCanvas.tsx` picks a renderer by `kind`. That suits canvases with a model behind them, but it is heavy for a picture: every new diagram would need code, a slug and an app release. The Buildment-core README and agent-ip proposal `2026-10-26-canvases-from-markdown.md` both ask for a portable format that does not need a release. This spec is that format for diagrams.

### How agent-ip asks for visuals

`00-principles.md`, `03-authoring-standards.md`, `04-interactive-playbook.md`, `10-interactive-canvases.md` and `11-visual-explanations.md` all say "start with live Mermaid". `scripts/audit-course.mjs` counts ```` ```mermaid ```` fences as diagrams. Feature opt-ins follow the listen-along audio pattern: a block in `course.yaml` checked by `server/scripts/course-source.ts`, a question in the brief (`08-templates.md`), and the orchestrator acting on the answer.

### The visual reference

The "Play" card on the landing page (`frontend/src/components/marketing/edorax/edorax-landing.tsx`): a cobalt `#2434E0` circle for "You", a white box with a 3px ink `#0A0F2C` border for "DNS", an ink box for "Server", a yellow `#FFC933` packet with an ink ring on the line, bold labels, on a tint `#E8EBFF` panel. No gradients, no shadows.

## Decisions

1. **A fence, not a slug.** Authors write ```` ```flow ```` or ```` ```sequence ```` in the chapter. A remark plugin, next to `remark-mermaid`, turns it into `<Diagram kind="flow" spec="..." />`. Nothing is registered per diagram, and a new diagram needs no app release.
2. **One shared core, two outputs.** `server/src/shared/diagram/` holds the parser, validator, layout, text alternative and a renderer-neutral scene (rectangles, circles, lines, text). The React component in `packages/learning-ui/src/diagram/` draws that scene with state (current step, packet position). `toSvg()` in the same shared folder writes the same scene as an SVG string, so the export needs no browser and matches the reader.
3. **Registry reuse.** `CanvasSpec` gains `kind: "diagram"` with a `source` string, so a canvas builder can register a diagram under a slug when it needs one (for example to reuse it in several chapters). The fence stays the normal path.
4. **Fail loudly.** Every line must match the grammar. An unknown line, an undeclared name, a packet hop that is not an arrow, or a label too long for a phone is an error with the line number and an example of the fix. Publishing and `courses:check` refuse the chapter. If a broken spec still reaches the reader (an old snapshot), it shows the problems in a note, never a half-drawn diagram.
5. **Phones first, no JavaScript needed to read.** The server renders the diagram. Each diagram is drawn twice, wide and compact, and a CSS container query shows the one that fits; this works before scripts load. Compact mode stacks a flow top to bottom and replaces sequence labels with numbers listed in full-size text below. Fonts are the app's DM Sans variable with system fallbacks; no font is downloaded for diagrams. A diagram adds a few kilobytes of SVG and no library.
6. **Fixed brand colours.** The diagram is a branded panel, like an image, so it uses the brand hex values in light and dark mode, and the export matches the reader exactly.
7. **Accessible.** The picture is `role="img"` with a text alternative generated from the spec (every part and every arrow in words). Steps use Back and Next buttons, the arrow keys while the controls have focus, and a polite live region. Dragging the packet is a pointer extra; every position is reachable with the keyboard. Targets are at least 44px.

## The spec grammar

One statement per line. Blank lines and lines starting with `#` are ignored.

```text
title: <text>                    required, up to 80 characters
direction: right | down          flow only, default right

actor <Name>                     a person (cobalt circle)
box <Name>                       a step or service (white box, ink border)
decision <Name>                  a question (white diamond, ink border); its answers label the arrows out
end <Name>                       where the flow is going (ink box)
store <Name>                     data that is kept (white cylinder)
external <Name>                  outside your system (dashed border)

A -> B                           an arrow
A -> B -> C                      a chain of arrows
A -> B: <label>                  a labelled arrow (single arrows only)
A --> B: <label>                 a dashed arrow, for a reply or an optional path
A --- B                          flow only: a plain line, joining two parts with no direction

packet: A -> B -> C              flow only: the yellow packet's path, one arrow per hop
```

Rules:
- Declare every name (anywhere in the spec). Names are matched without case and are up to 110 characters; past 60 the box gets wider and wraps to more lines. A name cannot contain `"`, `|` or a backtick. A name with `:` goes in quotes, everywhere it appears: `box "Step 1: plan"`, `"Step 1: plan" -> Review`.
- Labels are up to 60 characters. A label may contain `:`; everything after the first `:` outside quotes on an arrow line is the label.
- A flow has 2 to 12 parts and up to 16 arrows. A sequence has 2 to 5 parts and 1 to 12 arrows. Each packet hop must be an arrow in the diagram, in either direction.
- In a `sequence`, each arrow line is one step, in order. An arrow from a part to itself is an error.
- A `flow` with a `packet:` line is a step-through: Back and Next, or dragging, move the packet one hop, and the hop's arrow label is the step's caption.

Example:

````text
```flow
title: How your phone finds a website
actor You
box DNS
end Server
You -> DNS: Where is example.com?
DNS --> You: At 93.184.215.14
You -> Server: Send the page
packet: You -> DNS -> You -> Server
```
````

## Existing Mermaid diagrams, drawn automatically

Courses do not have to be rewritten to get the new design. `server/src/shared/diagram/from-mermaid.ts` turns a Mermaid `flowchart` (TD, TB or LR) or `sequenceDiagram` into a spec when it maps exactly, and the result must pass the same validation as a hand-written fence. Two places apply it. `remark-diagram` runs before `remark-mermaid` and draws a convertible ```` ```mermaid ```` fence with the Diagram block, titled by the Mermaid title or the closest heading above it. The `MermaidDiagram` component itself converts too, which covers the `<MermaidDiagram title="..." chart={...} legend="..." />` tags most older chapters use; the tag's title and legend are kept. Any later change to the Diagram block reaches all of these diagrams at once.

Mermaid shapes map as `{"..."}` to decision (a diamond), `[("...")]` to store, `(("..."))` to actor, and the rest to box.

Kept on Mermaid: state and entity diagrams, subgraphs, `&`, dotted lines without an arrow head, right-to-left or bottom-to-top flows, sequence notes, loops and blocks, a message from a part to itself, two parts with the same text, and anything over the size limits. A chart whose first line is `%% keep-mermaid` always stays on Mermaid.

On 2026-10-28, counting fences and tags together, this converted 1,162 of the 1,418 Mermaid diagrams in Buildment-core (82%), and 990 of the 1,289 in live chapters in production. The first release converted fences only, so the 645 tag diagrams (most of networking and system design) still showed Mermaid; a learner reported Networking 01.01. Styling lines (`style`, `classDef`, `class`, `linkStyle`, `click`) are dropped; the brand replaces them. A flow too wide for a reading column always uses the top-to-bottom layout.

## What gets built

| Piece | Where |
| --- | --- |
| Parser, validator, layout, scene, text alternative, `toSvg` | `server/src/shared/diagram/` (synced to the frontend and learning-ui) |
| Remark plugin and chapter checks | `server/src/shared/mdx/remark-diagram.ts`, `server/src/shared/mdx/diagram-fences.ts` |
| Publish and `courses:check` hooks | `server/src/services/teach/chapters.ts`, `server/scripts/validate-course-source.ts` |
| React components (flow, sequence, packet, steps) | `packages/learning-ui/src/diagram/` |
| Reader wiring | `frontend/src/mdx/compile.tsx`, `frontend/src/mdx/components.tsx` |
| Registry kind | `packages/learning-ui/src/canvas/registry.ts`, `InteractiveCanvas.tsx` |
| SVG export | `server/scripts/export-diagrams.ts` (`pnpm diagrams:export`) |
| `course.yaml` block | `server/scripts/course-source.ts` (`diagrams:`) |
| Tests | `server/tests/unit/shared/diagram/` |
| Gallery for local preview | `frontend/src/app/dev/diagrams/page.tsx` (development only) |

In Buildment-core, on a branch of its own:
- convert one Mermaid diagram in one chapter to the new fence;
- add the `diagrams:` block to that course's `course.yaml`;
- agent-ip: a Diagrams question in the brief, the orchestrator step, the fence in the visuals guide, the audit counting the new fences, and a decision-log entry (a separate, logged change, per `09-review-and-governance.md`).

## Not in this change

- Rewriting the Mermaid fences in course source. Most are drawn automatically (above); the rest keep working as Mermaid.
- State and entity diagrams. They stay on Mermaid until a third kind is designed.
- The desktop reader. It has its own lesson parser (`desktop/src/learning/parse-lesson.ts`); it can reuse the same component once that parser handles the fences.
- Theme work. The app redesign is happening on its own branch; diagrams use fixed brand colours and read the DM Sans variable if it is defined.
