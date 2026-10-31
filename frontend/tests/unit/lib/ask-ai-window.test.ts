import { describe, expect, it } from "vitest";
import { closesWindow, showFloatingAsk, trapTarget } from "@/lib/ask-ai-window";

describe("showFloatingAsk", () => {
  it("shows on a reading chapter when quick answers are available", () => {
    expect(showFloatingAsk({ readerMode: "DEFAULT", available: true })).toBe(true);
  });

  it("is hidden on quiz chapters, even when available", () => {
    expect(showFloatingAsk({ readerMode: "QUIZ", available: true })).toBe(false);
  });

  it("is hidden while quick answers are unavailable or not yet known", () => {
    expect(showFloatingAsk({ readerMode: "DEFAULT", available: false })).toBe(false);
  });
});

describe("closesWindow", () => {
  it("closes on Escape", () => {
    expect(closesWindow({ key: "Escape", defaultPrevented: false })).toBe(true);
  });

  it("ignores other keys", () => {
    expect(closesWindow({ key: "Enter", defaultPrevented: false })).toBe(false);
    expect(closesWindow({ key: "Tab", defaultPrevented: false })).toBe(false);
  });

  it("leaves an Escape that something inside already handled", () => {
    expect(closesWindow({ key: "Escape", defaultPrevented: true })).toBe(false);
    expect(closesWindow({ key: "Escape", defaultPrevented: false, isComposing: true })).toBe(false);
  });
});

describe("trapTarget", () => {
  it("wraps forward from the last control to the first", () => {
    expect(trapTarget({ count: 4, index: 3, shift: false })).toBe(0);
  });

  it("wraps backward from the first control to the last", () => {
    expect(trapTarget({ count: 4, index: 0, shift: true })).toBe(3);
  });

  it("lets the browser move inside the window", () => {
    expect(trapTarget({ count: 4, index: 1, shift: false })).toBeNull();
    expect(trapTarget({ count: 4, index: 2, shift: true })).toBeNull();
  });

  it("pulls focus in when it is outside the controls", () => {
    expect(trapTarget({ count: 4, index: -1, shift: false })).toBe(0);
    expect(trapTarget({ count: 4, index: -1, shift: true })).toBe(3);
  });

  it("does nothing without controls", () => {
    expect(trapTarget({ count: 0, index: -1, shift: false })).toBeNull();
  });
});
