# Canvas spec: net-m3-split-broadcast

Course and chapter: networking, 3.4 beat 3 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas`, model `models/net-step.ts`). Spec of the renderer: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

A router joins networks but does not pass a local broadcast from one to another. With the same 600 devices on three networks, the same ARP request is heard by 99 devices instead of 599, which is 500 fewer.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 4 the learner picks whether the router sends the request on (yes to both networks, no because a broadcast stays local, or only to the exam server). The step plays after the pick and the feedback says why. The counts fill the same small table as the flat network, so the two can be compared.

## Limits

A fictional school with made-up counts and made-up MACs (`02:...`); private addresses. Each network is one card. How the router moves traffic between networks is module 4. The picture counts who hears one request: it does not show speed, and it does not claim every fault stops at the router.
