import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { diagramsInMarkdown, writeIfChanged } from "../../scripts/export-diagrams.js";

let temporary = "";
const TICKS = "```";

beforeAll(async () => {
  temporary = await mkdtemp(path.join(tmpdir(), "export-diagrams-"));
});
afterAll(async () => {
  await rm(temporary, { recursive: true, force: true });
});

describe("export-diagrams", () => {
  it("finds every flow and sequence fence and names the files by order", async () => {
    const file = path.join(temporary, "01.02-dns.md");
    await writeFile(file, `# DNS\n\n${TICKS}flow\ntitle: A\nbox A\nbox B\nA -> B\n${TICKS}\n\n${TICKS}mermaid\nflowchart LR\n${TICKS}\n\n${TICKS}sequence\ntitle: B\nbox A\nbox B\nA -> B\n${TICKS}\n`);
    const jobs = diagramsInMarkdown(file, path.join(temporary, "out"));
    expect(jobs.map((job) => [job.kind, path.basename(job.out), job.firstLine])).toEqual([
      ["flow", "01.02-dns-1.svg", 3],
      ["sequence", "01.02-dns-2.svg", 14],
    ]);
  });

  it("writes a file only when its content changes", async () => {
    const file = path.join(temporary, "out", "a.svg");
    expect(writeIfChanged(file, "<svg/>")).toBe(true);
    expect(writeIfChanged(file, "<svg/>")).toBe(false);
    expect(writeIfChanged(file, "<svg></svg>")).toBe(true);
    expect(await readFile(file, "utf8")).toBe("<svg></svg>");
  });
});
