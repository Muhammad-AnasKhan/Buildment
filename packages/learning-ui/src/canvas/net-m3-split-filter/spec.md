# Canvas spec: net-m3-split-filter

Course and chapter: networking, 3.4 beat 4 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas`, model `models/net-step.ts`). Spec of the renderer: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

A split creates a place to decide who may talk, but the decision is a rule. Without a rule the router forwards a guest packet to the exam server. With one rule at the router, the same packet is dropped.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 2 the learner picks whether the guest packet arrives when there is no rule (no because of the split, yes because the router forwards it, or only if the server agrees). The step plays after the pick and the feedback says why. Then the rule is added to a one-row table and the same packet is sent again.

## Limits

Three made-up devices with private addresses (a guest network, an exam network, a router). One narrow model rule, not a firewall editor, and not a claim about every threat. The router is assumed to have a route between the networks. The rule table is a model view, not a recording.
