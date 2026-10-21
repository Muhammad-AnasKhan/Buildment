import type { ReactNode } from "react";
import { QuizComponent } from "@/blocks/quiz/Component";
import { PredictComponent } from "@/blocks/predict/Component";
import { OpenQuestionComponent } from "@/blocks/open-question/Component";
import { CodeExerciseComponent } from "@/blocks/code/Component";
import { StepsComponent } from "@/blocks/steps/Component";
import { Step } from "@/blocks/steps/Step";
import { ProjectPreviewComponent } from "@/blocks/project-preview/Component";
import { LearningObjectivesComponent } from "@/blocks/learning-objectives/Component";
import { ChapterRecapComponent } from "@/blocks/chapter-recap/Component";
import { MustReadComponent } from "@/blocks/must-read/Component";
import { VideoComponent } from "@/blocks/video/Component";
import { VisualWalkthroughComponent } from "@/blocks/visual-walkthrough/Component";
import { VisualDiagramComponent } from "@/blocks/visual-diagram/Component";
import { RoadmapComponent } from "@/blocks/roadmap/Component";
import { PendingBlockCard } from "@/components/learn/pending-block-card";
import { Checklist } from "@/components/learn/checklist";
import { LearningLog } from "@/components/learn/learning-log";
import { GlossaryTerm } from "@/components/learn/glossary-term";
import { MermaidDiagram } from "@/components/learn/mermaid-diagram";
import { Callout } from "@/components/learn/callout";
import { FaqGroup, FaqItem } from "@/components/learn/faq-group";
import { CheckpointIntro } from "@/components/learn/checkpoint-intro";
import { BigWordAlert } from "@/components/learn/big-word-alert";
import { InterestingRead } from "@/components/learn/interesting-read";
import { RealWorldEvent } from "@/components/learn/real-world-event";
import { ApiRequestPanel, ApiRequest } from "@/components/learn/api-request-panel";
import {
  ArchitectureDiagram, ArchNode, CompareColumn, ComparePanel, DiffBlock,
  FileTree, FileTreeItem, TerminalBlock, TerminalLine, TraceRequest, TraceStep,
} from "@/components/learn/content-blocks";
import { InteractiveCanvas } from "@/canvas/InteractiveCanvas";
import { CANVAS_SLUGS } from "@/shared/canvas/slugs";
import { MDX_COMPONENT_NAMES } from "@/shared/mdx/component-allowlist";

const contentElementCount = MDX_COMPONENT_NAMES.length - 1; // Exclude this gallery utility.
const blockTypes = [
  "VIDEO", "VISUAL_WALKTHROUGH", "VISUAL_DIAGRAM", "ROADMAP", "MUST_READ",
  "QUIZ", "OPEN_QUESTION", "STEPS", "PROJECT_PREVIEW", "LEARNING_OBJECTIVES",
  "CHAPTER_RECAP", "CODE", "PREDICT",
];

function GalleryGroup({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <details className="not-prose my-5 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <summary className="cursor-pointer bg-muted/50 px-5 py-4 text-base font-semibold text-foreground marker:text-muted-foreground">
        {title}
        <span className="mt-1 block text-sm font-normal text-muted-foreground">{description}</span>
      </summary>
      <div className="space-y-8 border-t border-border px-4 py-5 sm:px-6">{children}</div>
    </details>
  );
}

function Sample({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section aria-label={`${name} example`} className="border-b border-border pb-7 last:border-b-0 last:pb-0">
      <code className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-foreground">{name}</code>
      <div className="mt-3 [&_.my-8]:my-4 [&_.my-10]:my-4">{children}</div>
    </section>
  );
}

