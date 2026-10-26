# Canvas spec: net-m3-flat-broadcast

Course and chapter: networking, 3.4 beat 2 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas`, model `models/net-step.ts`). Spec of the renderer: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

A broadcast reaches every other device on the network. In a flat network of 600 devices, one staff laptop's ARP request is heard by 99 staff laptops, 1 exam server and 499 guest phones: 599 devices. Only the owner of the address answers.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 2 the learner picks who hears the request (all the other devices, only the other staff, or only the owner). The step plays after the pick and the feedback says why. The next steps fill a small table, one group at a time, until the total reads 599.

## Limits

A fictional school with made-up counts and made-up MACs (`02:...`); private addresses. The groups are single cards and one switch stands for many. The sender is not counted. Hearing a request is not answering it. Nothing is measured and no speed or load is shown.
