import { MDXRemote } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";
import { remarkChecklist } from "./remark-checklist";
import { remarkLearningLog } from "./remark-learning-log";
import { remarkMermaid } from "./remark-mermaid";
import { mdxComponents } from "./components";
import { restoreInteractiveBlockTags } from "./restore-block-tags";

// Server-side MDX rendering for the reader route — see
// docs/02-content-authoring.mdx "Rendering pipeline". Raw HTML stays disabled
// by omission (no rehype-raw plugin registered): MDX text like `<script>` is
// rendered as an unknown/undefined component, not executed. Only tags in
// mdxComponents (docs/09-security.mdx allowlist) render as real components.
export function ChapterMdx({ source }: { source: string }) {
  const mdxSource = restoreInteractiveBlockTags(source);
  return (
    <MDXRemote
      source={mdxSource}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkChecklist, remarkLearningLog, remarkMermaid],
        },
      }}
    />
  );
}
