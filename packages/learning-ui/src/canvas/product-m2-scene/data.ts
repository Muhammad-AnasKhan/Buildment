import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.1: Nadia, a team lead (fictional), opens ten project
// pages. Two of them are shown: all lines alike, and the name loudest. The third
// is Laith's page a week later, rebuilt so that the result comes first. All three
// say true things; they differ in what comes first.

const FLAT: SpecScreen = {
  alt: "Fares's project page. Seven lines of text, all the same size and weight: his name, the project, what it does, the tools, and links to the demo, the code and his bio.",
  blocks: [
    { kind: "text", text: "Fares's portfolio", size: 13, weight: 500 },
    { kind: "text", text: "Project: a bus timetable app", size: 13, weight: 500 },
    { kind: "text", text: "It shows bus times for the city.", size: 13, weight: 500 },
    { kind: "text", text: "Built with React and Node.", size: 13, weight: 500 },
    { kind: "text", text: "Open the demo", size: 13, weight: 500 },
    { kind: "text", text: "See the code", size: 13, weight: 500 },
    { kind: "text", text: "About me", size: 13, weight: 500 },
  ],
};

const NAME: SpecScreen = {
  alt: "Yasmin's project page. Her name is very large at the top. Her job title and her project are in small grey text underneath.",
  blocks: [
    { kind: "text", text: "Yasmin", size: 32, weight: 800 },
    { kind: "text", text: "Software developer", size: 14, tone: "muted" },
    { kind: "space", height: 12 },
    { kind: "text", text: "Projects", size: 12, tone: "muted", caps: true },
    { kind: "text", text: "A queue app for a clinic desk", size: 12, tone: "muted" },
    { kind: "text", text: "React and Node", size: 12, tone: "muted" },
  ],
};

const RESULT: SpecScreen = {
  alt: "Laith's project page. A large headline says a clinic's waiting time went from 25 minutes to 10. A picture of the app and one button, Open the demo, follow. Small grey text gives the tools.",
  blocks: [
    { kind: "text", text: "Clinic desk queue app", size: 11, weight: 600, tone: "muted", caps: true },
    { kind: "text", text: "Waiting time at the desk: 25 minutes down to 10", size: 22, weight: 700 },
    { kind: "image", art: "list", height: 84 },
    { kind: "button", label: "Open the demo", full: true },
    { kind: "text", text: "Laith built it in 3 weeks with React and Node.", size: 12, tone: "muted" },
  ],
};

export const productM2Scene: CustomCanvasSpec = {
  kind: "custom",
  title: "Three project pages",
  purpose: "Switch between two project pages Nadia opened in one morning and a third, rebuilt a week later, and notice which one tells you something in a glance.",
  limits:
    "Three pages cannot show every way a page can fail, and a glance is not a test. The people, the apps and the numbers are fictional and made up for this picture.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Project page",
    versions: [
      { id: "fares", label: "Fares", screen: FLAT, verdict: { text: "Nothing comes first", tone: "bad" } },
      { id: "yasmin", label: "Yasmin", screen: NAME, verdict: { text: "Her name comes first", tone: "warn" } },
      { id: "laith", label: "Laith", screen: RESULT, verdict: { text: "The result comes first", tone: "good" } },
    ],
    hint: "Switch between the three pages and see what you notice first on each.",
    start: "fares",
  }),
};
