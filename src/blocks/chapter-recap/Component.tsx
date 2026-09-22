import { prisma } from "@/server/db";
import { ChapterRecapConfigSchema } from "./schema";

export async function ChapterRecapComponent({ id }: { id: string }) {
  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? ChapterRecapConfigSchema.safeParse(block.config) : null;
  const config = parsed?.success ? parsed.data : null;

  if (!block || block.type !== "CHAPTER_RECAP" || !config) {
    return (
      <div className="not-prose my-6 rounded-md border border-dashed border-red-300 p-4 text-sm text-red-600">
        Chapter recap block {id} is missing or misconfigured.
      </div>
    );
  }

  return (
    <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
      <h4 className="text-sm font-semibold text-emerald-900">Key ideas from this chapter</h4>
      <ul className="mt-3 space-y-2">
        {config.points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
            <svg className="mt-0.5 size-4 shrink-0 text-emerald-600" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
