import { prisma } from "@/server/db";
import { ProjectPreviewConfigSchema } from "./schema";

export async function ProjectPreviewComponent({ id }: { id: string }) {
  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? ProjectPreviewConfigSchema.safeParse(block.config) : null;
  const config = parsed?.success ? parsed.data : null;

  if (!block || block.type !== "PROJECT_PREVIEW" || !config) {
    return (
      <div className="not-prose my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">
        Project preview block {id} is missing or misconfigured.
      </div>
    );
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="relative overflow-hidden border-b border-border bg-muted px-6 py-8 sm:px-8">
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            What you'll build
          </div>
          <h3 className="mt-3 text-xl font-bold text-foreground sm:text-2xl">{config.title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {config.description}
          </p>
        </div>
      </div>

      <div className="px-6 py-5 sm:px-8">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Key features</h4>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {config.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
              <svg className="mt-0.5 size-4 shrink-0 text-muted-foreground" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {config.techStack && config.techStack.length > 0 && (
          <>
            <h4 className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tech stack</h4>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {config.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
