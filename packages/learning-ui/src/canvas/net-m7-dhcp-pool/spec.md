# Canvas spec: net-m7-dhcp-pool

Course and chapter: networking, 7.2 beat 5 (playable). Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`, which stands in for the planned `[netlab]` DHCP beat (same slug). Model and schema: `models/net-step.ts`. The data is plain and serialisable.

## Claim

A DHCP pool is finite: when every address is leased, a new phone gets no offer, and it gets an address only when a lease ends and an address returns to the pool [S23].

## Touch

**Next** plays the next step; **Start over** goes back to the first. Seven steps: a pool of three addresses, three phones take the three addresses (each ACK carries a lease of 3600 s), a fourth phone sends DISCOVER from 0.0.0.0 to 255.255.255.255 and gets no OFFER (verdict: "No free address: no OFFER"), then Phone 1's lease runs out. At that step the learner first taps what the server can offer Phone 4; the step plays after the pick, and the feedback says why. The last step gives Phone 4 the freed address.

## Limits

Hypothetical: the dossier found no real incident of pool exhaustion (section 7), and the pool of three addresses is made up (the chapter's café pool is 10.5.0.50 to 10.5.0.200). One server, one link, no relay, no renewals and no early release. The planned `[netlab]` beat (shrink the pool and add phones) needs the network lab family, which does not exist yet; this slug lets the learner pick the outcome instead of changing the pool.
