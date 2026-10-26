# Canvas spec: net-m6-nat-rewrite

Course and chapter: networking, 6.2 beat 1. Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`, model `models/net-step.ts`), in place of the planned `[netlab]` home router. Data only.

## Claim

A Linux router doing NAT rewrites the source address of a packet that leaves toward the internet. In the lab test the source port was kept and the destination did not change; the TTL went down by one, as at any router.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Step 1 shows the packet on the inside link (source `192.168.1.23`, port `41000`, TTL 64). At step 2 the learner first taps which source address the packet carries after the router; the step then shows the outside link (source `203.0.113.1`, port `41000`, TTL 63, the changed fields marked "changed"). Comparing the two chip rows is the inspection.

## Limits

One laptop, one router and one server with made-up addresses; `203.0.113.1` comes from a documentation range. It shows Linux masquerade as tested in the course lab (address rewritten, port kept when nothing clashes, dossier 5.6). Other routers may differ. The port is kept here because no other conversation uses it; the clash is the next canvases.
