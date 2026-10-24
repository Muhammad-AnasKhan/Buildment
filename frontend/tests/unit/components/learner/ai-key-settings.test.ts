import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AiKeySettingsView, type AiKeySettingsViewProps } from "@/components/learner/ai-key-settings-view";
import type { AiCredentialStatus } from "@/shared/api/ai";

const base: AiCredentialStatus = {
  configured: true,
  hasKey: false,
  provider: "OPENROUTER",
  lastFour: null,
  model: null,
  defaultModel: "google/gemini-2.5-flash",
  updatedAt: null,
  lastUsedAt: null,
};

const noop = () => {};
function render(status: Partial<AiCredentialStatus> = {}, props: Partial<AiKeySettingsViewProps> = {}) {
  return renderToStaticMarkup(
    createElement(AiKeySettingsView, {
      status: { ...base, ...status },
      keyDraft: "",
      modelDraft: status.model ?? "",
      replacing: false,
      busy: null,
      message: null,
      error: null,
      onKeyChange: noop,
      onModelChange: noop,
      onSave: noop,
      onTest: noop,
      onSaveModel: noop,
      onDelete: noop,
      onReplace: noop,
      ...props,
    })
  );
}

describe("AI key settings", () => {
  it("has an anchor the interview block links to", () => {
    expect(render()).toContain('id="ai-interviews"');
  });

  it("says so when the server cannot store keys, and offers no key box", () => {
    const html = render({ configured: false });
    expect(html).toContain("AI interviews are not set up on this server.");
    expect(html).not.toContain("<input");
  });

  it("explains cost and privacy in plain English", () => {
    const html = render();
    expect(html).toContain("Cost:");
    expect(html).toContain("a few cents");
    expect(html).toContain("Privacy:");
    expect(html).toContain("encrypted");
    expect(html).toContain("delete the key at any time");
  });

  it("asks for a key in a password field that browsers will not autofill, with the default model as the placeholder", () => {
    const html = render();
    expect(html).toMatch(/<input[^>]*id="openrouter-key"[^>]*type="password"|<input[^>]*type="password"[^>]*id="openrouter-key"/);
    expect(html).toMatch(/autocomplete="off"/i);
    expect(html).toContain('placeholder="google/gemini-2.5-flash"');
    expect(html).toContain("Save and test key");
    expect(html).not.toContain("Delete key");
  });

  it("keeps the Save button disabled until the pasted key is long enough", () => {
    expect(render()).toMatch(/<button[^>]*disabled=""[^>]*>[^<]*Save and test key/);
    const ready = render({}, { keyDraft: "sk-or-v1-0123456789abcdef0123" });
    expect(ready).not.toMatch(/<button[^>]*disabled=""[^>]*>[^<]*Save and test key/);
  });

  it("shows only the last four characters of a saved key and offers test, replace and delete", () => {
    const html = render({ hasKey: true, lastFour: "1234", model: "openai/gpt-4o-mini" }, { modelDraft: "openai/gpt-4o-mini" });
    expect(html).toContain("ending in");
    expect(html).toContain("1234");
    expect(html).toContain("Test key");
    expect(html).toContain("Replace key");
    expect(html).toContain("Delete key");
    expect(html).toContain("Save model");
    expect(html).not.toContain('id="openrouter-key"');
    expect(html).toContain('value="openai/gpt-4o-mini"');
  });

  it("shows the key box again while replacing a saved key", () => {
    const html = render({ hasKey: true, lastFour: "1234" }, { replacing: true });
    expect(html).toContain('id="openrouter-key"');
    expect(html).toContain("New OpenRouter key");
    expect(html).toContain("Cancel");
  });

  it("never prints the draft key into the page text", () => {
    const draft = "sk-or-v1-secret-draft-value-0123456789";
    const html = render({}, { keyDraft: draft });
    // Controlled password input: the value attribute exists for React, but it is a password field.
    expect(html.replace(/value="[^"]*"/g, "")).not.toContain(draft);
  });

  it("reports success and errors in separate live regions", () => {
    const html = render({ hasKey: true, lastFour: "1234" }, { message: "Key checked and saved.", error: "OpenRouter did not accept this key." });
    expect(html).toContain('role="status"');
    expect(html).toContain("Key checked and saved.");
    expect(html).toContain('role="alert"');
    expect(html).toContain("OpenRouter did not accept this key.");
  });
});
