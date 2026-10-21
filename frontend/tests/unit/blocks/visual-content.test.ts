import { describe, expect, it } from "vitest";
import { VideoConfigSchema } from "@/shared/blocks/video/schema";
import { VisualWalkthroughConfigSchema } from "@/shared/blocks/visual-walkthrough/schema";
import { VisualDiagramConfigSchema } from "@/shared/blocks/visual-diagram/schema";
import { RoadmapConfigSchema } from "@/shared/blocks/roadmap/schema";

describe("link-based visual content", () => {
  it("accepts trusted video providers and rejects arbitrary pages", () => {
    expect(VideoConfigSchema.safeParse({ title: "Intro", sourceUrl: "https://youtu.be/abcdefgh" }).success).toBe(true);
    expect(VideoConfigSchema.safeParse({ title: "Unsafe", sourceUrl: "https://example.com/page" }).success).toBe(false);
  });

  it("requires descriptive image alternatives for visual content", () => {
    expect(VisualDiagramConfigSchema.safeParse({ title: "Boundary", imageUrl: "https://cdn.example.com/diagram.png", alt: "Browser request passes through the API to the database" }).success).toBe(true);
    expect(VisualWalkthroughConfigSchema.safeParse({ title: "Flow", steps: [{ id: "one", title: "One", description: "Send the request", imageUrl: "https://cdn.example.com/one.png", alt: "First step image" }] }).success).toBe(false);
  });

  it("accepts local course assets without allowing external or executable paths", () => {
    const diagram = (imageUrl: string) => VisualDiagramConfigSchema.safeParse({ title: "Ticketline core loop", imageUrl, alt: "Organizer publishes, buyer pays, and gate staff scans a ticket" }).success;
    const walkthrough = (imageUrl: string) => VisualWalkthroughConfigSchema.safeParse({ title: "Ticketline flow", steps: [
      { id: "publish", title: "Publish", description: "Organizer publishes the event", imageUrl, alt: "Organizer sends an event to the public catalogue" },
      { id: "scan", title: "Scan", description: "Gate staff scans the ticket", imageUrl, alt: "Gate staff checks the issued ticket at entry" },
    ] }).success;

    expect(diagram("/course-assets/ticketline/core-loop.svg")).toBe(true);
    expect(walkthrough("/course-assets/ticketline/auth-flow.svg")).toBe(true);
    expect(diagram("//evil.example/diagram.svg")).toBe(false);
    expect(diagram("/\\evil.example/diagram.svg")).toBe(false);
    expect(diagram("javascript:alert(1)")).toBe(false);
    expect(walkthrough("//evil.example/diagram.svg")).toBe(false);
  });

  it("requires unique roadmap milestones and only one current step", () => {
    expect(RoadmapConfigSchema.safeParse({ title: "Path", milestones: [{ id: "a", title: "Start", description: "Set up the project", state: "current" }, { id: "a", title: "Finish", description: "Deploy the project", state: "goal" }] }).success).toBe(false);
    expect(RoadmapConfigSchema.safeParse({ title: "Path", milestones: [{ id: "a", title: "Start", description: "Set up the project", state: "current" }, { id: "b", title: "Finish", description: "Deploy the project", state: "goal" }] }).success).toBe(true);
  });
});
