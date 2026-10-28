import { DM_Sans } from "next/font/google";
import { ChapterMdx } from "@/mdx/compile";

// Dev-only specimen sheet of the diagram fences, like /zz-lab-gallery. Public,
// no auth, no data. Each example goes through the real chapter pipeline
// (remark-diagram, then the Diagram block). The app redesign defines
// --font-dm-sans for every page; until it lands, this page loads it itself.
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

const TICKS = "```";

const EXAMPLES: { name: string; note: string; kind: "flow" | "sequence"; spec: string }[] = [
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
    name: "Branches",
    note: "The Building Habits diagram this branch converts from Mermaid.",
    kind: "flow",
    spec: `title: Two evenings, two habits
actor Rami
box Picks up the phone
box 40 minutes of videos
box Should I study now?
box Later, then tomorrow
end 30 minutes of study
Rami -> Picks up the phone: no choice made
Picks up the phone -> 40 minutes of videos
Rami -> Should I study now?: a free laptop
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
                {`${TICKS}${example.kind}\n${example.spec}\n${TICKS}`}
              </pre>
            </div>
            <div className="min-w-0 [&_figure]:my-0 [&>div>div]:my-0">
              <ChapterMdx source={`${TICKS}${example.kind}\n${example.spec}\n${TICKS}\n`} />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
