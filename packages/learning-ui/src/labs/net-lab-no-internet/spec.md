# net-lab-no-internet

**Claim:** "connected, but no internet" is found by walking up the layers: cable, address, gateway, route out, name, page. The first layer that fails is the one to fix, and three layers are broken here: the DHCP service is stopped, the lease names a DNS server nobody runs, and the router has no default route.

**Inputs:** commands typed on the laptop and the home router.

**Rule:** the network lab engine in `packages/learning-ui/src/labs/net/engine.ts` and the command generator in `commands.ts` (udhcpc, dig and the resolver file in `services.ts` and `resolve.ts`).

**Assumptions:** IPv4, Linux behaviour recorded in the networking lab runs (dhcp-dns and capstone sessions).

**Limits:** see the lab's limits line.

**Try this**

1. On the laptop, run udhcpc -i eth0. Expected: three discovers and no lease. On the router, systemctl status dnsmasq shows it stopped.
2. Start dnsmasq and ask again, then ping 203.0.113.80. Expected: a lease, then Destination Net Unreachable from 192.168.1.1 until the router gets a default route.
3. Run dig web.test, then dig @192.168.1.1 web.test. Expected: a timeout against 192.168.1.53, then an answer from the router; cat /etc/resolv.conf shows the wrong server.
