# Canvas spec: net-m6-filter-rule

Course and chapter: networking, 6.3 beat 5. Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`, model `models/net-step.ts`), in place of the planned `[netlab]` home router. Data only.

## Claim

NAT rewrites addresses and filters nothing. Keeping a device out takes a separate rule in the forward chain: one rule, from the guest network to the home network, drop, makes the guest's request to the laptop time out.

## Touch

**Next** plays the next step; **Start over** removes the rule. At step 2 the learner first taps what the router does with the guest's packet while it has NAT but no filter (it forwards the packet); the step then shows the packet on the link and the feedback says why. Step 4 adds the filter as a table row; step 5 sends the same packet again and it is dropped.

## Limits

A guest, a router and a laptop with made-up private addresses. The blocked case is the lab's tested guest rule (`ip saddr 192.168.50.0/24 ip daddr 192.168.1.0/24 drop`, guest to home blocked, guest to the server still works, the request timing out with curl exit 28). The step before the rule follows from forwarding being on and the forward chain accepting by default, as in the lab until the learner adds the rule. This says nothing about any particular home router, which may ship with filters of its own. The table is a model view of one rule.
