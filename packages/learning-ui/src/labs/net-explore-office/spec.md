# net-explore-office

**Claim:** every command's output comes from the network's state, and every packet can be stepped through hop by hop: ARP first, then the frame, with the TTL dropping at each router.

**Inputs:** commands typed on the laptop, the phone, both routers and the web server.

**Rule:** the network lab engine in `frontend/src/lab/net/engine.ts` and the command generator in `frontend/src/lab/net/commands.ts`.

**Assumptions:** IPv4, Linux behaviour recorded in the networking dossier (5.5 to 5.8). No NAT yet, so router 2 has a route back to the home block.

**Limits:** see the lab's limits line.

**Try this**

1. On the laptop, ping -c 2 192.168.1.24, then step through it. Expected: an ARP broadcast, one answer, then the ping.
2. traceroute -n 203.0.113.80. Expected: 192.168.1.1, 198.51.100.1, then the server.
3. On the phone, curl http://192.168.1.23:8000/ and :8001/. Expected: the first is refused (loopback only), the second answers.
