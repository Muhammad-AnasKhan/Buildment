import { DM_Sans } from "next/font/google";
import { ChapterMdx } from "@/mdx/compile";

// Dev-only specimen sheet of the diagram fences, like /zz-lab-gallery. Public,
// no auth, no data. Each example goes through the real chapter pipeline
// (remark-diagram, then the Diagram block). The app redesign defines
// --font-dm-sans for every page; until it lands, this page loads it itself.
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

const TICKS = "```";

// kind "mdx" is chapter text used as written; the others are wrapped in a fence of that kind.
const EXAMPLES: { name: string; note: string; kind: "flow" | "sequence" | "mermaid" | "mdx"; spec: string }[] = [
  {
    name: "An existing MermaidDiagram tag, drawn automatically",
    note: "Most older chapters write Mermaid as a <MermaidDiagram> tag. The tag's title and legend are kept, and a plain line (---) is drawn without an arrowhead.",
    kind: "mdx",
    spec: `<MermaidDiagram title="Your phone on home Wi-Fi" chart={\`flowchart LR
  P["Phone: 10.0.0.12"] -->|"over Wi-Fi"| R["Router, home side: 10.0.0.1"]
  R --- O["Router, internet side: 198.51.100.7"]
  O -->|"to the internet"| S["The server sees 198.51.100.7"]
\`} legend="The router has one address on each side. The server only ever sees the outside one." />`,
  },
  {
    name: "An existing Mermaid fence, drawn automatically",
    note: "No edit to the chapter: a Mermaid flowchart that maps exactly is drawn as a Diagram, titled by its Mermaid title or the heading above it. Anything else stays on Mermaid.",
    kind: "mermaid",
    spec: `---
title: Writing a plan with your mentor
---
flowchart TD
  A["Step 1: write the plan"] -->|"share it"| B["Mentor reads it"]
  B --> C{"Clear enough?"}
  C -->|"yes"| D["Step 2: build"]
  C -.->|"not yet"| A`,
  },
  {
    name: "A straight path with a packet",
    note: "The landing page's Play card as a fence. Drag the yellow packet, or use Back and Next.",
    kind: "flow",
    spec: `title: Your request finds the server
actor You
box DNS
end Server
You -> DNS -> Server
packet: You -> DNS -> Server`,
  },
  {
    name: "A reply and a second request",
    note: "A dashed arrow is a reply. The packet goes back along it.",
    kind: "flow",
    spec: `title: How your phone finds a website
actor You
box DNS
end Server
You -> DNS: Where is example.com?
DNS --> You: At 93.184.215.14
You -> Server: Send the page
packet: You -> DNS -> You -> Server`,
  },
  {
    name: "A sequence, step by step",
    note: "Each arrow line is one step. On a phone the arrows are numbered and listed in full below.",
    kind: "sequence",
    spec: `title: Your phone looks up a name
actor You
box DNS resolver
end Web server
You -> DNS resolver: Which address is example.com?
DNS resolver --> You: It is 93.184.215.14
You -> Web server: Send me the page
Web server --> You: Here is the page`,
  },
  {
    name: "Every kind of part, top to bottom",
    note: "actor, box, external (dashed), store (cylinder) and end (ink).",
    kind: "flow",
    spec: `title: What happens when you place an order
direction: down
actor Customer
box Shop app
external Payment provider
store Orders
end Courier
Customer -> Shop app: taps Pay
Shop app -> Payment provider: charge 1,200
Payment provider --> Shop app: approved
Shop app -> Orders: save the order
Orders -> Courier: ready to pack`,
  },
  {
    name: "Two paths with branches",
    note: "The Mermaid diagram in Building Habits 01.01, converted. On a phone the three outcomes share one row.",
    kind: "flow",
    spec: `title: Rami's Tuesday evening as two paths
direction: down
box Rami sits down after dinner
box Hand picks up the phone
box 40 minutes of videos and messages
box The laptop is free
box Should I study now?
box Later, then tomorrow
box 30 minutes of study
Rami sits down after dinner -> Hand picks up the phone: no choice made
Hand picks up the phone -> 40 minutes of videos and messages
The laptop is free -> Should I study now?
Should I study now? -> Later, then tomorrow: tired
Should I study now? -> 30 minutes of study: some evenings`,
  },
  {
    name: "A mistake fails loudly",
    note: "Publishing and courses:check refuse this chapter. If one ever reaches the reader, it shows the problems, not a picture.",
    kind: "flow",
    spec: `title: A typo
actor You
box Server
You -> Sever
draw an arrow to the server`,
  },
];

export default function DiagramGalleryPage() {
  return (
    <main className={`${dmSans.variable} mx-auto w-full max-w-[1200px] px-4 py-6`}>
      <h1 className="mb-1 text-xl font-semibold">Diagram fences</h1>
      <p className="mb-6 max-w-[70ch] text-sm text-muted-foreground">
        Each example is a {TICKS}flow or {TICKS}sequence fence in a chapter, shown with the text an author writes. See
        docs/diagram-components-plan.md for the grammar. Dev only.
      </p>
      <div className="space-y-10">
        {EXAMPLES.map((example) => (
          <section key={example.name} className="grid gap-4 border-t border-border pt-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">{example.name}</h2>
              <p className="mb-3 text-sm text-muted-foreground">{example.note}</p>
              {/* No ligatures, so "->" shows as typed, not as an arrow glyph. */}
              <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 text-[13px] leading-relaxed [font-variant-ligatures:none]">
                {source(example)}
              </pre>
            </div>
            <div className="min-w-0 [&_figure]:my-0 [&>div>div]:my-0">
              <ChapterMdx source={`${source(example)}\n`} />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function source(example: (typeof EXAMPLES)[number]): string {
  return example.kind === "mdx" ? example.spec : `${TICKS}${example.kind}\n${example.spec}\n${TICKS}`;
}
