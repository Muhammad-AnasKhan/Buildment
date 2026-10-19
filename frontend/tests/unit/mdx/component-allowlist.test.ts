import { describe, expect, it } from "vitest";
import { MDX_COMPONENT_NAMES } from "@/shared/mdx/component-allowlist";
import { mdxComponents } from "../../../src/mdx/components";

// The API validates chapter drafts against the shared allowlist; the frontend
// renders with this component map. Adding a component to one without the other
// would either block publishing or render a callout, so keep them identical.
describe("mdx component allowlist", () => {
  it("matches the uppercase names in the component map", () => {
    const rendered = Object.keys(mdxComponents).filter((name) => /^[A-Z]/.test(name)).sort();
    expect([...MDX_COMPONENT_NAMES].sort()).toEqual(rendered);
  });
});
