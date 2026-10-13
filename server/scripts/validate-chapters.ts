/**
 * Compiles every stored chapter the way publish does — catches prose, brace and
 * JSX problems before a learner opens the reader. Run: pnpm content:validate
 */
import "dotenv/config";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { PrismaPg } from "@prisma/adapter-pg";
import { remarkChecklist } from "../src/shared/mdx/remark-checklist.js";
import { remarkLearningLog } from "../src/shared/mdx/remark-learning-log.js";
import { restoreInteractiveBlockTags } from "../src/shared/mdx/restore-block-tags.js";
import { PrismaClient } from "../src/generated/prisma/index.js";

const COURSE_SLUG = process.argv[2] ?? "multi-vendor-marketplace";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const chapters = await prisma.chapter.findMany({
    where: { course: { slug: COURSE_SLUG } },
    select: { slug: true, source: true },
    orderBy: { order: "asc" },
  });

  const failed: Array<{ slug: string; error: string }> = [];
  for (const chapter of chapters) {
    try {
      await compile(restoreInteractiveBlockTags(chapter.source), {
        remarkPlugins: [remarkGfm, remarkChecklist, remarkLearningLog],
        outputFormat: "function-body",
      });
    } catch (err) {
      failed.push({ slug: chapter.slug, error: err instanceof Error ? (err.message.split("\n")[0] ?? "") : String(err) });
    }
  }

  console.log(`Validated ${chapters.length} chapters — ${chapters.length - failed.length} OK, ${failed.length} failed`);
  for (const f of failed) console.log(`  ${f.slug}: ${f.error}`);
  if (failed.length > 0) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
