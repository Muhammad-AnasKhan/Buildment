import { MDXRemote } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "./components";

// Server-side MDX rendering for the reader route — see
// docs/02-content-authoring.mdx "Rendering pipeline". Raw HTML stays disabled
// by omission (no rehype-raw plugin registered): MDX text like `<script>` is
// rendered as an unknown/undefined component, not executed. Only tags in
// mdxComponents (docs/09-security.mdx allowlist) render as real components.
export function ChapterMdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
    />
  );
}
