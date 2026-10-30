---
artifact: canvas-spec
course: software-engineering-concepts
chapter: 1.5-same-idea-different-names
slug: se-m1-stack-names
version: 2
owner: interaction-designer
renderer: custom, on the reusable Sorter primitive (primitives/sorter.tsx, model models/sorter.ts)
---

# Canvas spec: Match names from other stacks

## Teaching claim
Other stacks use different words for the same jobs: a Rails strong parameters list, a NestJS DTO and a Laravel Form Request all guard what a client may send, and a Laravel API Resource and an MVVM view model both shape what the screen gets. The word "DTO" first meant data sent between processes, and today frameworks use it for the shape at the API edge. The word "model" is the same trap: the MVVM docs say model classes can be plain data holders, so the name does not promise Errand's domain model. Ask what job the class does, not what the framework calls it. No card text holds the label of its own bucket, so the learner sorts by the job and not by the word.

## Why a canvas
The chapter plan names a `[names]` sorter (module brief 01, chapter 1.5, beat 2). The learner makes a choice and gets a consequence, which a static table does not give. The sorter data holds only buckets and cards; any course can reuse the primitive.

## Model
- Primitive: `makeSorterCanvas`. One card on top at a time, dealt in data order and in a seeded shuffle after "Sort again". A right bucket moves the card in; a wrong bucket keeps the card and shows the reason written for that card and that bucket.
- Buckets (3): DTO (what a client may send); View model (what the screen gets); Other meaning (not an Errand shape). Errand's "request body" and "DTO" share the first bucket. There is no Domain model bucket and no Database row bucket: no stack name in the sources matches either one. The earlier Domain model bucket held the MVVM model card, which the chapter itself says can be a plain data holder, so that card moved to Other meaning and the bucket was dropped (critic A round 2, N9). "Other meaning" also takes Fowler's original pattern, which the chapter says means something else.
- Cards (8), all from the research dossier (`01-research-dossier.md`, section 2.1 and section 4.3). Card text is copied from `data.ts`:
  - `nest-dto` (DTO): "NestJS: a class of allowed fields, checked by ValidationPipe, with a whitelist." [S36].
  - `laravel-resource` (View model): "Laravel API Resource: toArray() builds the JSON a response sends." [S35].
  - `fowler-pattern` (Other meaning): "Fowler's pattern: one object carries many fields between two processes." [S24]. This card teaches the original meaning, so its text does not use the word DTO.
  - `mvvm-model` (Other meaning): "MVVM docs: the data side. Its classes can be plain data holders." The MVVM docs say model classes can be DTOs, POCOs or generated entities [S29], so the word names a part of a pattern and not one Errand shape.
  - `rails-params` (DTO): "Rails strong parameters: keys you do not list are dropped." [S30].
  - `drf-all-fields` (View model): "Django REST Framework: a serializer that sets fields = '__all__' for the response." This is the view model's job done without choosing the fields; the docs warn that a model change can expose data [S31].
  - `laravel-form-request` (DTO): "Laravel Form Request: validated() returns only the fields that passed." [S34].
  - `mvvm-view-model` (View model): "MVVM: the class that gives the screen its data, in a form it can bind to." [S29].
- Left out on purpose: every cell the dossier marks UNVERIFIED (Rails, Spring and NestJS output shapes; Spring's use of the word DTO); the Django serializer by itself (the same class both reads and writes, so it fits two buckets); ASP.NET model binding (the docs use view models for input as well as output); plain Express `req.body` (the course defines it, no external source). Names with no source are the "varies by project" cells of the chapter table, not cards. The chapter's quick check uses Spring `@RequestBody` [S32], which is not a card.
- Weak points to check at G5: `drf-all-fields` is keyed as View model because the card says the serializer builds the response; a ModelSerializer also validates input, which the card text rules out by saying "for the response". The Laravel pages read were version 12 with a banner to 13 [S34, S35].
- Inputs: tap a bucket, or drag the card onto it (Sorter primitive).
- Numbers on screen: the three bucket counts and one count in the end verdict.
- What the learner should notice: the same job gets different names (three guards for input, three shapes for output), and the two cards that sound like Errand's shapes but are not: Fowler's pattern, made for remote calls, and the MVVM model, which can be only data.
- Limits (fold): see `limits` in `data.ts`.

## Rendering
- The shared Sorter primitive: 3 buckets use its normal tray layout. Card text is 3 lines of 40 characters or fewer; each reason is one line of about 60 characters.
- Static fallback: the chapter's table of names in prose.

## Copy
- What this shows: Sort eight names from other stacks into the Errand shape each one matches, or into Other meaning, with a short reason after each wrong try.
- Try this:
  1. Before you start, predict: is a class from a stack you have not used a new shape, or one of Errand's shapes under another name?
  2. Sort the Fowler card. Which bucket fits, and why does the reason mention remote calls?
  3. Sort the two Laravel cards. They have different jobs even though they share a framework.
- What changed: Three different names ended up in the DTO bucket and three in the View model bucket, so the word you meet in a tutorial says little about the job.
- Limits of the model: Only names the course has a source for are here; other cells vary by project. The domain model and the database row have no bucket because no sourced stack name matches them. One word can mean different things in different stacks, and docs change between versions (the Laravel pages read were version 12). Errand is fictional.

## Edge cases
A wrong try never costs points; it shows the reason and keeps the card. Under reduced motion there is no flight or shake.

## Accessibility
Shared Sorter support: real buttons over each bucket with name, gloss and count; a polite live region reads each result and reason; `FOCUS_RING` on every button.

## Acceptance criteria
- [ ] The claim is testable (the chapter's quick check sorts one new name, Spring `@RequestBody`, into a shape, and asks which meaning of DTO a class has).
- [ ] Every card traces to a dossier row; no UNVERIFIED cell is used.
- [ ] The design is simple and legible.
- [ ] A choice the learner makes: the chapter predict (is a new name a sixth shape?) comes before the canvas; the quick check comes after it.
- [ ] Reader fallback exists (the chapter's table in prose).
