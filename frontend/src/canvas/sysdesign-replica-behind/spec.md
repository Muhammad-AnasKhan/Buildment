# Canvas spec: sysdesign-replica-behind

- **Course and chapter:** system-design, 8.4 beat 2 ("Replicas run behind the leader").
- **Renderer:** custom beat canvas on `BeatFrame` and `useBeatClock`.
- **Claim:** An asynchronous replica applies the leader's log in the same order, but later: by its lag. Lag in time is also lag in writes.
- **Motion:** the leader adds one box per write (every 100 ms of model time); replica 1 and replica 2 fill the same boxes after their lags. Dashed boxes are writes the leader has and the replica does not yet. Loops while on screen; reduced motion shows the moment the leader is full.
- **Input:** replica 2's lag, 0 to 1,500 ms in 50 ms steps, default 600. Drag sideways anywhere on the picture (the motion freezes while pressed); arrow keys when focused. Replica 1's lag is a quarter of it.
- **Verdict in the picture:** "Replica 2 is N writes behind" (or "Replicas keep up with the leader" at 0).
- **Rule:** `replicaBehindFrame(seconds, lag)` in `model.ts`, tested.
