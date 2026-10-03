import { ulid } from "ulid";

export type ContentTemplateId =
  | "section"
  | "callout"
  | "glossary"
  | "checklist"
  /** Legacy template identifier retained for existing editor links. */
  | "gate-checklist"
  | "evidence-checklist"
  | "learning-log"
  | "compare"
  | "file-tree"
  | "terminal"
  | "architecture"
  | "state-machine"
  | "video"
  | "walkthrough"
  | "diagram"
  | "roadmap";

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
    case "glossary":
      return withSpacing(`
Use <GlossaryTerm term="tenant isolation" definition="Keeping one vendor's data inaccessible to every other vendor." /> whenever a technical term needs a quick explanation.
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
    case "evidence-checklist":
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
  title="Share what you learned"
  instruction="Capture the decisions you made and how you know they work. Your notes save automatically."
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
<MermaidDiagram
  title="State changes"
  chart={"stateDiagram-v2\\n  [*] --> Draft\\n  Draft --> Published\\n  Published --> [*]"}
/>
`);
    case "video":
      return withSpacing(`
\`\`\`video
title: Short concept walkthrough
sourceUrl: https://www.youtube.com/watch?v=VIDEO_ID
caption: Explain what the learner should notice.
\`\`\`
`);
    case "walkthrough":
      return withSpacing(`
\`\`\`walkthrough
title: Follow the request step by step
steps:
  - id: request
    title: Send the request
    description: The browser sends the selected items to the API.
    imageUrl: https://images.example.com/request.png
    alt: Browser request arrow pointing to the API route
  - id: response
    title: Read the response
    description: The API returns the saved order and its current status.
    imageUrl: https://images.example.com/response.png
    alt: API response showing an order confirmation
\`\`\`
`);
    case "diagram":
      return withSpacing(`
\`\`\`diagram
title: Request boundary
kind: system
imageUrl: https://images.example.com/request-boundary.png
alt: Browser, API and database connected by a request flow
caption: Every request establishes the vendor boundary before querying data.
\`\`\`
`);
    case "roadmap":
      return withSpacing(`
\`\`\`roadmap
title: Your path through this project
milestones:
  - id: foundation
    title: Build the foundation
    description: Set up the project and verify the first request.
    state: current
  - id: feature
    title: Add the core feature
    description: Build the workflow learners can demonstrate.
    state: upcoming
  - id: launch
    title: Launch the project
    description: Polish, deploy, and explain your decisions.
    state: goal
\`\`\`
`);
  }
}
