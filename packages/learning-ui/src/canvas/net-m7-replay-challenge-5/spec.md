# Canvas spec: net-m7-replay-challenge-5

Course and chapter: networking, 7.6 (phone readers). Renderer: the existing replay card, `ReplayCanvas` in `net-m1-replay-setup-checker/`, with the model `models/net-replay.ts`. Data only. No new component.

## Claim

One small program, dnsmasq in the router's namespace, hands out leases and answers for names: the laptop and the phone get an address, a gateway and a resolver from the lease, `dig` and `curl` get `203.0.113.80` for `web.test`, and the test passes, including the two checks that must fail on purpose (no lease with dnsmasq stopped, no answer for an unknown name).

## Touch

**Next** shows the next step; **Start over** goes back to the first. Step 1 is `dhcp-dns.sh` from the reference solution of challenge 5 part 1, with its output cut to the lease lines, the laptop's address, route and resolver file, both `dig` answers, the `curl` result and the lease on camera. Its output stays hidden until the learner picks which address the server says it sees (203.0.113.1, the router's outside address, as in module 6). Step 2 is `test.sh`, whole.

## Limits

A recording of one real run in the course lab, from the session `dhcp-dns` of the recordings. Long outputs are shortened and a line with three dots marks what was left out. The pool addresses, the transaction number and the hardware address change from run to run. The run uses the reference solution, so the learner's own gaps in `dnsmasq.conf` are already filled. A replay teaches reading the output; only the build teaches filling the gaps.
