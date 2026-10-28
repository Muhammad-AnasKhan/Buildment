/**
 * Writes a static SVG for every ```flow and ```sequence diagram, for places
 * that cannot run the reader: email, PDF, social images. It uses the same
 * parser, layout and drawing as the reader (src/shared/diagram), and needs
 * no browser.
 *
 *   pnpm diagrams:export --course networking            # every chapter of a course
 *   pnpm diagrams:export path/to/chapter.md             # every diagram in one file
 *   pnpm diagrams:export path/to/dns.flow --out dir     # one spec file (.flow or .sequence)
 *
 * Options: --out <dir> (default: exports/diagrams/<course> beside courses/, or
 * next to the input file), --compact for the phone layout. A course's
 * course.yaml `diagrams.layout` sets the default layout. Files whose content
 * has not changed are left alone. Exits with 1 if any diagram has problems.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import type { Code } from "mdast";
import { diagramToSvg } from "../src/shared/diagram/svg.js";
import { isDiagramKind, type DiagramKind } from "../src/shared/diagram/spec.js";

/** `firstLine` is the fence's line in its file, so problems can name file lines. */
type Job = { kind: DiagramKind; source: string; out: string; where: string; firstLine: number };

function option(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  const inline = argv.find((arg) => arg.startsWith(`${name}=`));
  return index >= 0 ? argv[index + 1] : inline?.slice(name.length + 1);
}

/** The diagrams in one Markdown file, named after the file and their order in it. */
export function diagramsInMarkdown(file: string, outDir: string): Job[] {
  const tree = unified().use(remarkParse).parse(fs.readFileSync(file, "utf8"));
  const jobs: Job[] = [];
  const base = path.basename(file, path.extname(file));
  visit(tree, "code", (node: Code) => {
    if (!isDiagramKind(node.lang)) return;
    jobs.push({
      kind: node.lang,
      source: node.value,
      out: path.join(outDir, `${base}-${jobs.length + 1}.svg`),
      where: `${file}:${node.position?.start.line ?? 0}`,
      firstLine: node.position?.start.line ?? 0,
    });
  });
  return jobs;
}

function markdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" || entry.name.startsWith(".") ? [] : markdownFiles(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

async function courseJobs(slug: string, outOption: string | undefined): Promise<{ jobs: Job[]; compact: boolean }> {
  // course-source reads --course from argv when it loads.
  const { COURSE_SOURCE_DIR, loadCourseManifest } = await import("./course-source.js");
  const manifest = loadCourseManifest();
  if (manifest && !manifest.diagrams?.exportSvg) {
    console.log(`Note: ${slug}/course.yaml does not set diagrams.exportSvg: true. Exporting anyway.`);
  }
  const outRoot = outOption ?? path.resolve(COURSE_SOURCE_DIR, "../../exports/diagrams", slug);
  const jobs = markdownFiles(COURSE_SOURCE_DIR).flatMap((file) =>
    diagramsInMarkdown(file, path.join(outRoot, path.relative(COURSE_SOURCE_DIR, path.dirname(file)))),
  );
  return { jobs, compact: manifest?.diagrams?.layout === "compact" };
}

export function writeIfChanged(file: string, content: string): boolean {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return true;
}

async function main(argv: string[]): Promise<number> {
  const slug = option(argv, "--course");
  const outOption = option(argv, "--out");
  const skip = new Set([slug, outOption].filter(Boolean));
  const inputs = argv.filter((arg) => !arg.startsWith("--") && !skip.has(arg));
  let compact = argv.includes("--compact");
  const jobs: Job[] = [];

  if (slug) {
    const course = await courseJobs(slug, outOption);
    jobs.push(...course.jobs);
    compact ||= course.compact;
  }
  for (const input of inputs) {
    const file = path.resolve(input);
    const outDir = outOption ? path.resolve(outOption) : path.dirname(file);
    const ext = path.extname(file).slice(1);
    if (ext === "md") jobs.push(...diagramsInMarkdown(file, outDir));
    else if (isDiagramKind(ext)) jobs.push({ kind: ext, source: fs.readFileSync(file, "utf8"), out: path.join(outDir, `${path.basename(file, `.${ext}`)}.svg`), where: file, firstLine: 0 });
    else {
      console.error(`${input}: use a .md chapter or a .flow or .sequence spec file.`);
      return 1;
    }
  }
  if (!slug && !inputs.length) {
    console.error("Usage: pnpm diagrams:export --course <slug> | <file.md|file.flow|file.sequence>... [--out dir] [--compact]");
    return 1;
  }

  let written = 0;
  let failed = 0;
  for (const job of jobs) {
    const result = diagramToSvg(job.kind, job.source, { compact });
    if (!result.ok) {
      failed++;
      const problems = result.problems.map((problem) => problem.replace(/^Line (\d+):/, (_, n) => `Line ${job.firstLine + Number(n)}:`));
      console.error(`${job.where}\n  ${problems.join("\n  ")}`);
      continue;
    }
    if (writeIfChanged(job.out, result.svg)) written++;
  }
  console.log(`${jobs.length} diagrams: ${written} written, ${jobs.length - written - failed} unchanged, ${failed} with problems.`);
  return failed ? 1 : 0;
}

const invokedDirectly =
  process.argv[1] != null && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
}
