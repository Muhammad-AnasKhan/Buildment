import { requireTeachSurface } from "@/server/auth/guards";
import { CanvasForSpec, InteractiveCanvas } from "@/canvas/InteractiveCanvas";
import { CANVAS_SLUGS, canvasRegistry } from "@/canvas/registry";

export const metadata = { title: "Interactive canvases" };

/**
 * Every registered canvas on one page, for reviewers who want to inspect a
 * canvas (light and dark, phone width, keyboard) without importing a course.
 * See agent-ip/10-interactive-canvases.md "The build contract".
 */
export default async function CanvasPreviewPage() {
  await requireTeachSurface();
  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Interactive canvases</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every canvas a chapter can embed. Use one with{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">{'<InteractiveCanvas slug="..." />'}</code>.
        </p>
      </header>
      {CANVAS_SLUGS.map((slug) => (
        <section key={slug} className="mt-10">
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <code>slug: {slug}</code>
            <span className="rounded-full border border-border px-2 py-0.5 font-medium capitalize">{canvasRegistry[slug].kind.replaceAll("-", " ")}</span>
          </p>
          <CanvasForSpec spec={canvasRegistry[slug]} />
        </section>
      ))}
      <section className="mt-10">
        <p className="font-mono text-xs text-muted-foreground">An unknown slug renders this note instead of an error:</p>
        <InteractiveCanvas slug="not-a-registered-canvas" />
      </section>
    </div>
  );
}
