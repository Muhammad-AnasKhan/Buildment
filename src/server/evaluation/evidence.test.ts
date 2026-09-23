import { describe, expect, it } from "vitest";
import { classifyProjectEvidence, evidenceUrlParts } from "./evidence";

describe("classifyProjectEvidence", () => {
  it("classifies repository evidence from a GitHub URL", () => {
    expect(
      classifyProjectEvidence({
        prompt: "Share your work",
        url: "https://github.com/ada/freshmarket",
      })
    ).toBe("Repository");
  });

  it("classifies video_demo evidence", () => {
    expect(
      classifyProjectEvidence({
        prompt: "Show the milestone",
        submissionMode: "video_demo",
        url: "https://example.com/walkthrough",
      })
    ).toBe("Demo video");
  });

  it("rejects unsafe evidence URLs before rendering", () => {
    expect(evidenceUrlParts("javascript:alert(1)")).toBeNull();
  });

  it("returns a readable repository path", () => {
    expect(evidenceUrlParts("https://github.com/ada/freshmarket")?.displayPath).toBe(
      "/ada/freshmarket"
    );
  });
});
