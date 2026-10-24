import { Layers3 } from "lucide-react";
import { readerCardLg, readerEyebrow } from "../../components/learn/reader-theme";

export function ProjectPreviewView({ config }: { config: { title: string; description?: string; features: string[]; techStack?: string[]; imageUrl?: string } }) {

  return (
    <section className={`not-prose my-8 ${readerCardLg}`} aria-label={config.title} data-project-preview>
      <header className="border-b border-border bg-muted/25 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center gap-2">
          <Layers3 className="size-4 text-muted-foreground" aria-hidden />
          <p className={readerEyebrow}>Project preview</p>
        </div>
        <h3 className="mt-3 text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">{config.title}</h3>
        {config.description ? (
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground">{config.description}</p>
        ) : null}
      </header>

      {config.imageUrl ? (
        <div className="border-b border-border bg-muted/20 p-4 sm:p-5">
          <img src={config.imageUrl} alt={config.title} width={1200} height={675} className="block h-auto w-full rounded-lg border border-border object-contain" />
        </div>
      ) : null}

      {config.features.length > 0 ? (
        <div className="px-5 py-5 sm:px-6">
          <h4 className={readerEyebrow}>What you&apos;ll build</h4>
          <ol className="mt-3 overflow-hidden rounded-xl border border-border divide-y divide-border">
            {config.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 px-4 py-3.5">
                <span className="mt-0.5 shrink-0 font-mono text-xs font-semibold tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-sm leading-relaxed text-foreground">{feature}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {(config.techStack?.length ?? 0) > 0 ? (
        <footer className="flex flex-wrap items-start gap-x-4 gap-y-2 border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
          <span className={`${readerEyebrow} pt-1`}>Built with</span>
          <ul className="flex flex-wrap gap-1.5">
            {config.techStack?.map((tech) => (
              <li key={tech} className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground/80">{tech}</li>
            ))}
          </ul>
        </footer>
      ) : null}
    </section>
  );
}
