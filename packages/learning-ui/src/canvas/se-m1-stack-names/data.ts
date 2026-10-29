import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Software Engineering Concepts course (software-engineering-concepts),
// chapter 1.5 "Same idea, different names". Sort a name from another stack
// into the Errand shape it matches. Every card comes from the course's
// research dossier (section 2.1 and 4.3); names the dossier does not source
// are left out. Errand is a fictional app. See spec.md.

export const STACK_BUCKETS: SortBucket[] = [
  { id: "dto", label: "DTO", sub: "what a client may send" },
  { id: "domain", label: "Domain model", sub: "the rules live here" },
  { id: "row", label: "Database row", sub: "the stored form" },
  { id: "view", label: "View model", sub: "what the screen gets" },
];

export const STACK_CARDS: SortCard[] = [
  {
    id: "nest-dto",
    text: "NestJS: a DTO class checked by ValidationPipe, with a whitelist.",
    answer: "dto",
    why: {
      domain: "It checks what arrives. It holds no business rules.",
      row: "It is not a stored shape. It checks data coming in.",
      view: "It guards input. A view model shapes the output.",
    },
  },
  {
    id: "laravel-resource",
    text: "Laravel API Resource: toArray() turns a model into JSON.",
    answer: "view",
    why: {
      dto: "A Resource shapes output. A DTO guards input.",
      domain: "It sits between the model and the JSON. It holds no rules.",
      row: "The model is what it reads. The JSON is what leaves.",
    },
  },
  {
    id: "fowler-dto",
    text: "Fowler's original DTO: a bundle of data sent between two processes.",
    answer: "dto",
    why: {
      domain: "It carries data. It does not hold the rules.",
      row: "It is a bundle made for sending, not a stored row.",
      view: "It was made to cut remote calls, not to feed a screen.",
    },
  },
  {
    id: "mvvm-model",
    text: "MVVM docs: the model is what the view model reads from.",
    answer: "domain",
    why: {
      dto: "A DTO carries data in. The MVVM model is what gets read.",
      row: "MVVM calls many kinds of class a model, not only rows.",
      view: "The view model reads the model. The model does not know it.",
    },
  },
  {
    id: "rails-params",
    text: "Rails strong parameters: keys you do not list are dropped.",
    answer: "dto",
    why: {
      domain: "It filters the request. It holds no rules.",
      row: "It filters what arrives. It does not match the table.",
      view: "It guards input. A view model shapes output.",
    },
  },
  {
    id: "drf-all-fields",
    text: "Django REST Framework: fields = '__all__' sends every model field out.",
    answer: "row",
    why: {
      dto: "'__all__' is about output. A DTO is for input.",
      domain: "It sends stored fields out, not the rules.",
      view: "A view model lists fields on purpose. '__all__' does not.",
    },
  },
  {
    id: "laravel-form-request",
    text: "Laravel Form Request: validated() returns only the fields that passed.",
    answer: "dto",
    why: {
      domain: "It checks the request. It holds no business rules.",
      row: "It is made for requests, not for the table.",
      view: "It guards input. Laravel's Resource shapes output.",
    },
  },
  {
    id: "mvvm-view-model",
    text: "MVVM view model: data in a form the view can bind to.",
    answer: "view",
    why: {
      dto: "It feeds the screen. A DTO guards what comes in.",
      domain: "It reads from the model and converts it for the view.",
      row: "It is made for the view, not for storage.",
    },
  },
];

export const seM1StackNames: CustomCanvasSpec = {
  kind: "custom",
  title: "Match names from other stacks",
  purpose: "Sort eight names from other stacks into the Errand shape each one matches, with a short reason after each wrong try.",
  limits:
    "Only names the course has a source for are here; other cells vary by project. One word can mean different things in different stacks, and docs change between versions (the Laravel pages read were version 12). Errand is fictional.",
  component: makeSorterCanvas({
    buckets: STACK_BUCKETS,
    cards: STACK_CARDS,
    deckLabel: "Name from another stack",
    prompt: "Which Errand shape is this?",
    hint: "Tap the shape this name matches, or drag the card onto it.",
    endNote: "Names change by stack. Ask what job the class does: guard input, hold rules, match storage or feed the screen.",
  }),
};
