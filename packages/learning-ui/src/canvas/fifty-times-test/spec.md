---
artifact: canvas-spec
course: founder-interviews
chapter: 05.06-check-your-work-area-by-area
slug: fifty-times-test
version: 1
owner: interaction-designer
renderer: slider (HTML controls, bars)
---

# Canvas spec: What breaks first at fifty times the traffic?

## Teaching claim
At fifty times today's traffic something reaches its limit first, and it is often not the part you expect. A good answer names the first wall and how you would know, or says honestly that you did not test it and what you would check first.

## Why a canvas
A learner can say "find the bottleneck" without feeling that several parts have different limits. Moving the multiplier and watching four bars fill at different speeds shows that one part, here an outside service's rate limit, reaches its limit long before the parts people usually worry about.

## Model
- Inputs:

  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Busiest minute today | requests/min | 10 | 100 | 10 | 40 |
  | Times today's traffic | x | 1 | 50 | 1 | 1 |
  | Queue for slow work (1=yes) | 0 or 1 | 0 | 1 | 1 | 1 |

- Outputs: requests a minute, the first wall (the used part with the lowest limit) and how many times today's traffic fills it, how many used parts are at their limit, and one bar per part with its load as a percent of its limit.
- Formula: traffic = busiest minute x times. Load of a part = traffic / limit x 100. With a queue the limits are 500 (web server), 300 (database), 160 (report workers) and 100 (email service) requests a minute. Without a queue the web server and the database do the slow work, with limits 80 and 100, and the workers and the email service are not used. First wall = the used part with the lowest limit, full at limit / busiest minute times today's traffic.
- Assumptions: the limits are fixed for this example.
- Limitations: a toy model. Real parts have no single number, real traffic does not grow evenly, and a real answer comes from a load test.

## Rendering
- Primary: the shared slider renderer (HTML sliders, bars).
- Bars share a scale of 0 to 100 percent; a part over its limit shows its real percent in the label and a bad tone.
- Static fallback: chapter 5.6 describes the four parts and the first wall in prose.

## Controls
Three sliders and Reset. The queue slider takes 0 or 1.

## Visualisation
Four labelled bars with the load of each part. Tone: warn from 70 percent, bad at 100 percent or more, none for a part that is not used.

## Copy
- What this shows: the load on four parts of a report system as traffic grows.
- Try this: 1. Set the multiplier to 2, then 3, and find which part passes 100 percent. 2. Set it to 50. 3. Set it to 1 and turn the queue off.
- Under the canvas in the chapter: two or three sentences, with no totals.
- What changed: `describeChange` says how traffic moved, how many parts are at their limit and which part is the first wall.
- Limits of the model: as in `limits`.

## Edge cases
Minimum (10 requests, 1 time, no queue) and maximum (100 requests, 50 times, queue) keep every number finite. A part that is not used shows "not used" and zero load.

## Accessibility
Shared slider keyboard support and labels; each bar has a text value; the summary sentence states the first wall.

## Acceptance criteria
- [x] The claim is testable: a quiz item in 5.6 asks which part to check first.
- [x] The model is tested in `frontend/tests/unit/canvas/fifty-times-test.test.ts` (defaults, try-this values, edges, describeChange).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists in the chapter prose.

## Build plan
`packages/learning-ui/src/canvas/fifty-times-test/data.ts`, with the model functions exported from the same file. The orchestrator registers the slug and the export line.
