import { describe, expect, it } from "vitest";
import { describeDiagram, stepCaptions } from "../../../../src/shared/diagram/describe.js";
import { drawScene, packetPoint } from "../../../../src/shared/diagram/draw.js";
import { layoutDiagram, pathPoint } from "../../../../src/shared/diagram/layout.js";
import { parseDiagram, type DiagramKind, type DiagramSpec } from "../../../../src/shared/diagram/spec.js";
import { diagramToSvg } from "../../../../src/shared/diagram/svg.js";
import { textWidth, wrapText } from "../../../../src/shared/diagram/text.js";

const FLOW = "title: Find a site\nactor You\nbox DNS\nend Server\nYou -> DNS: Where is it?\nDNS --> You: Here\nYou -> Server\npacket: You -> DNS -> You -> Server";
const SEQUENCE = "title: Look up a name\nactor You\nbox DNS resolver\nend Web server\nYou -> DNS resolver: Which address?\nDNS resolver --> You: 93.184.215.14\nYou -> Web server: Send the page";

function spec(kind: DiagramKind, source: string): DiagramSpec {
  const result = parseDiagram(kind, source);
  if (!result.ok) throw new Error(result.problems.join("\n"));
  return result.spec;
}

describe("text helpers", () => {
  it("measures wide letters wider than narrow ones and wraps to a width", () => {
    expect(textWidth("mmm", 14)).toBeGreaterThan(textWidth("iii", 14));
    const lines = wrapText("one two three four five", 14, 60);
    expect(lines.join(" ")).toBe("one two three four five");
    expect(lines.every((line) => textWidth(line, 14) <= 60 || !line.includes(" "))).toBe(true);
    expect(wrapText("a b c d e f g h", 14, 10, 2)).toHaveLength(2);
  });
});

