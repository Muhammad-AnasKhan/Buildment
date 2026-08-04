import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { blockRegistry } from "@/blocks/registry";
import { FaqGroup, FaqItem } from "@/components/learn/faq-group";
import { CheckpointIntro } from "@/components/learn/checkpoint-intro";
import { MandatoryReadCard } from "@/components/learn/mandatory-read-card";
import { cn } from "@/lib/utils";

const cellBorder = "border border-neutral-200";

// The allowlisted component map for the reader route — see
// docs/02-content-authoring.mdx "Rendering pipeline": only components in this
// map are reachable from compiled MDX, so a compromised/careless mentor
// account can add prose, not arbitrary JS.
export const mdxComponents: MDXComponents = {
  Quiz: blockRegistry.QUIZ.Component,
  OpenQuestion: blockRegistry.OPEN_QUESTION.Component,
  FaqGroup,
  FaqItem,
  CheckpointIntro,
  MandatoryReadCard,
  table: (props: React.ComponentProps<"table">) => (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table
          className={cn("w-full border-collapse text-[15px] leading-relaxed", cellBorder)}
          {...props}
        />
      </div>
    </div>
  ),
  thead: (props: React.ComponentProps<"thead">) => (
    <thead className="bg-neutral-100" {...props} />
  ),
  tbody: (props: React.ComponentProps<"tbody">) => (
    <tbody className="bg-white" {...props} />
  ),
  tr: (props: React.ComponentProps<"tr">) => (
    <tr className="transition-colors hover:bg-neutral-50/50" {...props} />
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th
      className={cn(
        cellBorder,
        "px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-600"
      )}
      {...props}
    />
  ),
  td: (props: React.ComponentProps<"td">) => (
    <td
      className={cn(
        cellBorder,
        "px-6 py-5 align-top text-neutral-700",
        "[&:first-child]:min-w-[7rem] [&:first-child]:font-semibold [&:first-child]:text-neutral-950"
      )}
      {...props}
    />
  ),
};
