import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";
import { remarkChecklist } from "@/shared/mdx/remark-checklist";
import { remarkLearningLog } from "@/shared/mdx/remark-learning-log";
import { remarkMermaid } from "@/shared/mdx/remark-mermaid";
import { mdxComponents } from "./components";
import { collectUnknownComponents } from "@/shared/mdx/extract";
import { restoreInteractiveBlockTags } from "@/shared/mdx/restore-block-tags";
import { transformVisualFences } from "./transform-visual-fences";
import { rehypePrettyCodePlugins } from "./rehype-pretty-code-config";
import { chapterBodyForReader } from "@/shared/lib/mdx-frontmatter";

function UnsupportedBlock({
  name,
  children,
}: {
  name: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="my-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">This block is not supported ({name}).</p>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

/**
 * Unknown uppercase tags render as a callout instead of blanking the chapter.
 * MDX copies `components` with an object spread, so a Proxy get-trap is not
 * enough — missing names have to be real properties on the object.
 */
function withUnknownComponentFallback(components: MDXComponents, source: string): MDXComponents {
  let unknown: string[] = [];
  try {
    unknown = collectUnknownComponents(source, new Set(Object.keys(components)));
  } catch {
    return components;
  }
  if (unknown.length === 0) return components;
  const extras: MDXComponents = {};
  for (const name of unknown) {
    extras[name] = function UnknownBlock({ children }: { children?: React.ReactNode }) {
      return <UnsupportedBlock name={name}>{children}</UnsupportedBlock>;
    };
  }
  return { ...components, ...extras };
}

function DraftActivityPreview({ children }: { children?: React.ReactNode }) {
  return <div className="my-5 rounded-xl border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground"><p className="font-medium">Interactive activity</p><p className="mt-1">This activity is shown as a placeholder in course preview. Learner submissions and progress are disabled.</p>{children ? <div className="mt-2">{children}</div> : null}</div>;
}

// Server-side MDX rendering for the reader route — see
// docs/02-content-authoring.mdx "Rendering pipeline". Raw HTML stays disabled
// by omission (no rehype-raw plugin registered): MDX text like `<script>` is
// rendered as text, not executed. Uppercase tags missing from mdxComponents
// (docs/09-security.mdx allowlist) render as a callout instead of failing the chapter.
export function ChapterMdx({ source, preview = false }: { source: string; preview?: boolean }) {
  const transformed = transformVisualFences(chapterBodyForReader(source));
  const mdxSource = restoreInteractiveBlockTags(transformed);
  const components = preview
    ? withUnknownComponentFallback({
        ...mdxComponents,
        Quiz: DraftActivityPreview,
        Predict: DraftActivityPreview,
        OpenQuestion: DraftActivityPreview,
        CodeExercise: DraftActivityPreview,
        Checklist: DraftActivityPreview,
        LearningLog: DraftActivityPreview,
      }, mdxSource)
    : withUnknownComponentFallback(mdxComponents, mdxSource);
  return (
    <MDXRemote
      source={mdxSource}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkChecklist, remarkLearningLog, remarkMermaid],
          rehypePlugins: rehypePrettyCodePlugins,
        },
      }}
    />
  );
}