describe("layout", () => {
  it("puts a chain left to right, and top to bottom in compact mode", () => {
    const s = spec("flow", "title: Chain\nactor You\nbox DNS\nend Server\nYou -> DNS -> Server");
    const wide = layoutDiagram(s, false);
    const xs = wide.nodes.map((node) => (node.shape.type === "circle" ? node.shape.cx : node.shape.x));
    expect(xs[0]).toBeLessThan(xs[1]);
    expect(xs[1]).toBeLessThan(xs[2]);
    const compact = layoutDiagram(s, true);
    const ys = compact.nodes.map((node) => (node.shape.type === "circle" ? node.shape.cy : node.shape.y));
    expect(ys[0]).toBeLessThan(ys[1]);
    expect(ys[1]).toBeLessThan(ys[2]);
    expect(compact.viewBox.w).toBeLessThan(wide.viewBox.w);
  });

  it("keeps a compact chain narrow enough for a 320px phone", () => {
    const s = spec("flow", "title: Order\nactor Customer\nbox Shop app\nbox Payment\nstore Orders\nend Courier\nCustomer -> Shop app -> Payment -> Orders -> Courier");
    expect(layoutDiagram(s, true).viewBox.w).toBeLessThanOrEqual(288);
  });

  it("does not let a reply undo the left-to-right order", () => {
    const s = spec("flow", FLOW);
    const scene = layoutDiagram(s, false);
    const you = scene.nodes.find((node) => node.id === "you")!.shape;
    const dns = scene.nodes.find((node) => node.id === "dns")!.shape;
    expect(you.type === "circle" && dns.type === "rect" && you.cx < dns.x).toBe(true);
  });

  it("numbers compact sequence arrows instead of labelling them", () => {
    const scene = layoutDiagram(spec("sequence", SEQUENCE), true);
    expect(scene.edges.map((edge) => edge.badge?.n)).toEqual([1, 2, 3]);
    expect(scene.edges.every((edge) => !edge.label)).toBe(true);
    expect(scene.lifelines).toHaveLength(3);
  });

  it.each([false, true])("keeps each label of a request and reply pair by its own arrow (compact: %s)", (compact) => {
    const s = spec("flow", "title: Pay\ndirection: down\nbox Shop app\nexternal Payment provider\nstore Orders\nShop app -> Payment provider: charge 1,200\nPayment provider --> Shop app: approved\nShop app -> Orders: save the order");
    const scene = layoutDiagram(s, compact);
    const centre = (i: number) => {
      const label = scene.edges[i].label!;
      const width = textWidth(label.lines[0], label.size);
      const left = label.anchor === "middle" ? label.x - width / 2 : label.anchor === "start" ? label.x : label.x - width;
      return { x: left + width / 2, y: label.y };
    };
    const distance = (p: { x: number; y: number }, i: number) => {
      const mid = { x: (scene.edges[i].path.start.x + scene.edges[i].path.end.x) / 2, y: (scene.edges[i].path.start.y + scene.edges[i].path.end.y) / 2 };
      return Math.hypot(p.x - mid.x, p.y - mid.y);
    };
    expect(distance(centre(0), 0)).toBeLessThan(distance(centre(0), 1));
    expect(distance(centre(1), 1)).toBeLessThan(distance(centre(1), 0));
  });

  it.each([false, true])("bends a loop back arrow around the parts in its way (compact: %s)", (compact) => {
    const s = spec("flow", "title: Loop\ndirection: down\nbox Complaints posted\nbox Good reviews seen\nbox New orders\nbox Happy customers\nComplaints posted -> Good reviews seen -> New orders -> Happy customers\nHappy customers -> Good reviews seen: fewer");
    const scene = layoutDiagram(s, compact);
    const back = scene.edges[3].path;
    expect(back.control).toBeDefined();
    const orders = scene.nodes.find((node) => node.id === "new orders")!.shape;
    if (orders.type !== "rect") throw new Error("box expected");
    for (let i = 1; i < 20; i++) {
      const p = pathPoint(back, i / 20);
      const inside = p.x > orders.x && p.x < orders.x + orders.w && p.y > orders.y && p.y < orders.y + orders.h;
      expect(inside).toBe(false);
    }
  });

  it.each([false, true])("draws a decision as a diamond that holds its text, with arrows at its points (compact: %s)", (compact) => {
    const s = spec("flow", "title: Ask\ndirection: down\nbox Feature request\ndecision Did she ask who it is for?\nbox Build it\nbox Ask first\nFeature request -> Did she ask who it is for?\nDid she ask who it is for? -> Build it: No\nDid she ask who it is for? -> Ask first: Yes");
    const scene = layoutDiagram(s, compact);
    const node = scene.nodes.find((n) => n.id === "did she ask who it is for?")!;
    const d = node.shape;
    if (d.type !== "diamond") throw new Error("diamond expected");
    const c = { x: d.x + d.w / 2, y: d.y + d.h / 2 };
    // Every corner of the text block lies inside the diamond.
    const tw = Math.max(...node.label.lines.map((line) => textWidth(line, node.label.size)));
    const th = node.label.lines.length * node.label.size * 1.25;
    expect(tw / d.w + th / d.h).toBeLessThanOrEqual(1);
    // Arrows touch the diamond at its top or bottom point (allowing the 2 and 3 unit gaps the layout leaves).
    const into = scene.edges[0].path.end;
    expect(Math.abs(into.x - c.x)).toBeLessThan(1);
    expect(Math.abs(into.y - d.y)).toBeLessThan(4);
    const out = scene.edges[1].path.start;
    expect(Math.abs(out.x - c.x) < 1 || Math.abs(out.y - c.y) < 1).toBe(true);
    const flat = JSON.stringify(drawScene(scene));
    expect(flat).toMatch(/"key":"did she ask who it is for\?-shape"/);
    expect(describeDiagram(s)).toContain("Did she ask who it is for? (a question)");
  });

  it.each([false, true])("draws a loop beside its part and repeated arrows apart (compact: %s)", (compact) => {
    const s = spec("flow", "title: Retry\nbox Client\nbox API\nClient -> API: first try\nClient -> API: second try\nAPI -> API: retry");
    const scene = layoutDiagram(s, compact);
    const [a, b, loop] = scene.edges;
    expect(Math.hypot(a.path.start.x - b.path.start.x, a.path.start.y - b.path.start.y)).toBeGreaterThan(12);
    expect(loop.path.control2).toBeDefined();
    const api = scene.nodes.find((n) => n.id === "api")!.shape;
    if (api.type === "circle") throw new Error("box expected");
    const mid = pathPoint(loop.path, 0.5);
    expect(mid.x > api.x + api.w || mid.y < api.y).toBe(true);
    expect(JSON.stringify(drawScene(scene))).toMatch(/"d":"M[^"]* C/);
  });

  it("draws a message to itself as a loop on the lifeline", () => {
    const scene = layoutDiagram(spec("sequence", "title: Think\nbox A\nbox B\nA -> B: ask\nB -> B: think\nB --> A: answer"), false);
    expect(scene.edges[1].path.control2).toBeDefined();
    expect(scene.edges[1].label?.anchor).toBe("start");
  });

  it.each([false, true])("puts each group's box around its parts and no others (compact: %s)", (compact) => {
    const s = spec("flow", "title: Map\nbox Phone\nbox DNS\ngroup Private network\n  box Load balancer\n  box App\n  store Database\nend\nPhone -> DNS\nPhone -> Load balancer -> App -> Database");
    const scene = layoutDiagram(s, compact);
    expect(scene.groups).toHaveLength(1);
    const box = scene.groups[0].rect;
    const centre = (id: string) => {
      const shape = scene.nodes.find((n) => n.id === id)!.shape;
      return shape.type === "circle" ? { x: shape.cx, y: shape.cy } : { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 };
    };
    const inside = (p: { x: number; y: number }) => p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h;
    expect(["load balancer", "app", "database"].every((id) => inside(centre(id)))).toBe(true);
    expect(["phone", "dns"].some((id) => inside(centre(id)))).toBe(false);
    expect(describeDiagram(s)).toContain("Groups: Private network (Load balancer, App and Database).");
    expect(JSON.stringify(drawScene(scene))).toContain('"key":"group-0-label"');
  });

  it.each([false, true])("frames sequence blocks and places notes between messages (compact: %s)", (compact) => {
    const s = spec("sequence", "title: Health\nbox Client\nbox Server\nnote over Client, Server: start\nloop every second\nClient -> Server: ping\nend\nalt healthy\nServer --> Client: pong\nelse down\nServer -> Client: nothing\nend");
    expect(s.notes).toEqual([{ before: 0, from: "client", to: "server", side: "over", text: "start", line: 4 }]);
    expect(s.blocks.map((b) => [b.kind, b.start, b.end, b.sections.map((x) => x.at)])).toEqual([["loop", 0, 1, []], ["alt", 1, 3, [2]]]);
    const scene = layoutDiagram(s, compact);
    const [loop, alt] = scene.blocks;
    const ping = scene.edges[0].path.start.y;
    expect(scene.notes[0].rect.y + scene.notes[0].rect.h).toBeLessThan(ping);
    expect(loop.rect.y).toBeLessThan(ping);
    expect(loop.rect.y + loop.rect.h).toBeGreaterThan(ping);
    expect(alt.dividers).toHaveLength(1);
    expect(alt.dividers[0].y).toBeGreaterThan(scene.edges[1].path.start.y);
    expect(alt.dividers[0].y).toBeLessThan(scene.edges[2].path.start.y);
    const flat = JSON.stringify(drawScene(scene));
    expect(flat).toContain('"key":"note-0"');
    expect(flat).toContain('"key":"block-1-divider-0"');
  });

  it("is deterministic", () => {
    expect(layoutDiagram(spec("flow", FLOW), false)).toEqual(layoutDiagram(spec("flow", FLOW), false));
  });
});

