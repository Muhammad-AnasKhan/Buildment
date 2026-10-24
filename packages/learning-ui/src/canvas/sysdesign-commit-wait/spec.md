# Canvas spec: sysdesign-commit-wait

- **Course and chapter:** system-design, 10.6 beat 5 ("The fix: wait out the doubt").
- **Renderer:** custom wrapper around the `scene` renderer; the scene is `buildTrueTimeScene(epsilon, commitWait)`.
- **Claim:** Commit wait (do not say done until the earliest possible time is past the commit timestamp) makes any later transaction get a larger timestamp. The wait is about 2 times epsilon, so better clocks make every write faster.
- **Inputs:** commit wait on or off (default on); epsilon 1 to 10 ms, default 4, by dragging the epsilon pill or with arrow keys. Changing either restarts the story.
- **Story with wait on (default):** A stamps s1 = 27.6, a ring fills while A waits 8 ms, then done; B stamps s2 = 30.4; Bob's box turns green, "Order is safe: s1 < s2". With wait off it replays the bug from beat 4.
- **Rule:** `simulateTrueTime` in `models/truetime.ts` (tested: with commit wait the order is correct for every clock case, epsilon and gap, and the wait is 2 times epsilon).
- **Sources:** Corbett et al., Spanner, OSDI 2012 (commit wait; expected wait at least 2 times the average epsilon; about 5 ms measured).
