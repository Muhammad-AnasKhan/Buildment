import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 7.4: three places where Maryam (fictional) puts the
// link to her Halaqa case study: a message, the top of a resume and a profile
// section. Each shows the result beside the same link. The words of a resume
// and a profile belong to another course; the picture shows only where the
// link goes.

const MESSAGE: SpecScreen = {
  alt: "A message to a reviewer: a greeting, one sentence with the result 4 of 5 classmates joined a study group, and one link to the case study.",
  blocks: [
    { kind: "nav", title: "Message to Dalia" },
    {
      kind: "box",
      fill: "muted",
      pad: 12,
      radius: 10,
      gap: 8,
      children: [
        { kind: "text", text: "Hi Dalia. In a check with 5 classmates, 4 joined a study group in their first visit, up from 2.", size: 13 },
        { kind: "text", text: "Case study and guest demo:", size: 12.5, tone: "muted" },
        { kind: "text", text: "Link to the Halaqa case study", size: 13, weight: 600, tone: "accent" },
      ],
    },
  ],
};

const RESUME: SpecScreen = {
  alt: "The top of a resume page: a name, then a project line with the result and the link to the case study beside it.",
  frame: "browser",
  blocks: [
    { kind: "text", text: "Maryam", size: 20, weight: 800 },
    { kind: "text", text: "Software engineer", size: 13, tone: "muted" },
    { kind: "divider" },
    { kind: "text", text: "Projects", size: 13, weight: 700 },
    { kind: "text", text: "Halaqa: 4 of 5 classmates joined a study group in their first visit.", size: 13 },
    { kind: "text", text: "Link to the Halaqa case study", size: 13, weight: 600, tone: "accent" },
  ],
};

const PROFILE: SpecScreen = {
  alt: "A profile page with a Featured section: a picture card titled Halaqa case study, a line with the result, and the same link.",
  blocks: [
    { kind: "nav", title: "Profile" },
    { kind: "text", text: "Featured", size: 16, weight: 700 },
    {
      kind: "box",
      border: true,
      pad: 10,
      gap: 8,
      children: [
        { kind: "image", art: "photo", height: 80, caption: "Halaqa case study" },
        { kind: "text", text: "4 of 5 joined a study group in their first visit", size: 13, weight: 600 },
        { kind: "text", text: "Link to the Halaqa case study", size: 12.5, tone: "accent" },
      ],
    },
  ],
};

export const productM7WhereLinksGo: CustomCanvasSpec = {
  kind: "custom",
  title: "One link, three places",
  purpose: "Switch between a message, the top of a resume and a profile section, and see that each one puts the result beside the same link.",
  limits:
    "The drawings show where the link goes, not the best words for a resume or a profile. Those belong to another course. Maryam, Dalia and Halaqa are fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Where the link sits",
    versions: [
      { id: "message", label: "Message", screen: MESSAGE, verdict: { text: "A result and one link", tone: "good" } },
      { id: "resume", label: "Resume", screen: RESUME, verdict: { text: "The link sits by the project", tone: "good" } },
      { id: "profile", label: "Profile", screen: PROFILE, verdict: { text: "Featured leads to the page", tone: "good" } },
    ],
    hint: "Touch each place. Look for the result and the link.",
  }),
};
