# Canvas spec: net-m8-replay-capstone-4

Course and chapter: networking, 8.5 (phone-only section). Renderer: the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`.

## Claim

A fault is found by working down the layers: the first failing check names the layer, one fix removes one cause, and the earlier tests pass again. The demonstration fault is a missing default route on the home router, whose symptom is Network is unreachable.

## Touch

**Next** and **Start over**. Two steps. At the first step (bash test.sh) the output is hidden and the learner first picks what is missing on hrouter (a masquerade rule, a default route, or a name server). Then the recorded FAIL lines show. The second step shows the fix and the passing re-run.

## Limits

Built only from the capstone-4 session in the recorded sessions file. It is the demonstration fault F3, which is not valid for a learner's write-up, recorded by the course's check script and not by a learner. The FAIL lines are copied as recorded, indented four spaces, with some left out. The last line is the check script's own summary. The fix command is the one in the part 4 README.
