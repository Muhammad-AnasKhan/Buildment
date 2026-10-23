# Canvas spec: sysdesign-replica-lag

- **Course and chapter:** system-design, 8.4 Replication lag and its anomalies (reused in 11.5 Session guarantees).
- **Renderer:** custom component on the shared simulation core (`sim/events.ts`) and the `timeline` kit renderer.
- **Claim:** With asynchronous replicas, a read sent to a replica that has not applied the user's write misses it (read-your-writes broken), and two reads on replicas with different lag can show the write and then hide it (monotonic reads broken). Reading from the leader fixes both by loading the leader. In this one-writer model, routing to a replica that has reached the client's last-write position fixes both and keeps most reads on replicas; in general it fixes read-your-writes, and monotonic reads also need the client to raise its position to that of each replica that served a read.

## Inputs

| Input | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Slow replica lag | 0 | 1500 | 50 | 600 | ms |
| First refresh after posting | 0 | 1000 | 50 | 200 | ms |
| Routing | any replica, leader for own reads, replica at my position | | | any replica | |

## Rule

- The comment (position 1) is applied on the leader at 0 ms, on replica 1 at `lag / 4` (rounded) and on replica 2 at `lag`.
- Three reads at `first`, `first + 150` and `first + 300` ms.
- Any replica: reads alternate replica 1, replica 2, replica 1.
- Leader for own reads: every read goes to the leader.
- Replica at my position: the client carries token 1; the read goes to the replica whose turn it is if it has applied position 1, else the other replica if it has, else the leader.
- A read sees the comment when its node has applied position 1. An apply and a read at the same moment count the apply first.
- Missed own write: reads that do not see it. Went back in time: reads that do not see it after an earlier read did.

## Default state

Lag 600 ms (replica 1 at 150 ms), reads at 200, 350 and 500 ms, any replica: read 1 on replica 1 shows the comment, read 2 on replica 2 misses it (went back in time), read 3 on replica 1 shows it. One missed, one back in time.

## Try this

1. Any replica, lag 0: nothing breaks.
2. Any replica, first refresh 450 ms or later: nothing breaks, because only refresh 2 (150 ms later) goes to replica 2 and it now lands after replica 2 catches up.
3. Leader versus replica at my position: both 0 missed; the leader takes 3 of 3 reads, the token router 0 of 3 in the default.

## Teaching contract

- Predict before: the chapter's predict (refreshes at 200, 350 and 500 ms; replica 1 applies at 150 ms and replica 2 at 600 ms; what does refresh 2 show?).
- What changed: live sentence from `describeLagChange`.
- Transfer: the chapter's quick check, code exercise 8.8 (a read-your-writes router) and challenge 7 (the same bug on a real Postgres replica).

## Sources

Terry et al., "Session Guarantees for Weakly Consistent Replicated Data", 1994; Kleppmann's distributed systems lecture notes (replication lag anomalies). The default 600 ms models an asynchronous PostgreSQL streaming replica under write load (PostgreSQL documents lag as typically under one second); managed stores such as Aurora usually lag far less, under 100 ms. Details and dates in `agent-ip/work/system-design/01-research-dossier.md`.
