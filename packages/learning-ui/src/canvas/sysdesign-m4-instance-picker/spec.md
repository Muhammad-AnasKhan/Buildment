# Canvas spec: sysdesign-m4-instance-picker

- **Course and chapter:** system-design, 4.2 "Vertical versus horizontal scaling", beat "Pick sizes and counts yourself". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`, `DotGrid`, `VerdictBanner`, `useBeatClock`, with two new reusable primitives: `primitives/svg-button.tsx` (a tap target inside an SVG picture) and `primitives/rail-strip.tsx` (a rail in its own small SVG under the picture, so tapping cards never moves the slider).
- **Claim:** One server going down takes out one server's share. N+1 holds back one server of spare, and that spare is cheapest when servers are small.
- **Model** (`models/fleet-sizing.ts`, unit tested): demand 500 requests a second. Made-up sizes: small 100/s $0.10, medium 200/s $0.20, large 400/s $0.40, xlarge 800/s $0.80 an hour. Capacity = size x count; busy = 500 / capacity; cost = price x count, plus $0.05 for a balancer when there is more than one server; after one failure, capacity = size x (count - 1).
- **Check points (tested):** 8 small 63%, 71% after a failure, $0.85; 5 medium 50%, 63%, $1.05; 3 large 42%, 63%, $1.25; 1 xlarge 63%, down, $0.80; 7 small 83% after a failure; 2 large 125% after a failure.
- **Inputs:** four size chips drawn in the picture (tap, Enter or Space); a count rail from 1 to 8, step 1, marks at 3, 5 and 8, drag or arrow keys, Page keys, Home and End. Default: 3 medium servers, which fit but fall over after one failure, so the first move is to add servers.
- **Picture:** a demand pill feeds one drop per server; dots fall at a rate that follows each server's busy share; each card's pill shows its busy share and turns green up to 80%, amber to 100%, red above. Three tags: capacity, cost an hour, and a dashed "If one fails" tag with the load the survivors would carry.
- **Verdicts (38 characters or fewer, tested for all 32 fleets):** under 500 "Too small: 500/s will not fit"; one server "One server: one failure takes all"; over 100% after a failure "Fits, but one failure overloads it"; 80% to 100% "Survives one failure, near the knee"; 80% or less "Survives one failure: N+1 at 80%".
- **Reduced motion:** the picture is still, with two fixed dots on each drop; every number and verdict is unchanged.
- **Accessibility:** chips are real buttons with `aria-pressed`; the rail is one `role="slider"` with a value text that gives capacity, cost and the verdict; the picture has a full description.
- **Sources:** made-up prices (dossier "What not to teach"); queueing knee from chapter 2.5 [S6, S7].
