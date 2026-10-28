import { describe, expect, it } from "vitest";
import { parseDiagram, type DiagramParseResult } from "../../../../src/shared/diagram/spec.js";

const DNS = `title: How your phone finds a website
actor You
box DNS
end Server
You -> DNS: Where is example.com?
DNS --> You: At 93.184.215.14
You -> Server: Send the page
packet: You -> DNS -> You -> Server`;

function problems(result: DiagramParseResult): string[] {
  return result.ok ? [] : result.problems;
}

describe("parseDiagram: valid specs", () => {
  it("reads a flow with labels, a dashed reply and a packet", () => {
    const result = parseDiagram("flow", DNS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { spec } = result;
    expect(spec.title).toBe("How your phone finds a website");
    expect(spec.direction).toBe("right");
    expect(spec.nodes.map((node) => [node.label, node.kind])).toEqual([["You", "actor"], ["DNS", "box"], ["Server", "end"]]);
    expect(spec.edges).toEqual([
      { from: "you", to: "dns", label: "Where is example.com?", dashed: false, line: 5 },
      { from: "dns", to: "you", label: "At 93.184.215.14", dashed: true, line: 6 },
      { from: "you", to: "server", label: "Send the page", dashed: false, line: 7 },
    ]);
    expect(spec.packet).toEqual(["you", "dns", "you", "server"]);
    expect(spec.hops).toEqual([{ edge: 0, reversed: false }, { edge: 1, reversed: false }, { edge: 2, reversed: false }]);
  });

  it("expands a chain into one arrow per pair", () => {
    const result = parseDiagram("flow", "title: Chain\nactor You\nbox DNS\nend Server\nYou -> DNS -> Server");
    expect(result.ok && result.spec.edges.map((edge) => `${edge.from}>${edge.to}`)).toEqual(["you>dns", "dns>server"]);
  });

  it("lets the packet go back along an arrow", () => {
    const result = parseDiagram("flow", "title: Back\nactor You\nbox DNS\nYou -> DNS\npacket: You -> DNS -> You");
    expect(result.ok && result.spec.hops).toEqual([{ edge: 0, reversed: false }, { edge: 0, reversed: true }]);
  });

  it("matches names without case, ignores comments and blank lines, and keeps colons in labels", () => {
    const result = parseDiagram("sequence", "# a comment\ntitle: Times\n\nACTOR Rami\nbox Shop\nrami -> SHOP: Open at 9:30?\n");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.spec.edges[0]).toMatchObject({ from: "rami", to: "shop", label: "Open at 9:30?" });
  });

  it("allows declarations after the arrows that use them", () => {
    expect(parseDiagram("flow", "title: Late\nYou -> DNS\nactor You\nbox DNS").ok).toBe(true);
  });

  it("allows a repeated message in a sequence", () => {
    expect(parseDiagram("sequence", "title: Retry\nactor You\nbox API\nYou -> API: try\nYou -> API: try again").ok).toBe(true);
  });

  it("reads direction down and accepts Windows line endings", () => {
    const result = parseDiagram("flow", "title: Down\r\ndirection: down\r\nbox A\r\nbox B\r\nA -> B\r\n");
    expect(result.ok && result.spec.direction).toBe("down");
  });

  it("accepts hyphens, digits and punctuation in names", () => {
    expect(parseDiagram("flow", "title: Wi-Fi\nbox Wi-Fi router\nstore Orders (v2)\nexternal Bank API\nWi-Fi router -> Orders (v2) -> Bank API").ok).toBe(true);
  });
});

