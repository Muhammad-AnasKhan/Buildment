import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBrowserStorage, useHydrated } from "@/lib/use-browser-storage";

function Preference({ storageKey }: { storageKey?: string }) {
  const [value] = useBrowserStorage(storageKey, "default");
  return createElement("span", null, `${useHydrated()}:${value}`);
}

afterEach(() => vi.unstubAllGlobals());

describe("browser preference hydration", () => {
  it("renders safely without a browser or storage key", () => {
    expect(renderToStaticMarkup(createElement(Preference))).toBe("<span>false:default</span>");
  });

  it("keeps the hydration snapshot deterministic when browser preferences differ", () => {
    const getItem = vi.fn(() => "saved");
    vi.stubGlobal("window", { localStorage: { getItem } });
    expect(renderToStaticMarkup(createElement(Preference, { storageKey: "preference" })))
      .toBe("<span>false:default</span>");
    expect(getItem).not.toHaveBeenCalled();
  });
});
