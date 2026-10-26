# net-lab-build-two-subnets

**Claim:** two subnets can only talk through a device with an address in each, and each end machine must send everything outside its own subnet to that device. Building the network by hand shows which of those pieces is missing when a goal fails.

**Inputs:** a laptop, a server, a router and up to two switches placed on the canvas, cables drawn between them, and the addresses, gateways and routes typed in each device's settings.

**Rule:** the canvas becomes a topology (`packages/learning-ui/src/labs/net/build-model.ts`), then the network lab engine runs it (ARP, longest prefix match, TTL, ICMP) and the goals are scored in `build-goals.ts`.

**Assumptions:** IPv4, Linux behaviour recorded in the networking dossier (5.5 to 5.8). Addresses must be private or from the documentation blocks.

**Limits:** see the lab's limits line.

**Try this**

1. Place the laptop and the server, give them 192.168.1.23/24 and 203.0.113.80/24, cable them together and press Run. Expected: the ping goals fail and the reasons say the laptop has no route.
2. Add the router, cable each side to it, give its two interfaces an address in each subnet and set the laptop's default gateway. Expected: the laptop ping gets through but the server's answer is lost, because the server has no route back.
3. Set the server's default gateway to the router's address on its side. Expected: all five goals pass and traceroute from the laptop lists the router, then the server.
