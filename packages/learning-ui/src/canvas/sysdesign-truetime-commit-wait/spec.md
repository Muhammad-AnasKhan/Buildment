# Canvas spec: sysdesign-truetime-commit-wait

- **Course and chapter:** system-design, 10.6 TrueTime: time as an interval.
- **Renderer:** custom component on the shared simulation core (`sim/clocks.ts`) and the `timeline` kit renderer.
- **Claim:** A timestamp from a clock with uncertainty epsilon is really a range. When two commits on different servers are closer together than their clocks' disagreement, their timestamps can contradict the real order. Commit wait (do not report "done" until the earliest possible time is past the commit timestamp, about 2 times epsilon) makes any later transaction get a larger timestamp, at the cost of that wait on every commit.

## Inputs

| Input | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Clock uncertainty, epsilon | 0 | 10 | 1 | 4 | ms |
| Gap before Alice posts (true time between "done" and T2) | 1 | 20 | 1 | 2 | ms |
| Clock errors | A fast and B slow, both exact, A slow and B fast | | | A fast and B slow | |
| Commit wait | off, on | | | off | |

## Rule

- T1 starts at true time 20 ms on server A (late enough that no range starts before 0 ms). Clock errors are `errorA = s * 0.9 * eps` and `errorB = -s * 0.9 * eps`, where `s` is 1, 0 or -1 for the three error cases.
- A's TrueTime range is `[20 + errorA - eps, 20 + errorA + eps]`; `s1` is its latest edge.
- Commit wait off: "done" at 20 ms. On: "done" just after `20 + 2 * eps`, when A's earliest possible time passes `s1` (drawn at the boundary).
- T2 starts on server B at `done + gap`; `s2` is the latest edge of B's range at that moment.
- The order is correct when `s2 > s1`. The ranges overlap when neither ends before the other begins.
- Derived: without commit wait the order is correct when `gap > errorA - errorB`; with commit wait, `s2 - s1 = 2 * eps + gap + errorB - errorA >= gap > 0`, so it is always correct.

## Default state

Epsilon 4 ms, gap 2 ms, A fast and B slow, no commit wait. `s1 = 27.6`, `s2 = 22.4`: the photo gets an earlier timestamp than the unfriend, so the order is broken. A good first surprise.

## Try this

1. Commit wait off: raise the gap until the order is correct. It flips above 7.2 ms (1.8 times epsilon).
2. Commit wait on, gap 1 ms: correct in every clock case; T1 waits 8 ms.
3. Commit wait on: move epsilon from 10 down to 1. The wait falls from 20 ms to 2 ms.

## Teaching contract

- Predict before: the chapter's predict ("Epsilon is 4 ms. Server A's clock is 3.6 ms fast and server B's is 3.6 ms slow. Alice posts the photo 2 ms after she sees done. Which commit gets the larger timestamp?").
- What changed: live sentence from `describeTrueTimeChange`.
- Transfer: the chapter's quick check and the module 10 quiz (10.10); gate 10.11 asks how to order two writes 1 ms apart and what it costs.

## Limits shown to the learner

See `limits` in `data.ts`.

## Sources

Corbett et al., "Spanner: Google's Globally-Distributed Database", OSDI 2012: the TrueTime API, commit wait, epsilon as a sawtooth of about 1 to 7 ms (4 ms most of the time), and expected commit wait of at least 2 times the average epsilon. The Alice and Bob unfriend-then-post story is a course example; a full-text search of the OSDI 2012 paper did not find it, so it is not attributed to the paper. See `agent-ip/work/system-design/01-research-dossier.md`.
