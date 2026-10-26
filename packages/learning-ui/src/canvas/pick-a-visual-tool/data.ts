import type { CustomCanvasSpec } from "../registry";
import type { ContextPickerConfig } from "../models/context-picker";
import { makeContextPickerCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 9.2: the kind of visual tool depends on the job, on
// whether you can pay and on your device. Every pick has a free path.
// Dossier: C1 to C3 (artifacts, Claude Design), C6 (Codex), C8 and C9 (Gemini
// Canvas), C10 and C11 (Stitch), C15 (OBS), C16 (page weight).

export const PICK_A_VISUAL_TOOL: ContextPickerConfig = {
  question: "Which kind of visual tool fits?",
  factors: [
    {
      id: "job",
      label: "What to show",
      choices: [
        { id: "diagram", label: "How parts fit" },
        { id: "screen", label: "A screen" },
        { id: "video", label: "It working" },
      ],
    },
    {
      id: "pay",
      label: "Can you pay?",
      choices: [
        { id: "free", label: "Free only" },
        { id: "paid", label: "Can pay" },
      ],
    },
    {
      id: "device",
      label: "Your device",
      choices: [
        { id: "phone", label: "Phone only" },
        { id: "laptop", label: "Laptop" },
      ],
    },
  ],
  options: [
    { id: "text-diagram", label: "Text diagram", sub: "Mermaid" },
    { id: "chat-page", label: "Chat page", sub: "artifact or Canvas" },
    { id: "design-tool", label: "Design tool", sub: "paid or Labs" },
    { id: "paper-sketch", label: "Paper sketch", sub: "photo, labelled" },
    { id: "recording", label: "Recording", sub: "phone or OBS" },
  ],
  rules: [
    {
      when: { job: "diagram" },
      pick: "text-diagram",
      why: "A diagram written as text is drawn for free in a phone browser. Money does not change it.",
    },
    {
      when: { job: "video" },
      pick: "recording",
      why: "A short recording of the real app is small and free. A phone recorder or OBS makes it.",
    },
    {
      when: { job: "screen", pay: "paid" },
      pick: "design-tool",
      why: "A design tool lays out whole screens. At the time of writing, some need a paid plan.",
    },
    {
      when: { job: "screen", pay: "free", device: "laptop" },
      pick: "chat-page",
      why: "A chat assistant builds a small page you can open and edit. Free plans have limits.",
    },
  ],
  fallback: {
    pick: "paper-sketch",
    why: "Phone and no budget: photograph a labelled paper sketch. Try a chat page too, if it opens.",
  },
  start: { job: "screen", pay: "free", device: "phone" },
  hint: "Tap a fact to change it. Watch which kind of tool fits, and why.",
};

export const pickAVisualTool: CustomCanvasSpec = {
  kind: "custom",
  title: "Pick a visual tool for the job",
  purpose: "Change what you need to show, whether you can pay and your device, and see which kind of tool fits and why.",
  limits:
    "These picks are this course's advice for one small project, not a ranking of tools. Tools, plans and limits change, so check each tool's own page. Some tools need you to be 18 or older; every pick has a second tool or a free fallback in the chapter.",
  component: makeContextPickerCanvas(PICK_A_VISUAL_TOOL),
};
