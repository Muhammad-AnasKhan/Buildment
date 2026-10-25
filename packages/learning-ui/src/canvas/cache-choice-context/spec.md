---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 6.4
slug: cache-choice-context
version: 1
owner: interaction-designer
---

# Canvas spec: The cache depends on your context

## Teaching claim
Redis or Valkey depends on what you do with it (internal use, or selling hosting), which features you need (a plain cache, or the Redis 8 types) and where it runs. For a plain cache for your own use, the commands overlap and licence, hosting and habit decide.

## Why a canvas
The same assistant answer ("Redis") fits Tala's team and not Munir's company. Switching Your use shows the answer move on one fact, which is the module's claim.

## Model
Data for the shared context picker. First matching rule wins; `checkContextConfig` is clean; every option is reached.

- Factors: Your use (Internal use, Sell hosting); Features (Plain cache, Redis 8 types); Where it runs (Own machine, AWS or Google, Redis service).
- Options: Redis (3 licence options), Valkey (BSD 3-clause), Either (licence and price).
- Start: Internal use, Plain cache, Own machine (Either): Tala's team.

| Rule | When | Pick | Dossier ids behind it |
|---|---|---|---|
| 0 | sell hosting and Redis 8 types | Redis | B32 (types in Redis 8 core), B31 (RSALv2 forbids managed service; SSPLv1 copyleft; AGPLv3 third option) |
| 1 | sell hosting | Valkey | B31, B34 (BSD 3-clause, no field-of-use limit) |
| 2 | Redis 8 types | Redis | B32, B34 (Valkey forked at Redis 7.2.4) |
| 3 | AWS or Google | Valkey | B38 (AWS lists Valkey 20% lower for node-based, 33% for serverless), B39 (Memorystore for Valkey) |
| 4 | Redis's own service | Redis | the course's reading of B29 to B31 |
| fallback | internal, plain cache, own machine | Either | the course's reading of B29 to B41: commands overlap |

Results over all 12 combinations: internal+plain+own Either; internal+plain+cloud Valkey; internal+plain+Redis service Redis; every internal+types Redis; every sell+plain Valkey; every sell+types Redis. Munir's company is sell+plain+own, which gives Valkey.

- Left out on purpose: any claim that Valkey is faster (B36, B37 are project claims; B40 is a commercial claim; no neutral benchmark was found, U4); "Redis is closed source" (outdated since 2025-05-01, B30, B31); Dragonfly and KeyDB (B42, B43 are vendor and older-lineage notes in the fold).
- Assumptions: licence, version and price facts checked 2026-10-25 and written with that date in the chapter. The picker is not legal advice.
- Limitations: stated in `limits`.

## Rendering
The shared `ContextPicker` primitive with three factors (one has three choices) and three options. Every reason is 83 characters or fewer.

## Controls
Pills for each factor and "Reset".

## Copy
- What this shows: which cache fits, with the reason.
- Try this: 1. Switch Your use to Sell hosting (Munir). 2. Add the Redis 8 types. 3. Go back to Internal use and choose AWS or Google.
- What changed: the ring moves and the reason changes.
- Limits of the model: see `limits`.

## Edge cases
"Redis 8 types" is a 13-character choice. "3 licence options" is 17 characters and fits the card. The fallback is reached by the start context.

## Accessibility
As the shared primitive.

## Acceptance criteria
- [x] The claim is testable.
- [x] The model is tested (`checkContextConfig` clean; 12 combinations resolve as listed).
- [x] The design is simple and legible.
- [ ] Prediction before, transfer check after (chapter 6.4: predict before the canvas, two quiz items after).
- [x] Reader fallback exists (the table in the chapter's fold).

## Placement
Course 13 v2, chapter 6.4 "Two defaults worth questioning", beat 2 ("Pick the cache for each team"). Data: `cache-choice-context/data.ts` (`CACHE_CHOICE_CONTEXT`, `cacheChoiceContext`). The orchestrator registers the slug.
