# net-lab-fix-office

**Claim:** three independent faults stop an office reaching its server: a gateway nobody owns, a mask too small to hold the gateway, and a router with no route back. Each shows a different symptom in the same commands.

**Inputs:** commands typed on PC 1, PC 2, router 1, router 2 and the server.

**Rule:** the network lab engine in `frontend/src/lab/net/engine.ts` (ARP, longest prefix match, TTL, ICMP) and the command generator in `frontend/src/lab/net/commands.ts`.

**Assumptions:** IPv4, Linux behaviour recorded in the networking dossier (5.5 to 5.8).

**Limits:** see the lab's limits line.

**Try this**

1. On PC 1, run ping -c 2 10.2.0.10, then ip neigh. Expected: no replies and the gateway 10.1.0.254 is FAILED.
2. On PC 2, run ip route. Expected: no default route; a /29 does not contain 10.1.0.1.
3. Fix both PCs, then ping again. Expected: the ping leaves but no reply comes back until router 2 gets a route to 10.1.0.0/24.
