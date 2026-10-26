# Canvas spec: net-m8-journey-lease-arp

Course and chapter: networking, 8.1 beat 2 (steps 1 and 2 of the journey). Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`. Spec: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

A device that joins a network with no address gets everything it needs from one DHCP lease: an address, a gateway, a DNS server and a lease time. Its first messages use the source 0.0.0.0 and the destination 255.255.255.255. Then it asks the whole link, with ARP, for the MAC of its gateway.

## Touch

**Next** plays the next step; **Start over** goes back to the first. No pick in this slug. Six steps: no address yet; the DHCP Discover from 0.0.0.0 to 255.255.255.255; the Offer; the ACK, which fills four rows of home1's settings; the ARP request to ff:ff:ff:ff:ff:ff; the unicast ARP reply, which adds one row to the ARP table.

## Limits

Two devices (home1 and hrouter). The offered address 192.168.1.101 is one possible lease from the pool 192.168.1.100 to 192.168.1.150; a real run picks its own. MACs are made up (02:...). The field order and words follow the recorded DHCP capture (Discover, Offer, Request, ACK on ports 67 and 68) and the lease lines of the capstone runs. The Request message is named in the Offer caption and not drawn. The tables are model views. Lease renewal and timers are not drawn.
