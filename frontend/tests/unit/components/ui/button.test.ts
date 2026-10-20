import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "@/components/ui/button";

const form = vi.hoisted(() => ({
  pending: false,
  data: null as FormData | null,
}));

vi.mock("react-dom", async (importOriginal) => ({
  ...await importOriginal<typeof import("react-dom")>(),
  useFormStatus: () => form,
}));

describe("shared button loading", () => {
  beforeEach(() => {
    form.pending = false;
    form.data = null;
  });

  it("does not treat a disabled action as a loading action", () => {
    const html = renderToStaticMarkup(createElement(Button, { disabled: true }, "Unavailable"));
    expect(html).toContain("disabled");
    expect(html).not.toContain('aria-busy="true"');
    expect(html).not.toContain("animate-spin");
  });

  it("automatically disables a submit button and shows pending feedback", () => {
    form.pending = true;
    const html = renderToStaticMarkup(createElement(Button, { type: "submit" }, "Save profile"));
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("disabled");
    expect(html).toContain("animate-spin");
    expect(html).toContain("Save profile");
    expect(html).not.toContain("invisible");
  });

  it("only shows a spinner on the chosen action in a multi-submit form", () => {
    form.pending = true;
    form.data = new FormData();
    form.data.set("verdict", "NEEDS_REVISION");
    const approve = renderToStaticMarkup(createElement(Button, {
      type: "submit", name: "verdict", value: "APPROVED",
    }, "Approve"));
    const revise = renderToStaticMarkup(createElement(Button, {
      type: "submit", name: "verdict", value: "NEEDS_REVISION",
    }, "Request changes"));
    expect(approve).toContain("disabled");
    expect(approve).not.toContain('aria-busy="true"');
    expect(revise).toContain('aria-busy="true"');
  });

  it("leaves non-submit controls usable while a form is pending", () => {
    form.pending = true;
    const html = renderToStaticMarkup(createElement(Button, { type: "button" }, "Preview"));
    expect(html).not.toContain('aria-busy="true"');
    expect(html).not.toContain('disabled=""');
  });

  it("supports explicit loading labels and keeps the original accessible content", () => {
    const html = renderToStaticMarkup(createElement(Button, {
      loading: true, loadingLabel: "Publishing…", "aria-label": "Publish chapter",
    }, "Publish"));
    expect(html).toContain('aria-label="Publish chapter"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Publishing…");
  });
});
