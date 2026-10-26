# Canvas spec: net-m4-route-get

Course and chapter: networking, 4.3 beat 7. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

`ip route get` asks the system which row it would use for a destination, and it answers with the next hop (`via`), the plug (`dev`) and the machine's own address (`src`). Each machine answers for itself: for `203.0.113.80`, home1 names hrouter (`192.168.1.1`) and hrouter names prouter (`198.51.100.1`).

## Touch

**Next** plays the next step; **Start over** goes back to the first. The first answer is shown; at step 3 the learner first taps what hrouter's next hop is (prouter, home1 or the server). The second answer shows after the pick, with the reason. The table collects the `via` and `dev` parts of both answers. The learner cannot type a command in this picture.

## Limits

Both answer lines are copied from the capstone's reference run in the course lab (session `capstone-1`, `recordings/replay-sessions.txt`), where the machines are called home1 and hrouter. Only these two answers are shown. The table is a model view of them, not a recording. The path beyond prouter is drawn as one link. Addresses are the capstone's: private ranges and the documentation ranges.
