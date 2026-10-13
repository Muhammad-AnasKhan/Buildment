import { describe, expect, it } from "vitest";
import { VideoConfigSchema } from "./video/schema";
import { VisualWalkthroughConfigSchema } from "./visual-walkthrough/schema";
import { VisualDiagramConfigSchema } from "./visual-diagram/schema";
import { RoadmapConfigSchema } from "./roadmap/schema";

describe("link-based visual content", () => {
  it("accepts trusted video providers and rejects arbitrary pages", () => {
    expect(VideoConfigSchema.safeParse({ title: "Intro", sourceUrl: "https://youtu.be/abcdefgh" }).success).toBe(true);
    expect(VideoConfigSchema.safeParse({ title: "Unsafe", sourceUrl: "https://example.com/page" }).success).toBe(false);
  });

  it("requires descriptive image alternatives for visual content", () => {
    expect(VisualDiagramConfigSchema.safeParse({ title: "Boundary", imageUrl: "https://cdn.example.com/diagram.png", alt: "Browser request passes through the API to the database" }).success).toBe(true);
    expect(VisualWalkthroughConfigSchema.safeParse({ title: "Flow", steps: [{ id: "one", title: "One", description: "Send the request", imageUrl: "https://cdn.example.com/one.png", alt: "First step image" }] }).success).toBe(false);
  });

  it("requires unique roadmap milestones and only one current step", () => {
    expect(RoadmapConfigSchema.safeParse({ title: "Path", milestones: [{ id: "a", title: "Start", description: "Set up the project", state: "current" }, { id: "a", title: "Finish", description: "Deploy the project", state: "goal" }] }).success).toBe(false);
    expect(RoadmapConfigSchema.safeParse({ title: "Path", milestones: [{ id: "a", title: "Start", description: "Set up the project", state: "current" }, { id: "b", title: "Finish", description: "Deploy the project", state: "goal" }] }).success).toBe(true);
  });
});
