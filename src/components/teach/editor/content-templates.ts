import { ulid } from "ulid";

export type ContentTemplateId =
  | "section"
  | "callout"
  | "checklist"
  | "gate-checklist"
  | "learning-log"
  | "compare"
  | "file-tree"
  | "terminal"
  | "architecture"
  | "state-machine";

const withSpacing = (markdown: string) => `\n\n${markdown.trim()}\n\n`;

export function createContentTemplate(templateId: ContentTemplateId): string {
  switch (templateId) {
    case "section":
      return withSpacing(`
## Section title

Introduce the idea, explain why it matters, and connect it to the learner's project.
`);
    case "callout":
      return withSpacing(`
<Callout type="info" title="Key idea">
Explain the important detail the learner should remember.
</Callout>
`);
    case "checklist":
      return withSpacing(`
<Checklist
  section="Try it yourself"
  items={${JSON.stringify([
    { id: ulid(), label: "Complete the first task" },
    { id: ulid(), label: "Verify the result" },
    { id: ulid(), label: "Explain what you observed" },
  ])}}
/>
`);
    case "gate-checklist":
      return withSpacing(`
<Checklist
  section="Milestone evidence"
  isGate={true}
  items={${JSON.stringify([
    { id: ulid(), label: "I can demonstrate the completed feature" },
    { id: ulid(), label: "I tested the important failure case" },
    { id: ulid(), label: "I can explain why this solution works" },
  ])}}
/>
`);
    case "learning-log":
      return withSpacing(`
<LearningLog
  title="Reflect on your work"
  instruction="Answer in your own words. Your notes save automatically."
  questions={${JSON.stringify([
    {
      id: ulid(),
      title: "What did you change?",
      hint: "Describe the most important implementation decision.",
    },
    {
      id: ulid(),
      title: "How did you verify it?",
      hint: "Name the evidence that tells you it works.",
    },
  ])}}
/>
`);
    case "compare":
      return withSpacing(`
<ComparePanel title="Compare the approaches">
  <CompareColumn label="Approach A">
    Explain when this approach is useful.
  </CompareColumn>
  <CompareColumn label="Approach B">
    Explain the trade-off of this approach.
  </CompareColumn>
</ComparePanel>
`);
    case "file-tree":
      return withSpacing(`
<FileTree title="Project files" root="src">
  <FileTreeItem path="feature/" highlight />
  <FileTreeItem path="feature/index.ts" new />
</FileTree>
`);
    case "terminal":
      return withSpacing(`
<TerminalBlock title="Run the project" cwd="project">
  <TerminalLine type="command">npm run dev</TerminalLine>
  <TerminalLine type="output">Ready on http://localhost:3000</TerminalLine>
</TerminalBlock>
`);
    case "architecture":
      return withSpacing(`
<ArchitectureDiagram title="Request flow">
  <ArchNode layer="Client">Browser</ArchNode>
  <ArchNode layer="API">Route handler</ArchNode>
  <ArchNode layer="Data">Database</ArchNode>
</ArchitectureDiagram>
`);
    case "state-machine":
      return withSpacing(`
<StateMachine
  title="State changes"
  chart={"stateDiagram-v2\\n  [*] --> Draft\\n  Draft --> Published\\n  Published --> [*]"}
/>
`);
  }
}