/** A review surface for the existing authorable MDX elements. Examples are local previews. */
export function EcosystemGallery() {
  return (
    <div className="not-prose my-8" data-ecosystem-gallery>
      <div className="rounded-2xl border border-border bg-muted/40 p-5 text-sm text-foreground sm:p-6">
        <p className="text-lg font-semibold">Current ecosystem inventory</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <p><strong className="block text-2xl">{blockTypes.length}</strong> registered block types</p>
          <p><strong className="block text-2xl">{contentElementCount}</strong> authorable MDX elements</p>
          <p><strong className="block text-2xl">{CANVAS_SLUGS.length}</strong> interactive canvas examples</p>
        </div>
        <p className="mt-3 text-muted-foreground">The MDX count includes aliases and child tags such as Step and FileTreeItem. TEST exists in the database enum but has no renderer or grader yet.</p>
      </div>

      <GalleryGroup title="Assessments and actions" description="Quiz, prediction, written response, code, steps, checklist, and learning log.">
        <Sample name="Quiz"><QuizComponent prompt="Which layer owns ticket inventory rules?" options={[{ id: "web", label: "Web" }, { id: "api", label: "API" }]} correctOptionIds={["api"]} explanation="The API enforces inventory rules for every client." /></Sample>
        <Sample name="Predict"><PredictComponent prompt="A browser sends an event request. Which service reads Postgres?" options={[{ id: "web", label: "Next.js" }, { id: "api", label: "Express API" }]} correctOptionId="api" explanation="The API owns database access." /></Sample>
        <Sample name="OpenQuestion"><OpenQuestionComponent prompt="Describe where you would validate an event publish request." minWords={5} /></Sample>
        <Sample name="CodeExercise"><CodeExerciseComponent prompt="Try the editor and hints for a capacity check." language="javascript" mode="exercise" starterCode="const capacity = 100;\nconst sold = 72;\nconst held = 8;\nmodule.exports = sold + held <= capacity;" hints={["Add sold and held, then compare the total with capacity."]} /></Sample>
        <Sample name="Steps + Step"><StepsComponent title="Request path"><ol><Step stepNumber={1} title="Browser">Send a same-origin API request.</Step><Step stepNumber={2} title="API">Validate, authorize, and query Postgres.</Step></ol></StepsComponent></Sample>
        <Sample name="Checklist"><Checklist section="Review this architecture" items={[{ id: "gallery-trust", label: "Find the trust boundary" }, { id: "gallery-data", label: "Find the data owner" }]} /></Sample>
        <Sample name="LearningLog"><LearningLog title="Review notes" instruction="Try saving a note while inspecting these components." questions={[{ id: "gallery-note", title: "What would you change?" }]} /></Sample>
      </GalleryGroup>

      <GalleryGroup title="Registered presentation blocks" description="Project context, objectives, recap, media, diagrams, and roadmap.">
        <Sample name="ProjectPreview"><ProjectPreviewComponent title="Ticketline" description="An event ticketing app with inventory and checkout." features={["Organizer workspace", "Seat holds", "Ticket scanning"]} techStack={["Next.js", "Express", "PostgreSQL"]} /></Sample>
        <Sample name="LearningObjectives"><LearningObjectivesComponent objectives={["Trace a browser request from the Next.js app through the API to Postgres.", "Identify which service validates input and enforces ticket capacity.", "Explain why database credentials stay outside the browser."]} /></Sample>
        <Sample name="ChapterRecap"><ChapterRecapComponent points={["Secrets stay on the server.", "The API owns business rules and data access."]} /></Sample>
        <Sample name="MustRead + MandatoryReadCard"><p className="text-sm text-muted-foreground"><code>MustRead</code> loads the reading and saved progress. <code>MandatoryReadCard</code> renders the card you see below.</p><MustReadComponent title="The Twelve-Factor App — Config" url="https://12factor.net/config" description="A sample required reading card. Its checkbox is local to this gallery." source="12factor.net" readMinutes={8} /></Sample>
        <Sample name="VideoBlock"><VideoComponent title="Video player preview" sourceUrl="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" caption="Sample media for checking the player layout; replace it with course media." /></Sample>
        <Sample name="VisualWalkthrough"><VisualWalkthroughComponent title="Ticketline visual walkthrough" steps={[{ id: "request", title: "Request path", description: "Follow a browser request through the API to Postgres. The API owns rules and secrets.", imageUrl: "/course-assets/ticketline/walkthrough-request.svg", alt: "Browser to API to Postgres request path with the API trust boundary highlighted" }, { id: "capacity", title: "Capacity rule", description: "See how sold and held tickets fit within the ticket type capacity.", imageUrl: "/course-assets/ticketline/walkthrough-capacity.svg", alt: "Ticket capacity diagram showing 72 sold plus 8 held is within 100 seats" }]} /></Sample>
        <Sample name="VisualDiagram"><VisualDiagramComponent title="Ticketline data model" imageUrl="/course-assets/ticketline/er-model.svg" alt="Ticketline data model" caption="Use Expand to inspect the full diagram." kind="system" /></Sample>
        <Sample name="Roadmap"><RoadmapComponent title="Ticketline build path" milestones={[{ id: "foundation", title: "Foundation", description: "Architecture and schema", state: "current" }, { id: "checkout", title: "Checkout", description: "Inventory and payments", state: "upcoming" }, { id: "ship", title: "Ship", description: "Verification and deployment", state: "goal" }]} /></Sample>
      </GalleryGroup>

      <GalleryGroup title="Explanation and reference cards" description="Reading aids, diagrams, API examples, and status cards.">
        <Sample name="PendingBlock + PendingBlockCard"><p className="text-sm text-muted-foreground">Both MDX names render this same placeholder while a block is being configured.</p><PendingBlockCard typeLabel="Pending block" title="Sample pending block" description="A course author sees this while content is being prepared." /></Sample>
        <Sample name="GlossaryTerm"><p className="text-sm">The <GlossaryTerm term="trust boundary" definition="The point where untrusted browser input enters server-controlled code." /> separates browser and API.</p></Sample>
        <Sample name="Callout"><Callout type="info" title="Architecture note">Only the API receives server secrets.</Callout></Sample>
        <Sample name="FaqGroup + FaqItem"><FaqGroup title="Architecture FAQ"><FaqItem question="Where do pricing rules live?">In the API, beside authorization and inventory.</FaqItem></FaqGroup></Sample>
        <Sample name="CheckpointIntro"><CheckpointIntro title="Before you begin" content="Trace the request path above, then answer the checkpoint questions below. You can return to the diagram while you work." /></Sample>
        <Sample name="BigWordAlert"><BigWordAlert term="Idempotency" plainEnglish="Repeating a request has the same effect as doing it once." whyItMatters="A retried webhook must not issue duplicate tickets." /></Sample>
        <Sample name="InterestingRead"><InterestingRead title="Why hold expiry matters" hook="A held seat is unavailable until its timer expires." readMinutes={3}>A queue can release it close to the deadline.</InterestingRead></Sample>
        <Sample name="RealWorldEvent"><RealWorldEvent title="Duplicate webhook delivery" when="Checkout" summary="Payment providers can deliver the same event more than once." lesson="Store processed event IDs before issuing tickets." /></Sample>
        <Sample name="ApiRequestPanel + ApiRequest"><ApiRequestPanel title="Catalogue API"><ApiRequest method="GET" url="/api/v1/events" responseStatus={200} responseBody={'{"success":true,"data":{"items":[]}}'} /></ApiRequestPanel></Sample>
      </GalleryGroup>

      <GalleryGroup title="Architecture and code visuals" description="Compare, repository tree, terminal, diff, flow, and trace components.">
        <Sample name="ComparePanel + CompareColumn"><ComparePanel title="Where a rule lives"><CompareColumn label="Web" content="Display state and collect input." /><CompareColumn label="API" content="Validate, authorize, and write data." /></ComparePanel></Sample>
        <Sample name="FileTree + FileTreeItem"><FileTree title="Ticketline sample tree" root="ticketline/"><FileTreeItem path="apps/web/src/app/" /><FileTreeItem path="apps/api/src/index.ts" new /><FileTreeItem path="packages/shared/src/" /></FileTree></Sample>
        <Sample name="TerminalBlock + TerminalLine"><TerminalBlock title="Start local services" cwd="ticketline"><TerminalLine type="prompt">docker compose up -d</TerminalLine><TerminalLine type="output">Postgres, Redis, and MinIO started</TerminalLine></TerminalBlock></Sample>
        <Sample name="DiffBlock"><DiffBlock title="Move a secret out of the browser" language="typescript" before={'export const config = {\n  key: process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY,\n  retries: 0,\n};'} after={'export const config = {\n  key: process.env.STRIPE_SECRET_KEY,\n  retries: 3,\n};'} /></Sample>
        <Sample name="ArchitectureDiagram + ArchNode"><ArchitectureDiagram title="Ticketline request boundary"><ArchNode layer="Client">Browser</ArchNode><ArchNode layer="API">Express API</ArchNode><ArchNode layer="Data">PostgreSQL</ArchNode></ArchitectureDiagram></Sample>
        <Sample name="TraceRequest + TraceStep"><TraceRequest title="Publish an event"><TraceStep actor="Client" label="Submit form" /><TraceStep actor="API" label="Authorize organizer" status={200} /><TraceStep actor="DB" label="Commit status" status={200} /></TraceRequest></Sample>
        <Sample name="MermaidDiagram"><MermaidDiagram title="Service flow" chart={'flowchart LR\n  Browser --> API\n  API --> Postgres'} /></Sample>
        <Sample name="StateMachine"><MermaidDiagram title="Event states" chart={'stateDiagram-v2\n  [*] --> Draft\n  Draft --> Published'} /></Sample>
        <Sample name="EntityDiagram"><MermaidDiagram title="Event relationship" chart={'erDiagram\n  EVENT ||--o{ TICKET_TYPE : has'} /></Sample>
      </GalleryGroup>

      <GalleryGroup title="Interactive canvases" description="All three currently registered canvas slugs; two use FreshMarket examples.">
        <Sample name="InteractiveCanvas: weighted-matrix-two-offers"><p className="text-sm text-muted-foreground">Reusable weighted comparison simulator. Change the weights to test how the result moves.</p><InteractiveCanvas slug="weighted-matrix-two-offers" /></Sample>
        <Sample name="InteractiveCanvas: ticketline-seat-hold-race"><p className="text-sm text-muted-foreground">Custom Ticketline simulator. It uses its own model and controls while keeping the same canvas review contract.</p><InteractiveCanvas slug="ticketline-seat-hold-race" /></Sample>
        <Sample name="InteractiveCanvas: freshmarket-order-status"><InteractiveCanvas slug="freshmarket-order-status" /></Sample>
        <Sample name="InteractiveCanvas: freshmarket-mark-packed"><InteractiveCanvas slug="freshmarket-mark-packed" /></Sample>
      </GalleryGroup>
    </div>
  );
}
