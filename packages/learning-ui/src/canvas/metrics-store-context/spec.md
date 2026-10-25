---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 6.4
slug: metrics-store-context
version: 2
owner: interaction-designer
---

# Canvas spec: The metrics store depends on your context

## Teaching claim
Prometheus on one server is single node by design and fits many teams. Several servers that need one view point to Thanos, Mimir or the VictoriaMetrics cluster; a wish for downsampling points to a paid VictoriaMetrics edition, though other tools also offer it; and cost pain is a reason to test VictoriaMetrics, whose savings are the vendor's claim until you measure.

## Why a canvas
The default answer ("use Prometheus" or "use VictoriaMetrics, it uses 7 times less memory") hides four facts that change the answer. Setting each fact shows which one moves it.

## Model
Data for the shared context picker. First matching rule wins; `checkContextConfig` is clean; every option is reached.

- Factors: Metrics servers (One, Several); One view across (Not needed, Needed); Main pain (None, Long keep, RAM or disk); You need (Free edition, Downsampling).
- Options: Prometheus (single node), VictoriaMetrics (Apache 2.0), VM cluster (multi-node), VM Enterprise (paid edition), Thanos/Mimir (adds a global view).
- Start: One, Not needed, None, Free edition (Prometheus, by the fallback).

| Rule | When | Pick | Dossier ids behind it |
|---|---|---|---|
| 0 | several servers, one view needed, cost pain | VM cluster | B25 (cluster components; docs recommend single-node below one million data points a second), B22 |
| 1 | several servers, one view needed | Thanos/Mimir | B27, B28, B18; the reason adds that other tools also do multi-node |
| 2 | needs downsampling | VM Enterprise | B24 (downsampling is listed as enterprise-only); the reason adds that other tools also offer it, which this course did not compare |
| 3 | several servers, no shared view | Prometheus | B20 (each server is standalone by design) |
| 4 | long keep | Prometheus | B17 (years can be kept locally with proper design; snapshots for backup) |
| 5 | cost pain | VictoriaMetrics | B22, B26 (savings are a vendor claim, so the reason says "test") |
| fallback | one server, no pain, free edition | Prometheus | B17 to B20 |

Results over all 24 combinations: several + view + cost gives VM cluster; several + view (other pains) gives Thanos/Mimir; any other combination with Downsampling gives VM Enterprise; several + no view (free edition) gives Prometheus; one server + long keep gives Prometheus; one server + RAM or disk gives VictoriaMetrics; one server + no pain gives Prometheus.

- Left out on purpose: any claim that VictoriaMetrics uses 7 times less memory (B26 is a vendor claim from vendor-authored benchmarks; no independent comparison was found, U3); "drop-in replacement" (B23 is the vendor's description); a comparison of other multi-node or downsampling tools (not in the dossier).
- Assumptions: the rules are the course's reading of project docs checked 2026-10-25.
- Limitations: other tools exist, editions and licences change; stated in `limits`.

## Rendering
The shared `ContextPicker` primitive with four factors (one has three choices) and five options. Every reason is 92 characters or fewer.

## Controls
Pills for each factor and "Reset".

## Copy
- What this shows: the store the project docs point to for these facts, with the reason.
- Try this: 1. Set Main pain to Long keep. 2. Set it to RAM or disk. 3. Switch Metrics servers to Several and One view across to Needed. 4. Return and choose Downsampling.
- What changed: the ring moves and the reason changes.
- Limits of the model: see `limits`.

## Edge cases
"Thanos/Mimir" and "adds a global view" wrap to two lines; five options fit without touching (rendered in a test). Several servers with a needed view override the other facts by design (rules 0 and 1 first).

## Accessibility
As the shared primitive: buttons with `aria-pressed`, visible focus, live line for the result, reduced-motion safe.

## Acceptance criteria
- [x] The claim is testable.
- [x] The model is tested (`checkContextConfig` clean; 24 combinations resolve as listed).
- [x] The design is simple and legible.
- [ ] Prediction before, transfer check after (chapter 6.4: the predict is on the cache beat; two quiz items after).
- [x] Reader fallback exists (the table in the chapter's fold).

## Placement
Course 13 v2, chapter 6.4 "Two defaults worth questioning", beat 4 ("Pick the metrics store"). Data: `metrics-store-context/data.ts` (`METRICS_STORE_CONTEXT`, `metricsStoreContext`). The orchestrator registers the slug.
