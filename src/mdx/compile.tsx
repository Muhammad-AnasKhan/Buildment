import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";
import { remarkChecklist } from "./remark-checklist";
import { remarkLearningLog } from "./remark-learning-log";
import { remarkMermaid } from "./remark-mermaid";
import { mdxComponents } from "./components";
import { restoreInteractiveBlockTags } from "./restore-block-tags";
import { rehypePrettyCodePlugins } from "./rehype-pretty-code-config";

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

/** Unknown uppercase tags render as a callout instead of blanking the chapter. */
function withUnknownComponentFallback(components: MDXComponents): MDXComponents {
  return new Proxy(components, {
    get(target, prop, receiver) {
      if (typeof prop !== "string") return Reflect.get(target, prop, receiver);
      if (prop in target) return Reflect.get(target, prop, receiver);
      if (/^[A-Z]/.test(prop)) {
        return function UnknownBlock({ children }: { children?: React.ReactNode }) {
          return <UnsupportedBlock name={prop}>{children}</UnsupportedBlock>;
        };
      }
      return undefined;
    },
  }) as MDXComponents;
}

// Server-side MDX rendering for the reader route — see
// docs/02-content-authoring.mdx "Rendering pipeline". Raw HTML stays disabled
// by omission (no rehype-raw plugin registered): MDX text like `<script>` is
// rendered as text, not executed. Uppercase tags missing from mdxComponents
// (docs/09-security.mdx allowlist) render as a callout instead of failing the chapter.
export function ChapterMdx({ source }: { source: string }) {
  const mdxSource = restoreInteractiveBlockTags(source);
  return (
    <MDXRemote
      source={mdxSource}
      components={withUnknownComponentFallback(mdxComponents)}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkChecklist, remarkLearningLog, remarkMermaid],
          rehypePlugins: rehypePrettyCodePlugins,
        },
      }}
    />
  );
}
