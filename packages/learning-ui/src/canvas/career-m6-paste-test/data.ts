import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 16 (career-brand), module 6, chapter 6.2 beat 3: The paste test.

export const SORT_BUCKETS: SortBucket[] = [
  {
    "id": "clean",
    "label": "Pastes cleanly",
    "sub": "order and words kept"
  },
  {
    "id": "scramble",
    "label": "Can scramble",
    "sub": "order or words may break"
  }
];

export const SORT_CARDS: SortCard[] = [
  {
    "id": "one-column",
    "text": "One column of text with normal headings",
    "answer": "clean",
    "why": {
      "scramble": "Plain text keeps its order when pasted."
    }
  },
  {
    "id": "two-columns",
    "text": "Two columns side by side",
    "answer": "scramble",
    "why": {
      "clean": "A paste can read across the columns line by line."
    }
  },
  {
    "id": "text-box",
    "text": "Contact details inside a text box",
    "answer": "scramble",
    "why": {
      "clean": "Text in a box can be skipped or pasted out of order."
    }
  },
  {
    "id": "bullets",
    "text": "Bullets made with the standard bullet character",
    "answer": "clean",
    "why": {
      "scramble": "A standard bullet pastes as a normal bullet."
    }
  },
  {
    "id": "star-bars",
    "text": "Skill levels drawn as bars or stars",
    "answer": "scramble",
    "why": {
      "clean": "A drawing pastes as nothing, so the level is lost."
    }
  },
  {
    "id": "selectable-file",
    "text": "A PDF or Word file with selectable text",
    "answer": "clean",
    "why": {
      "scramble": "Text you can select pastes as text."
    }
  },
  {
    "id": "name-image",
    "text": "Your name only inside a header image",
    "answer": "scramble",
    "why": {
      "clean": "An image pastes as nothing, so your name is lost."
    }
  },
  {
    "id": "written-links",
    "text": "Links written out as plain text as well",
    "answer": "clean",
    "why": {
      "scramble": "A written link survives a paste. A button may not."
    }
  }
];

export const careerM6PasteTest: CustomCanvasSpec = {
  kind: "custom",
  title: "The paste test",
  purpose: "Sort eight layout choices into 'pastes cleanly' and 'can scramble' when a resume is pasted into a plain text editor, with a short reason after each wrong try.",
  limits: "A cautious habit, not a vendor rule. Most layout advice comes from resume-service blogs, not from vendor help pages. Different programs read files differently, so the paste test is a quick check, not a guarantee. Checked 2026-10.",
  component: makeSorterCanvas({
    buckets: SORT_BUCKETS,
    cards: SORT_CARDS,
    deckLabel: "Layout choice",
    prompt: "What happens when this is pasted?",
    hint: "Tap the bucket this belongs in, or drag the card onto it.",
    endNote: "Select all, paste into a plain text editor, and read it. If the order and the words survive, a program can read the file too.",
  }),
};
