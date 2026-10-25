---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 6.4
slug: metrics-store-context
version: 1
owner: interaction-designer
---

# Canvas spec: The metrics store depends on your context

## Teaching claim
Prometheus on one server is single node by design and fits many teams. Several servers point to Thanos or Mimir; a wish for downsampling points to a paid VictoriaMetrics edition; long retention with memory or disk cost is a reason to test VictoriaMetrics, whose savings are the vendor's claim until you measure.

## Why a canvas
The default answer ("use Prometheus" or "use VictoriaMetrics, it uses 7 times less memory") hides four facts that change the answer. Setting each fact shows which one moves it.

## Model
Data for the shared context picker. First matching rule wins; `checkContextConfig` is clean; every option is reached.

- Factors: Metrics servers (One, Several); Keep data for (Weeks, Years); Main pain (None, RAM or disk); You need (Free edition, Downsampling).
- Options: Prometheus (single node), VictoriaMetrics (Apache 2.0), VM Enterprise (paid edition), Thanos/Mimir (on top of Prometheus).
- Start: One, Weeks, None, Free edition (Prometheus).

| Rule | When | Pick | Dossier ids behind it |
|---|---|---|---|
| 0 | several servers | Thanos/Mimir | B27 (Thanos: high availability and long-term storage on top of Prometheus), B28 (Mimir: scalable, multi-tenant, AGPLv3), B18 (remote storage targets) |
| 1 | needs downsampling | VM Enterprise | B24 (downsampling is listed as enterprise-only) |
| 2 | years and cost pain | VictoriaMetrics | B22 (Apache 2.0), B26 (savings are a vendor claim, so the reason says "test") |
| 3 | years | Prometheus | B17 (years can be kept locally with proper design; snapshots for backup) |
| 4 | cost pain | VictoriaMetrics | B22, B26 |
| fallback | one server, weeks, no pain, free edition | Prometheus | B17 to B20 (the default, widely documented, standalone) |

Results over all 16 combinations: every "several" combination gives Thanos/Mimir; every "one + Downsampling" combination gives VM Enterprise; one + years + cost + free gives VictoriaMetrics; one + weeks + cost + free gives VictoriaMetrics; one + years + none + free gives Prometheus; one + weeks + none + free gives Prometheus (fallback).

- Left out on purpose: any claim that VictoriaMetrics uses 7 times less memory (B26 is a vendor claim from vendor-authored benchmarks; no independent comparison was found, U3); "drop-in replacement" (B23 is the vendor's description); VictoriaMetrics cluster advice (B25 is in the chapter's fold).
- Assumptions: the rules are the course's reading of project docs checked 2026-10-25.
- Limitations: other tools exist, editions and licences change; stated in `limits`.

## Rendering
The shared `ContextPicker` primitive with four factors of two choices and four options. Every reason is 83 characters or fewer.

## Controls
Pills for each factor and "Reset".

## Copy
- What this shows: the store the project docs point to for these facts, with the reason.
- Try this: 1. Change Keep data for to Years. 2. Add RAM or disk as the main pain. 3. Switch Metrics servers to Several. 4. Return and choose Downsampling.
- What changed: the ring moves and the reason changes.
- Limits of the model: see `limits`.

## Edge cases
"Thanos/Mimir" and "on top of Prometheus" wrap to two lines; four options fit without touching. Several servers override every other fact by design (rule 0 first).

## Accessibility
As the shared primitive: buttons with `aria-pressed`, visible focus, live line for the result, reduced-motion safe.

## Acceptance criteria
- [x] The claim is testable.
- [x] The model is tested (`checkContextConfig` clean; 16 combinations resolve as listed).
- [x] The design is simple and legible.
- [ ] Prediction before, transfer check after (chapter 6.4: the predict is on the cache beat; two quiz items after).
- [x] Reader fallback exists (the table in the chapter's fold).

## Placement
Course 13 v2, chapter 6.4 "Two defaults worth questioning", beat 4 ("Pick the metrics store"). Data: `metrics-store-context/data.ts` (`METRICS_STORE_CONTEXT`, `metricsStoreContext`). The orchestrator registers the slug.
