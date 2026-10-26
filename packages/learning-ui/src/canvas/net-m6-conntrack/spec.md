# Canvas spec: net-m6-conntrack

Course and chapter: networking, 6.2 beat 5. Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`, model `models/net-step.ts`), in place of the planned `[netlab]` home router. Data only.

## Claim

A `conntrack -L` line is one conversation in two halves: what the device sent, and the reply as it arrives at the router. When the router changed a port, the new port is the last number of the second half (`dport=`), not the first half's `sport=`.

## Touch

**Next** plays the next step; **Start over** empties the two tables. The laptop's line shows `sport 41000` and a second half ending in `dport 41000` (kept). At step 3 the learner first taps which number in the phone's line is the port the server saw (the second half's `dport`); the phone's row then appears with `sport 41000` and `dport 15510`, and the feedback says why.

## Limits

The numbers come from the recorded masquerade run in the course lab (session `masquerade` in `recordings/replay-sessions.txt`): the laptop's reply half ends in `dport=41000`, the phone's in `dport=15510`. The kernel chose `15510` on that run and the port differs on every run; the picture says so. The two small tables keep only the fields that show the change, so they are a model view of the command and not its output; the real lines also hold the protocol, the state, the seconds left and the server's address and port. The devices and addresses are made up.
