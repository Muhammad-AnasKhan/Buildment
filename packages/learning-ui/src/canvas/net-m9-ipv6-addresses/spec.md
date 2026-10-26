# Canvas spec: net-m9-ipv6-addresses

Networking, 9.3, beat 1. Renderer: the generic `[netstep]` beat canvas (`net-step/NetStepCanvas.tsx`, model `models/net-step.ts`). Planned as a network lab view; it uses `netstep` until the lab has a beat mode.

## Claim

On an IPv6 home network every device has its own global address. The router announces one prefix, `2001:db8:4a1:20::/64`. The phone (`::5c`) and the laptop (`::23`) share only that prefix, and the server sits on another network at `2001:db8:ffff::80`.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Each step lights one device and adds one row to the table "Who has which address". There is no pick. Four steps: the prefix, the phone, the laptop, the server (verdict: "Every device has its own address").

## Limits

Made-up devices and made-up addresses, all in the documentation prefix `2001:db8::/32`. The cards show only the end of each address, and the table shows the whole address. How the router announces the prefix, and how a device checks its address, is not drawn. The table is a model view, not a recording, and IPv6 forwarding was not tested in the lab.
