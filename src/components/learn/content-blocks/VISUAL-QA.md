# Learn content blocks — visual QA criteria

Reference components for spacing, typography, and color discipline:

- Panel chrome: `src/components/learn/api-request-panel.tsx`
- Graded interaction: `src/blocks/quiz/QuizClient.tsx`
- Terminal surface: `src/blocks/code/CodeExerciseClient.tsx` (`#0d1117`)
- Diagram chrome: `src/components/learn/mermaid-diagram.tsx`

All presentation blocks use `LearnPanelShell` with a fixed eyebrow set.

## Acceptance checklist

| Block | Pass criteria |
|---|---|
| **LearnPanelShell** | `not-prose my-10`, `rounded-2xl`, indigo eyebrow only as accent, `aria-label` on section |
| **ComparePanel** | Two columns on `lg+`, divided headers, no nested cards |
| **FileTree** | Monospace paths, `highlight` → indigo row, `new` pill, folder/file icons |
| **TerminalBlock** | `#0d1117` body, `$` prompt prefix, cwd chip in header |
| **DiffBlock** | Side-by-side on `lg+`, unified diff on mobile, muted red/green |
| **ArchitectureDiagram** | Vertical stack, layer-colored nodes, downward arrows |
| **StateMachine** | Mermaid `stateDiagram` inside shell, handDrawn theme inherited |
| **EntityDiagram** | Mermaid `erDiagram` + optional legend footer |
| **TraceRequest** | Step timeline, Prev/Next + arrow keys, `aria-live="polite"` |
| **PredictBlock** | Predict eyebrow, optional context strip, Quiz-like options |

## Anti-patterns (reject in review)

- Purple gradients on everything
- More than one eyebrow + title per panel
- Terminal/diff using a second color scheme (must use `#0d1117`)
- Saturated GitHub-neon diff colors (use `red-50` / `emerald-50` family)
- Card-in-card-in-card nesting

## Regression

- Existing `ApiRequestPanel` chapters render unchanged
- Existing `MermaidDiagram` inline blocks render unchanged
- Mobile width (~375px): DiffBlock stacks; ComparePanel stacks
- TraceRequest keyboard navigation works without mouse
