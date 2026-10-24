# Canvas spec: sysdesign-m12-raft-log-play

- **Course and chapter:** system-design, 12.6 ("Raft part 2: log replication and commit"), beat 5 "Send, cut, heal: watch logs repair". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`. `SvgNode` cards for S1 to S5, each with a row of eight log slots (letter and term in each box), a green commit bar per server, a vertical network line with travelling dots (red and broken where it is cut), `SvgAction` buttons inside the picture, `VerdictBanner`. The model is `models/raft-cluster.ts`, shared with `sysdesign-m12-raft-election-play`; the clock hook is `primitives/use-raft-run.ts`.
- **Claim:** An entry is committed only when a majority holds it. A leader cut off with a minority stores entries it can never commit, and the new leader overwrites them after the cut heals.
- **Model:** five servers, majority 3, fixed 10 ms message delay, heartbeat every 50 ms, logs start empty and S1 leads term 1. Entries are a, b, c and so on. The leader appends, sends every entry a follower is missing, and commits an entry of its own term when 3 servers hold it; followers learn the commit point on the next message. A follower refuses an entry when the one before does not match; the leader steps back one slot and tries again; the follower drops conflicting entries and copies. A new leader adds an empty entry (a dot) and starts its sends one slot after it, so the first send to a server that disagrees is refused once.
- **Checked results** (unit tests in `tests/unit/canvas/sysdesign-m12-raft-model.test.ts`):
  - Send a, b, c: all five logs hold 3 entries of term 1 and commit at 3.
  - Cut S1 and S2 off, send d to S1: d (term 1, slot 4) on S1 and S2 only, dashed; commit stays 3.
  - After one timeout: S3 leads term 2 and the empty entry sits at slot 4 (term 2) on S3, S4, S5. S1 still shows leader of term 1.
  - Send e to S3: slot 5 (term 2) on those three, commit 5 on them; S1 and S2 stay at 3.
  - Heal: S1 and S2 drop d, copy the empty entry and e; all five logs equal, commit 5 everywhere; S1 steps down.
  - Kill a follower twice and send f: it commits with 3 of 5 up. A third kill leaves f dashed.
- **Inputs:** buttons (44px hit area): Send an entry (to the leader; when two servers claim to lead, a chooser "Send to S1 (term 1)" or "Send to S3 (term 2)" replaces the row), Cut S1 and S2 off, Heal, Kill a follower (the highest-numbered live follower), Reset. Outside the picture: speed 1x or 0.5x.
- **Verdicts (38 characters or fewer):** "Majority holds it: committed", "2 of 5: stored, not committed", "d was never committed: erased" (the entry letter is filled in), "All five logs match again", "Two leaders, only one can commit", "2 of 5: no majority".
- **Reduced motion:** no travelling dots; each action jumps to the settled picture and the last six steps are listed under it.
- **Accessibility:** buttons are real `role="button"` with Enter and Space; each log is read in a polite live region ("S1: a(term 1) b(term 1) d(term 1, not committed)"). Committed and stored-only boxes differ by outline style (solid or dashed) and fill, and the legend names them.
- **Spec change:** the spec asked for the word "committed" on each commit marker; the picture puts it once in the legend line ("Solid box: committed. Dashed: stored only. Bar: commit point.") because five repeated labels do not fit beside the logs on a phone. The text list carries "not committed" per entry.
- **Sources:** commit rule, Leader Completeness, log repair [S68]. Challenge 11 part 3 supports the numbers: 5 of 5 writes lost on the small side, 0 committed, logs equal after healing in 100 of 100 runs.
