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
  | "entity-diagram"
  | "video"
  | "walkthrough"
  | "diagram"
  | "roadmap"
  | "faq"
  | "big-word"
  | "must-read"
  | "interesting-read"
  | "real-world"
  | "checkpoint-intro"
  | "api-request"
  | "diff"
  | "trace-request"
  | "project-preview"
  | "learning-objectives"
  | "chapter-recap";

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
  <CompareColumn label="Approach A" content="Explain when this approach is useful." />
  <CompareColumn label="Approach B" content="Explain the trade-off of this approach." />
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
    case "entity-diagram":
      return withSpacing(`
<EntityDiagram
  title="Data relationships"
  chart={"erDiagram\\n  ORGANIZATION ||--o{ USER : contains\\n  USER ||--o{ POST : writes"}
/>
`);
    case "faq":
      return withSpacing(`
<FaqGroup title="Common Questions">
  <FaqItem question="Why do we use this pattern?" answer="Explain the reasoning, trade-offs, and why alternatives were not chosen." />
  <FaqItem question="What should you check if something fails?" answer="Describe common debugging steps, log messages to check, or configuration traps." />
</FaqGroup>
`);
    case "big-word":
      return withSpacing(`
<BigWordAlert
  term="Idempotency"
  plainEnglish="An operation can be applied multiple times without changing the result beyond the initial application."
  whyItMatters="Retrying a failed payment or webhook won't accidentally charge the user twice."
/>
`);
    case "must-read":
      return withSpacing(`
<MustRead
  title="Essential Guide"
  url="https://example.com/guide"
  description="Read this before continuing to understand the core pattern and avoid common pitfalls."
  source="Official Documentation"
  readMinutes={8}
/>
`);
    case "interesting-read":
      return withSpacing(`
<InterestingRead
  title="How distributed systems handle consistency"
  hook="Ever wondered why your bank balance takes seconds to update across multiple ATMs?"
  readMinutes={5}
>
  Explain the background story, interesting engineering trivia, or deeper architectural context here.
</InterestingRead>
`);
    case "real-world":
      return withSpacing(`
<RealWorldEvent
  title="The Knight Capital Glitch"
  when="August 2012"
  summary="A deployment misconfiguration caused an obsolete test code path to trigger 4 million unintended trades in 45 minutes, losing $440 million."
  lesson="Always use feature flags, automated rollout verification, and automated circuit breakers."
/>
`);
    case "checkpoint-intro":
      return withSpacing(`
<CheckpointIntro title="Before you begin" content="This checkpoint verifies that your local environment is configured and ready for the build." />
`);
    case "api-request":
      return withSpacing(`
<ApiRequestPanel title="User Authentication Endpoints">
  <ApiRequest
    method="POST"
    url="/api/v1/auth/login"
    responseStatus={200}
    description="Authenticate user with email and password."
  />
  <ApiRequest
    method="GET"
    url="/api/v1/users/me"
    responseStatus={200}
    description="Retrieve currently authenticated user profile."
  />
</ApiRequestPanel>
`);
    case "diff":
      return withSpacing(`
<DiffBlock
  title="Update configuration"
  language="typescript"
  before="// Previous code\\nexport const timeout = 1000;"
  after="// Updated code\\nexport const timeout = 5000;\\nexport const retries = 3;"
/>
`);
    case "trace-request":
      return withSpacing(`
<TraceRequest title="Trace the checkout request">
  <TraceStep actor="Client" label="Submit payment" detail="Browser sends payment intent token to server" />
  <TraceStep actor="API" label="Validate payload" detail="Check request signature and payload schema" status={200} />
  <TraceStep actor="Data" label="Save order" detail="Insert order into database within transaction" status={200} />
</TraceRequest>
`);
    case "project-preview":
      return withSpacing(`
<ProjectPreview
  title="Real-time Multi-Vendor Marketplace"
  description="Build a production-grade marketplace with stripe payments and webhook handling."
  features={["Multi-tenant schema", "Webhook idempotent processor", "Real-time order tracker"]}
  techStack={["Next.js", "Prisma", "PostgreSQL", "Tailwind CSS"]}
/>
`);
    case "learning-objectives":
      return withSpacing(`
<LearningObjectives
  objectives={[
    "Understand the core architecture principles",
    "Implement the initial database schema with tenant isolation",
    "Verify the setup using automated integration tests"
  ]}
/>
`);
    case "chapter-recap":
      return withSpacing(`
<ChapterRecap
  points={[
    "Configured the development environment and database connections.",
    "Established tenant boundaries in database models.",
    "Verified the baseline health-check endpoint."
  ]}
/>
`);
  }
}
