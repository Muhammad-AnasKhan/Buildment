# net-lab-home-router

**Claim:** a home router needs three things to serve its network: forwarding on, a masquerade rule on the outside interface plus a port forward that points at a real inside host, and a drop rule in the forward chain to keep the guest network apart. Each fault breaks a different check once the other two are fixed.

**Inputs:** commands typed on the router, the laptop, the guest phone and the outside server.

**Rule:** the network lab engine in `packages/learning-ui/src/labs/net/engine.ts` (connection tracking and NAT in `nat.ts`, rules in `nft.ts`) and the command generator in `commands.ts`.

**Assumptions:** IPv4, Linux behaviour recorded in the networking lab runs (masquerade, forward-guest and capstone sessions).

**Limits:** see the lab's limits line.

**Try this**

1. On the router, run sysctl net.ipv4.ip_forward and nft -a list ruleset. Expected: forwarding is 0, the port forward targets 192.168.1.21 (handle 4), and the filter table's forward chain is empty.
2. Turn forwarding on, then on the laptop run curl http://203.0.113.80:8080/. Expected: the page says the server sees you as 203.0.113.1.
3. On the outside server, run curl http://203.0.113.1:8080/ before and after fixing the port-forward target. Expected: a timeout, then the home web server's page; port 22 is refused at once.
