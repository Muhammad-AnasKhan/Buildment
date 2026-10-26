# Canvas spec: net-m6-inbound-unsolicited

Course and chapter: networking, 6.3 beat 1. Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`, model `models/net-step.ts`), in place of the planned `[netlab]` home router. Data only.

## Claim

A packet that arrives from outside, before any device at home has sent anything, has no NAT row to be translated with. With no row and no forwarding rule the router has nobody to give it to, and in the course lab it answers connection refused at once.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 2 the learner first taps where the router can send the friend's packet while the table is empty (nowhere: no row names a device); the packet from `198.51.100.77:50000` to `203.0.113.1:8080` then appears on the link, and the feedback says why. The last step sends the refusal back.

## Limits

One friend, one router and one laptop with made-up addresses from the documentation ranges. The router has no forwarding rule and no filter. Connection refused is what the lab router gave when nothing listened on the port (dossier 5.6, curl exit 7); a router that drops such packets silently would leave the friend waiting for a timeout. The laptop's own side, and the second reason (the internet has no route to private ranges), come in the next beats.
