import { describe, expect, it } from "vitest";
import { mermaidToDiagram } from "../../../../src/shared/diagram/from-mermaid.js";

describe("mermaidToDiagram", () => {
  it("converts a flowchart with labels, shapes, quoted names and a dashed arrow", () => {
    const chart = [
      "flowchart TD",
      '  A["Rami sits down"] -->|"no choice made"| B["Hand picks up the phone"]',
      "  B --> C[(Saved videos)]",
      "  U((Rami)) -. later .-> D{Should I study now?}",
      '  D -- tired --> E["Step 2: later"]',
      "  style A fill:#eef2ff",
    ].join("\n");
    expect(mermaidToDiagram(chart, "An evening")).toEqual({
      kind: "flow",
      source: [
        "title: An evening",
        "direction: down",
        "box Rami sits down",
        "box Hand picks up the phone",
        "store Saved videos",
        "actor Rami",
        "decision Should I study now?",
        'box "Step 2: later"',
        "Rami sits down -> Hand picks up the phone: no choice made",
        "Hand picks up the phone -> Saved videos",
        "Rami --> Should I study now?: later",
        'Should I study now? -> "Step 2: later": tired',
      ].join("\n"),
    });
  });

  it("uses the Mermaid title over the fallback, and LR as right", () => {
    const converted = mermaidToDiagram("---\ntitle: Pipeline\n---\nflowchart LR\n  A[Load] --> B[Embed]", "Heading");
    expect(converted?.source.split("\n").slice(0, 2)).toEqual(["title: Pipeline", "direction: right"]);
  });

  it("lets a MermaidDiagram tag's own title win", () => {
    const converted = mermaidToDiagram("---\ntitle: Pipeline\n---\nflowchart LR\n  A[Load] --> B[Embed]", "Heading", "From the tag");
    expect(converted?.source.split("\n")[0]).toBe("title: From the tag");
  });

  // The diagram a learner reported in Networking 01.01, written as a <MermaidDiagram> tag.
  it("converts plain lines and longer arrows, as in Networking 01.01", () => {
    const chart = [
      "flowchart LR",
      '  A["Your computer says 192.168.1.23"] -->|"your home side"| B["Router, inside: 192.168.1.1"]',
      '  B --- C["Router, outside: 203.0.113.45"]',
      '  C --->|"the internet side"| D["The website sees 203.0.113.45"]',
      "",
    ].join("\n");
    expect(mermaidToDiagram(chart, undefined, "One computer, two numbers")?.source).toBe([
      "title: One computer, two numbers",
      "direction: right",
      "box Your computer says 192.168.1.23",
      'box "Router, inside: 192.168.1.1"',
      'box "Router, outside: 203.0.113.45"',
      "box The website sees 203.0.113.45",
      'Your computer says 192.168.1.23 -> "Router, inside: 192.168.1.1": your home side',
      '"Router, inside: 192.168.1.1" --- "Router, outside: 203.0.113.45"',
      '"Router, outside: 203.0.113.45" -> The website sees 203.0.113.45: the internet side',
    ].join("\n"));
  });

  it("converts a sequence diagram with participants and replies", () => {
    const chart = "sequenceDiagram\n  autonumber\n  actor U as Shopper\n  participant A as API\n  U->>A: POST /orders\n  A-->>U: 201 Created";
    expect(mermaidToDiagram(chart, "Placing an order")).toEqual({
      kind: "sequence",
      source: "title: Placing an order\nactor Shopper\nbox API\nShopper -> API: POST /orders\nAPI --> Shopper: 201 Created",
    });
  });

  it("expands & and keeps dotted lines, loops and messages to self", () => {
    expect(mermaidToDiagram("flowchart TD\n  A & B --> C\n  C -.-|together| A\n  C --> C", "T")?.source.split("\n").slice(5)).toEqual(["A -> C", "B -> C", "C -.- A: together", "C -> C"]);
    expect(mermaidToDiagram("sequenceDiagram\n  A->>B: hi\n  B->>B: think", "T")?.source).toContain("B -> B: think");
  });

  it("turns subgraphs into groups, placing a node where it gets its text", () => {
    const chart = 'flowchart LR\n  S["Phones"] -->|every request| App\n  subgraph Server["One rented server"]\n    direction TB\n    App["App code"] --> DB[("Database")]\n  end';
    expect(mermaidToDiagram(chart, "T")?.source.split("\n").slice(1)).toEqual([
      "direction: right",
      "box Phones",
      "group One rented server",
      "  box App code",
      "  store Database",
      "end",
      "Phones -> App code: every request",
      "App code -> Database",
    ]);
  });

  it("points an arrow at a whole subgraph by its [id], and draws RL and BT mirrored", () => {
    expect(mermaidToDiagram("flowchart BT\n  A --> G\n  subgraph G[Lock service]\n    B --- C\n  end", "T")?.source.split("\n").slice(1)).toEqual([
      "direction: down",
      "box A",
      "group [G] Lock service",
      "  box B",
      "  box C",
      "end",
      "A -> [G]",
      "B --- C",
    ]);
  });

  it("turns an entity diagram into entity cards joined by labelled lines", () => {
    const chart = 'erDiagram\n  ACCOUNT ||--o{ POST : writes\n  ACCOUNT {\n    bigint account_id PK\n    string name "shown on posts"\n  }\n  POST }o..|| TOPIC : "filed under"';
    expect(mermaidToDiagram(chart, "T")?.source.split("\n").slice(1)).toEqual([
      "direction: right",
      'entity ACCOUNT | account_id (bigint, PK) | name (string) shown on posts',
      "entity POST",
      "entity TOPIC",
      "ACCOUNT --- POST: writes (one to zero or more)",
      "POST -.- TOPIC: filed under (zero or more to one)",
    ]);
  });

  it("turns a mind map into a tree", () => {
    expect(mermaidToDiagram("mindmap\n  root((Mistakes))\n    Drawing first\n      Ask first\n    Too many boxes", "T")?.source.split("\n").slice(1)).toEqual([
      "direction: right",
      "end [m0] Mistakes",
      "box [m1] Drawing first",
      "box [m2] Ask first",
      "box [m3] Too many boxes",
      "[m0] --- [m1]",
      "[m1] --- [m2]",
      "[m0] --- [m3]",
    ]);
  });

  it("gives boxes that share their text an [id], and keeps two-way arrows", () => {
    expect(mermaidToDiagram("flowchart TD\n  A[Start] --> B[Say no]\n  A --> C[Say no]\n  B <-->|both| C", "T")?.source.split("\n").slice(2)).toEqual([
      "box Start",
      "box [B] Say no",
      "box [C] Say no",
      "Start -> [B]",
      "Start -> [C]",
      "[B] <-> [C]: both",
    ]);
  });

  it("converts sequence notes, blocks with branches, and skips activation and colour", () => {
    const chart = [
      "sequenceDiagram",
      "  participant C as Client",
      "  participant S as Server",
      "  activate S",
      "  rect rgb(240, 240, 255)",
      "  loop every second",
      "    C->>S: ping",
      "  end",
      "  end",
      "  alt healthy",
      "    S-->>C: pong",
      "  else down",
      "    S--xC: nothing",
      "  end",
      "  Note over C,S: then wait",
    ].join("\n");
    expect(mermaidToDiagram(chart, "T")?.source.split("\n").slice(1)).toEqual([
      "box Client",
      "box Server",
      "loop every second",
      "Client -> Server: ping",
      "end",
      "alt healthy",
      "Server --> Client: pong",
      "else down",
      "Server -> Client: nothing",
      "end",
      "note over Client, Server: then wait",
    ]);
  });

  it("turns a state diagram into a flow of states with start and finish dots", () => {
    const chart = [
      "stateDiagram-v2",
      '  state "Half-open" as HalfOpen',
      "  state Check <<choice>>",
      "  [*] --> Closed",
      "  Closed --> Open: 5 failures",
      "  Open --> HalfOpen: after 10 s",
      "  HalfOpen --> Check",
      "  Check --> Closed: works",
      "  Check --> Open: fails",
      "  Closed --> Closed: success",
      "  state Paused {",
      "    [*] --> Waiting",
      "    Waiting --> [*]",
      "  }",
      "  Open --> [*]",
    ].join("\n");
    expect(mermaidToDiagram(chart, "T")?.source.split("\n").slice(1)).toEqual([
      "direction: down",
      "state Half-open",
      "decision Check",
      "start [start-top] Start",
      "state Closed",
      "state Open",
      "stop [stop-top] Finish",
      "group Paused",
      "  start [start-0] Start",
      "  state Waiting",
      "  stop [stop-0] Finish",
      "end",
      "[start-top] -> Closed",
      "Closed -> Open: 5 failures",
      "Open -> Half-open: after 10 s",
      "Half-open -> Check",
      "Check -> Closed: works",
      "Check -> Open: fails",
      "Closed -> Closed: success",
      "[start-0] -> Waiting",
      "Waiting -> [stop-0]",
      "Open -> [stop-top]",
    ]);
  });

  it.each([
    ["an unclosed subgraph", "flowchart TD\n  subgraph S\n  A --> B"],
    ["an unknown diagram type", "journey\n  title My day"],
    ["an unclosed sequence block", "sequenceDiagram\n  loop every second\n  A->>B: ping"],
    ["a state diagram with a note", "stateDiagram-v2\n  [*] --> Open\n  note right of Open: waits"],
    ["more parts than the limit", `flowchart TD\n  ${Array.from({ length: 31 }, (_, i) => `N${i}`).join(" --> ")}`],
    ["a keep-mermaid comment", "%% keep-mermaid\nflowchart TD\n  A --> B"],
  ])("keeps Mermaid for %s", (_name, chart) => {
    expect(mermaidToDiagram(chart, "T")).toBeNull();
  });
});
