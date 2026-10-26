# Canvas spec: net-m9-ipv6-vs-nat

Networking, 9.3, beat 2. Renderer: the generic `[netstep]` beat canvas (`net-step/NetStepCanvas.tsx`, model `models/net-step.ts`). Planned as a network lab view; it uses `netstep` until the lab has a beat mode.

## Claim

The same home network looks different to a server with and without NAT. With IPv4 and NAT the router rewrites the source of both requests to its outside address `198.51.100.2`, so the server sees one address for two devices. With IPv6 nothing is rewritten, so the server sees `2001:db8:4a1:20::5c` for the phone and `2001:db8:4a1:20::23` for the laptop.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Seven steps: the IPv4 home, the phone's request and its rewritten source, the laptop's request with the same source, then the IPv6 home, the phone's request and the laptop's request, unchanged. Two tables fill as the steps play, one for each view. There is no pick, because the chapter's prediction comes just before this beat.

## Limits

Made-up devices. Public addresses are in the documentation ranges (`198.51.100.0/24`, `203.0.113.0/24`, `2001:db8::/32`). The cards show the whole IPv4 address but only the end of each IPv6 address. NAT ports and timers are not drawn. The IPv4 result matches the lab, where the server saw the router's outside address. The IPv6 side is the lab's model: forwarding and router announcements were not tested.
