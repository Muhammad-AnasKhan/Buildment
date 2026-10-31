import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";
import { readerRemarkPlugins } from "@/shared/mdx/reader-plugins";
import { mdxComponents } from "./components";
import { collectUnknownComponents } from "@/shared/mdx/extract";
import { restoreInteractiveBlockTags } from "@/shared/mdx/restore-block-tags";
import { transformVisualFences } from "./transform-visual-fences";
import { rehypePrettyCodePlugins } from "./rehype-pretty-code-config";
import { chapterBodyForReader } from "@/shared/lib/mdx-frontmatter";
import { Lab } from "@buildment/learning-ui/labs/Lab";

function CourseLabBlock(props: { slug?: unknown; spec?: unknown; version?: unknown; presentation?: unknown }) {
  return (
    <Lab
      slug={props.slug}
      spec={(props.spec as never) ?? null}
      version={props.version}
      presentation={props.presentation}
      courseMode
    />
  );
}

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

// Server-side MDX rendering for the reader route — see
// docs/02-content-authoring.mdx "Rendering pipeline". Raw HTML stays disabled
// by omission (no rehype-raw plugin registered): MDX text like `<script>` is
// rendered as text, not executed. Uppercase tags missing from mdxComponents
// (docs/09-security.mdx allowlist) render as a callout instead of failing the chapter.
export function ChapterMdx({
  source,
  preview: _preview = false,
  courseLabMode = false,
}: {
  source: string;
  preview?: boolean;
  /** Learner course pages launch large labs into a focused workspace. */
  courseLabMode?: boolean;
}) {
  const transformed = transformVisualFences(chapterBodyForReader(source));
  const mdxSource = restoreInteractiveBlockTags(transformed);
  const baseComponents = courseLabMode ? { ...mdxComponents, Lab: CourseLabBlock } : mdxComponents;
  const components = withUnknownComponentFallback(baseComponents, mdxSource);
  return (
    <MDXRemote
      source={mdxSource}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, ...readerRemarkPlugins],
          rehypePlugins: rehypePrettyCodePlugins,
        },
      }}
    />
  );
}