describe("drawing", () => {
  it("uses the brand colours and no gradients", () => {
    const svg = diagramToSvg("flow", FLOW);
    expect(svg.ok).toBe(true);
    if (!svg.ok) return;
    for (const colour of ["#E8EBFF", "#2434E0", "#0A0F2C", "#FFFFFF"]) expect(svg.svg).toContain(colour);
    expect(svg.svg).not.toMatch(/Gradient|filter=|drop-shadow/);
    expect(svg.svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="[-\d.]+ [-\d.]+ \d+ \d+"/);
    expect(svg.svg).toContain("<title>Find a site</title>");
    expect(svg.svg).toContain("stroke-width=\"3\"");
  });

  it("draws the packet, its touch target and the current step", () => {
    const s = spec("flow", FLOW);
    const scene = layoutDiagram(s, false);
    const tree = drawScene(scene, { activeEdge: 1, fadedEdges: new Set([2]), activeNode: "you", packet: packetPoint(scene, s.hops, 2), packetHandle: true });
    const flat = JSON.stringify(tree);
    expect(flat).toContain("#FFC933");
    expect(flat).toContain('"r":22');
    expect(flat).toContain('"opacity":0.25');
    expect(flat).toContain('"key":"you-ring"');
  });

  it("moves the packet along the hops and stays on the path", () => {
    const s = spec("flow", FLOW);
    const scene = layoutDiagram(s, false);
    const start = packetPoint(scene, s.hops, 0)!;
    expect(start).toEqual(scene.edges[0].path.start);
    expect(packetPoint(scene, s.hops, 3)).toEqual(scene.edges[2].path.end);
    expect(packetPoint(scene, s.hops, 99)).toEqual(packetPoint(scene, s.hops, 3));
    expect(packetPoint(scene, [], 0)).toBeNull();
  });

  it("escapes text in the exported SVG", () => {
    const svg = diagramToSvg("flow", "title: Tom & Jerry\nbox A\nbox B\nA -> B: 1 < 2");
    expect(svg.ok && svg.svg).toContain("Tom &amp; Jerry");
    expect(svg.ok && svg.svg).toContain("1 &lt; 2");
  });

  it("returns the problems instead of a picture for a bad spec", () => {
    expect(diagramToSvg("flow", "title: X\nbox A\nnonsense")).toEqual({ ok: false, problems: expect.arrayContaining([expect.stringMatching(/not a diagram line/)]) });
  });
});