describe("parseDiagram: problems fail loudly", () => {
  it("rejects a line that is not part of the grammar", () => {
    const out = problems(parseDiagram("flow", "title: X\nbox A\nbox B\nA -> B\nA connects to B"));
    expect(out).toEqual([expect.stringMatching(/^Line 5: "A connects to B" is not a diagram line/)]);
  });

  it("rejects a control character but allows a tab", () => {
    expect(problems(parseDiagram("flow", "title: X\nbox A\u0007\nbox B\nA -> B"))[0]).toMatch(/^Line 2: remove the control character/);
    expect(parseDiagram("flow", "title: X\nbox A\nbox B\nA\t->\tB").ok).toBe(true);
  });

  it("rejects an unknown node kind as an unknown line", () => {
    expect(problems(parseDiagram("flow", "title: X\nservice A\nbox B\nA -> B"))[0]).toMatch(/^Line 2: "service A" is not a diagram line/);
  });

  it("names an undeclared part and lists the declared ones", () => {
    const out = problems(parseDiagram("flow", "title: X\nactor You\nbox Server\nYou -> Sever"));
    expect(out).toEqual(['Line 4: "Sever" is not declared. Declare it first, for example "box Sever". Declared: You, Server.']);
  });

  it("requires a title", () => {
    expect(problems(parseDiagram("flow", "box A\nbox B\nA -> B"))).toEqual([expect.stringMatching(/^Add a title line/)]);
  });

  it("rejects a label on a chain", () => {
    expect(problems(parseDiagram("flow", "title: X\nbox A\nbox B\nbox C\nA -> B -> C: go"))[0]).toMatch(/a label fits on one arrow only/);
  });

  it("rejects long labels, names and titles", () => {
    const longLabel = problems(parseDiagram("flow", `title: X\nbox A\nbox B\nA -> B: ${"word ".repeat(10)}`));
    expect(longLabel[0]).toMatch(/shorten the label to 40 characters/);
    expect(problems(parseDiagram("flow", `title: X\nbox ${"a".repeat(37)}\nbox B`))[0]).toMatch(/to 36 characters or fewer/);
    expect(problems(parseDiagram("flow", `title: ${"t".repeat(81)}\nbox A\nbox B\nA -> B`))[0]).toMatch(/shorten the title to 80/);
  });

  it("rejects a colon in a part's name", () => {
    expect(problems(parseDiagram("flow", "title: X\nbox DNS: looks up names\nbox B"))[0]).toMatch(/cannot contain ":"/);
  });

  it("rejects duplicate parts, titles and flow arrows", () => {
    expect(problems(parseDiagram("flow", "title: X\nbox A\nbox a\nbox B\nA -> B"))[0]).toMatch(/already declared on line 2/);
    expect(problems(parseDiagram("flow", "title: X\ntitle: Y\nbox A\nbox B\nA -> B"))[0]).toMatch(/already has a title/);
    expect(problems(parseDiagram("flow", "title: X\nbox A\nbox B\nA -> B\nA -> B: again"))[0]).toMatch(/already an arrow from "A" to "B"/);
  });

  it("rejects an arrow to itself", () => {
    expect(problems(parseDiagram("flow", "title: X\nbox A\nbox B\nA -> A\nA -> B"))[0]).toMatch(/to itself/);
  });

  it("rejects a packet hop with no arrow and a dashed packet path", () => {
    expect(problems(parseDiagram("flow", "title: X\nbox A\nbox B\nbox C\nA -> B\nB -> C\npacket: A -> C"))[0]).toMatch(/no arrow joins them/);
    expect(problems(parseDiagram("flow", "title: X\nbox A\nbox B\nA -> B\npacket: A --> B"))[0]).toMatch(/with "->" only/);
  });

  it("keeps flow-only settings out of a sequence", () => {
    expect(problems(parseDiagram("sequence", "title: X\ndirection: down\nbox A\nbox B\nA -> B"))[0]).toMatch(/direction is for flow diagrams only/);
    expect(problems(parseDiagram("sequence", "title: X\nbox A\nbox B\nA -> B\npacket: A -> B"))[0]).toMatch(/packet is for flow diagrams only/);
  });

  it("rejects a bad direction value", () => {
    expect(problems(parseDiagram("flow", "title: X\ndirection: left\nbox A\nbox B\nA -> B"))[0]).toMatch(/"right" or "down", not "left"/);
  });

  it("reports a part with no arrow", () => {
    expect(problems(parseDiagram("flow", "title: X\nbox A\nbox B\nbox C\nA -> B"))).toEqual(['Line 4: "C" has no arrow. Connect it or remove it.']);
  });

  it("caps the size so a diagram fits a phone", () => {
    const names = Array.from({ length: 9 }, (_, i) => `N${i}`);
    const flow = `title: Big\n${names.map((n) => `box ${n}`).join("\n")}\n${names.join(" -> ")}`;
    expect(problems(parseDiagram("flow", flow))).toContain("A flow diagram fits a phone with up to 8 parts; this one has 9. Split it into two diagrams.");
    const lanes = names.slice(0, 6);
    const sequence = `title: Wide\n${lanes.map((n) => `box ${n}`).join("\n")}\n${lanes.join(" -> ")}`;
    expect(problems(parseDiagram("sequence", sequence))[0]).toMatch(/up to 5 parts; this one has 6/);
  });

  it("needs two parts and an arrow", () => {
    expect(problems(parseDiagram("flow", "title: X\nbox A"))).toContain('A diagram needs at least two parts, for example "actor You" and "box DNS".');
    expect(problems(parseDiagram("flow", "title: X\nbox A\nbox B"))).toContain('Add at least one arrow, for example "You -> DNS".');
  });

  it("collects every problem in one pass", () => {
    const out = problems(parseDiagram("flow", "box A\nwhat is this\nA -> Nope"));
    expect(out.length).toBeGreaterThanOrEqual(3);
  });
});
