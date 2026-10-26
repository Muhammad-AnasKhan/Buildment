# Canvas spec: net-m6-forward-rule

Course and chapter: networking, 6.3 beat 4. Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`, model `models/net-step.ts`), in place of the planned `[netlab]` home router. Data only.

## Claim

One forwarding rule opens one port. A request to the router's outside address and port `203.0.113.1:8080` is sent on to the laptop at `192.168.1.23:80` with only the destination rewritten, while every other port, such as 22, stays refused.

## Touch

**Next** plays the next step; **Start over** removes the rule. Step 2 adds the rule as a table row. Steps 3 and 4 show the friend's packet before and after the router (the destination changed, the source did not). At step 5 the learner first taps what happens to a request for port 22 (it is refused at once); the refusal then travels back and the feedback says why.

## Limits

One friend, one router and one laptop with made-up addresses from the documentation ranges and private ranges. The rule table is a model view of one rule; the real rule text, `iifname "veth-rout" tcp dport 8080 dnat to 192.168.1.23:80`, is built in 6.8 and appears in the recorded ruleset. The router has no filter. The refusal is what the lab router gave when nothing listened on the port (dossier 5.6, curl exit 7).
