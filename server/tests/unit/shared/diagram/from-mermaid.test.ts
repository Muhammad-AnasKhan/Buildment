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

  it.each([
    ["a subgraph", "flowchart TD\n  subgraph S\n  A --> B\n  end"],
    ["a dotted line without an arrow head", "flowchart TD\n  A -.- B"],
    ["the & shorthand", "flowchart TD\n  A & B --> C"],
    ["a right-to-left flow", "flowchart RL\n  A --> B"],
    ["a note in a sequence", "sequenceDiagram\n  A->>B: hi\n  Note over A: thinks"],
    ["a loop in a sequence", "sequenceDiagram\n  loop every second\n  A->>B: ping\n  end"],
    ["a message to itself", "sequenceDiagram\n  A->>B: hi\n  B->>B: think"],
    ["a state diagram", "stateDiagram-v2\n  [*] --> Open"],
    ["two boxes with the same text", "flowchart TD\n  A[Same] --> B[Same]"],
    ["more parts than a phone can show", `flowchart TD\n  ${Array.from({ length: 13 }, (_, i) => `N${i}`).join(" --> ")}`],
    ["a keep-mermaid comment", "%% keep-mermaid\nflowchart TD\n  A --> B"],
  ])("keeps Mermaid for %s", (_name, chart) => {
    expect(mermaidToDiagram(chart, "T")).toBeNull();
  });
});
