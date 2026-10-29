import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Software Engineering Concepts course (software-engineering-concepts),
// chapter 1.5 "Same idea, different names". Sort a name from another stack
// into the Errand shape it matches, or into "Other meaning" when the name
// belongs to a different idea. Card text never holds the bucket's own label,
// so the learner sorts by the job and not by the word. Every card comes from
// the course's research dossier (section 2.1 and 4.3); names the dossier does
// not source are left out. Errand is a fictional app. See spec.md.

export const STACK_BUCKETS: SortBucket[] = [
  { id: "dto", label: "DTO", sub: "what a client may send" },
  { id: "domain", label: "Domain model", sub: "the rules live here" },
  { id: "view", label: "View model", sub: "what the screen gets" },
  { id: "other", label: "Other meaning", sub: "not an Errand shape" },
];

export const STACK_CARDS: SortCard[] = [
  {
    id: "nest-dto",
    text: "NestJS: a class of allowed fields, checked by ValidationPipe, with a whitelist.",
    answer: "dto",
    why: {
      domain: "It checks what arrives. It holds no business rules.",
      view: "It guards input. A view model shapes the output.",
      other: "It has the same job as Errand's DTO, so it is not different.",
    },
  },
  {
    id: "laravel-resource",
    text: "Laravel API Resource: toArray() builds the JSON a response sends.",
    answer: "view",
    why: {
      dto: "A Resource shapes output. A DTO guards input.",
      domain: "It sits between the model and the JSON. It holds no rules.",
      other: "It does the job of Errand's view model, under another name.",
    },
  },
  {
    id: "fowler-pattern",
    text: "Fowler's pattern: one object carries many fields between two processes.",
    answer: "other",
    why: {
      dto: "It was made to cut remote calls, not to guard an API edge.",
      domain: "It carries data. It does not hold the rules.",
      view: "It was made to cut remote calls, not to feed a screen.",
    },
  },
  {
    id: "mvvm-model",
    text: "MVVM: the data side. It knows nothing of the screen or of the class that feeds it.",
    answer: "domain",
    why: {
      dto: "A DTO carries data in. This is the part that gets read.",
      view: "The screen's class reads from it. It does not know that class.",
      other: "It is the data side that gets read, like Errand's.",
    },
  },
  {
    id: "rails-params",
    text: "Rails strong parameters: keys you do not list are dropped.",
    answer: "dto",
    why: {
      domain: "It filters the request. It holds no rules.",
      view: "It guards input. A view model shapes output.",
      other: "It has the same job as Errand's DTO, but drops keys where Errand refuses.",
    },
  },
  {
    id: "drf-all-fields",
    text: "Django REST Framework: a serializer that sets fields = '__all__' for the response.",
    answer: "view",
    why: {
      dto: "Here it builds the response. A DTO guards what comes in.",
      domain: "It sends fields out. It holds no rules.",
      other: "It shapes the output, only without choosing the fields.",
    },
  },
  {
    id: "laravel-form-request",
    text: "Laravel Form Request: validated() returns only the fields that passed.",
    answer: "dto",
    why: {
      domain: "It checks the request. It holds no business rules.",
      view: "It guards input. Laravel's Resource shapes output.",
      other: "It has the same job as Errand's DTO, so it is not different.",
    },
  },
  {
    id: "mvvm-view-model",
    text: "MVVM: the class that gives the screen its data, in a form it can bind to.",
    answer: "view",
    why: {
      dto: "It feeds the screen. A DTO guards what comes in.",
      domain: "It reads from the model and converts it for the view.",
      other: "It does the job of Errand's view model, so it is not different.",
    },
  },
];

export const seM1StackNames: CustomCanvasSpec = {
  kind: "custom",
  title: "Match names from other stacks",
  purpose: "Sort eight names from other stacks into the Errand shape each one matches, or into Other meaning, with a short reason after each wrong try.",
  limits:
    "Only names the course has a source for are here; other cells vary by project. The database row has no bucket because no sourced stack name matches it. One word can mean different things in different stacks, and docs change between versions (the Laravel pages read were version 12). Errand is fictional.",
  component: makeSorterCanvas({
    buckets: STACK_BUCKETS,
    cards: STACK_CARDS,
    deckLabel: "Name from another stack",
    prompt: "Which Errand shape is this?",
    hint: "Tap the shape this name matches, or drag the card onto it.",
    endNote: "Names change by stack. Ask what job the class does: guard input, hold rules, feed the screen, or something else.",
  }),
};
