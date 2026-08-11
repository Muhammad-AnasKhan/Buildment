/**
 * Compile every chapter's MDX source — catches prose/brace/JSX issues before
 * hitting the reader route. Run: pnpm content:validate
 */
import "dotenv/config";
import { evaluate } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";
import { remarkChecklist } from "../src/mdx/remark-checklist.ts";
import { remarkLearningLog } from "../src/mdx/remark-learning-log.ts";
import { restoreInteractiveBlockTags } from "../src/mdx/restore-block-tags.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const stub = () => null;
const components = {
  Quiz: stub,
  Predict: stub,
  OpenQuestion: stub,
  FaqGroup: stub,
  FaqItem: stub,
  Checklist: stub,
  LearningLog: stub,
  ComparePanel: stub,
  CompareColumn: stub,
  FileTree: stub,
  FileTreeItem: stub,
  TerminalBlock: stub,
  TerminalLine: stub,
  DiffBlock: stub,
  ArchitectureDiagram: stub,
  ArchNode: stub,
  StateMachine: stub,
  EntityDiagram: stub,
  TraceRequest: stub,
  TraceStep: stub,
  ApiRequestPanel: stub,
  ApiRequest: stub,
  MermaidDiagram: stub,
  Callout: stub,
};

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const chapters = await prisma.chapter.findMany({
    where: { course: { slug: "multi-vendor-marketplace" } },
    select: { slug: true, source: true },
    orderBy: { order: "asc" },
  });

  const failed = [];
  for (const chapter of chapters) {
    try {
      await evaluate({
        source: restoreInteractiveBlockTags(chapter.source),
        components,
        options: { mdxOptions: { remarkPlugins: [remarkGfm, remarkChecklist, remarkLearningLog] } },
      });
    } catch (err) {
      failed.push({ slug: chapter.slug, error: err instanceof Error ? err.message.split("\n")[0] : String(err) });
    }
  }

  console.log(`Validated ${chapters.length} chapters — ${chapters.length - failed.length} OK, ${failed.length} failed`);
  if (failed.length > 0) {
    for (const f of failed) console.log(`  ${f.slug}: ${f.error}`);
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
