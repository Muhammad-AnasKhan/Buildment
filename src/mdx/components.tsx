import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { blockRegistry } from "@/blocks/registry";

// The allowlisted component map for the reader route — see
// docs/02-content-authoring.mdx "Rendering pipeline": only components in this
// map are reachable from compiled MDX, so a compromised/careless mentor
// account can add prose, not arbitrary JS.
export const mdxComponents: MDXComponents = {
  Quiz: blockRegistry.QUIZ.Component,
  OpenQuestion: blockRegistry.OPEN_QUESTION.Component,
  table: (props: React.ComponentProps<"table">) => (
    <div className="my-4 overflow-x-auto">
      <table {...props} />
    </div>
  ),
};