describe("text alternative", () => {
  it("names every part, arrow and the packet path", () => {
    expect(describeDiagram(spec("flow", FLOW))).toBe(
      "Find a site. A flow diagram with 3 parts: You (a person), DNS and Server (the end point). Arrows: You to DNS: Where is it?; DNS to You (dashed arrow): Here; You to Server. A packet travels You, then DNS, then You, then Server.",
    );
  });

  it("numbers the messages of a sequence", () => {
    expect(describeDiagram(spec("sequence", SEQUENCE))).toBe(
      "Look up a name. A sequence of 3 messages between You (a person), DNS resolver and Web server (the end point). 1. You to DNS resolver: Which address?. 2. DNS resolver to You (dashed arrow): 93.184.215.14. 3. You to Web server: Send the page.",
    );
  });

  it("draws a plain line with no arrowhead and describes it as joined", () => {
    const s = spec("flow", "title: Router\nbox Inside\nbox Outside\nInside --- Outside");
    expect(describeDiagram(s)).toContain("Arrows: Inside joined to Outside.");
    const flat = JSON.stringify(drawScene(layoutDiagram(s, false)));
    expect(flat).toContain('"key":"edge-0-line"');
    expect(flat).not.toContain('"key":"edge-0-head"');
  });

  it("writes one caption per step", () => {
    expect(stepCaptions(spec("flow", FLOW))).toEqual(["The packet starts at You.", "You to DNS: Where is it?", "DNS to You: Here", "You to Server."]);
    expect(stepCaptions(spec("sequence", SEQUENCE))[1]).toBe("DNS resolver to You: 93.184.215.14");
  });
});
