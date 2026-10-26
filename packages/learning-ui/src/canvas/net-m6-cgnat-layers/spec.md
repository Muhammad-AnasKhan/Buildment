# Canvas spec: net-m6-cgnat-layers

Course and chapter: networking, 6.4 beat 2. Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`, model `models/net-step.ts`), in place of the planned `[netlab]` provider NAT. Data only.

## Claim

A packet can be translated twice. The home router rewrites the source to its outside address, which can be a shared address in `100.64.0.0/10` [S11]; the provider's router (carrier-grade NAT) rewrites it again to a public address, so the server sees only the last one.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Each step shows the packet on one link with its source address, and a small table keeps the source at each stage (`192.168.1.23`, then `100.72.14.9`, then `203.0.113.45`). At step 2 the learner first taps which source address the packet carries after the home router (`100.72.14.9`, the router's outside address); the feedback says why.

## Limits

One provider layer and no port limits shown. A real provider may run more layers, and CGN must limit ports per subscriber [S19], which is not drawn. `100.72.14.9` is an example inside the shared block; `203.0.113.45` is a stand-in public address from a documentation range. All devices and addresses are made up. The table is a model view of the packet's source at each stage.
