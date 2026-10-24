# Canvas spec: sysdesign-m12-raft-election-play

- **Course and chapter:** system-design, 12.5 ("Raft part 1: terms and elections"), beat 6 "Kill, split and cut: drive the cluster". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`. `SvgNode` cards for S1 to S5 (laid out like the 12.5 scenes), `LinkLine` for the ten links (a cut link is red and broken), travelling dots for messages, `SvgAction` buttons inside the picture, `VerdictBanner`. The model is `models/raft-cluster.ts`, shared with `sysdesign-m12-raft-log-play`; the clock hook is `primitives/use-raft-run.ts`.
- **Claim:** A crashed leader is replaced after about one election timeout. A tie costs one more timeout. A cut-off follower raises its term alone, and its return forces one election.
- **Model:** five servers, majority 3, fixed 10 ms message delay, heartbeat every 50 ms. Start: S1 leads term 1, every log holds 3 committed entries. A follower that hears nothing for its timer becomes a candidate (term + 1, votes for itself, asks the others). One vote per term, first come first served; a server refuses a candidate whose log is behind. A candidate with 3 votes leads. Timers come from fixed lists (a vote or a heartbeat resets the timer to the same length; starting an election moves to the next value). Kill and cut presses happen right after a heartbeat: they start every timer from that instant.
  - Default list: S2 240, S3 190, S4 270, S5 210. Tie list: S2 220, S3 220, S4 260, S5 280, then retries S2 160, S3 290. S4 answers S2 first and S5 answers S3 first. Cut list for S4: 270, 200, 250, 180.
- **Checked results** (unit tests in `tests/unit/canvas/sysdesign-m12-raft-model.test.ts`):
  - Kill the leader: S3 fires at 190 ms (term 2), leads at 210 ms with 4 of 5 votes; no leader for 210 ms.
  - Force a tie: S2 and S3 fire at 220 ms, 2 votes each; S2 fires again at 380 ms (term 3) and leads at 400 ms; no leader for 400 ms.
  - Cut off S4: its term is 2, 3, 4, 5 at 270, 470, 720 and 900 ms; the other four stay in term 1 with S1 leading. The leader takes one write meanwhile, so S4's log is one entry behind.
  - Reconnect S4: S1 steps down and adopts term 5 after 10 ms, every server refuses S4 (log behind), S3 leads term 6 after 210 ms with no leader.
  - Kill the leader and two followers: 2 servers up, no leader, terms keep rising.
- **Inputs:** buttons (44px hit area): Kill the leader, Force a tie, Cut off S4, Reconnect S4, Kill another server (the highest-numbered live follower), Reset. Outside the picture: speed 1x or 0.5x (1x is 12 real ms per model ms).
- **What moves:** dots for vote requests (blue), granted votes (green), refusals (red), heartbeats (small grey); a ring on each follower drains as its election timer runs; vote dots under a candidate fill as votes arrive; the strip under the cards counts "no leader for N ms".
- **Verdicts (38 characters or fewer):** "S3 won term 2 with 4 of 5 votes", "Tie: S2 won term 3 after a retry", "Tie: nobody has 3 votes, retry", "S4 alone: term 5, no majority", "S4's old term forced a new election", "No majority: no leader is possible".
- **Reduced motion:** no travelling dots; each action jumps to the settled picture and the last six steps are listed under it ("S3 asks for votes, term 2").
- **Accessibility:** every button has a text label and is a real `role="button"` with Enter and Space; a disabled button is `aria-disabled`. Each server card has an `aria-label` ("S3 leader term 2"); the state and the verdict are also in a polite live region.
- **Sources:** terms, 150 to 300 ms timers, split votes [S68]. The scripted timers are course numbers. Challenge 11 part 1 (median failover 218 ms) supports the 210 ms order of magnitude.
