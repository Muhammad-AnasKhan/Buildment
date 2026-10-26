import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 7.6 phone readers: challenge 5 part 1 played from a real recording (session
// dhcp-dns in recordings/replay-sessions.txt): dhcp-dns.sh builds the router,
// starts dnsmasq, leases addresses to the laptop and the phone, asks for
// web.test, asks for a name the router does not know, fetches a page by name and
// captures one lease; test.sh then checks it all, including the case where
// dnsmasq is stopped. At the first step the output is hidden until the learner
// picks which address the server says it sees. The renderer is ReplayCanvas in
// net-m1-replay-setup-checker; the model is models/net-replay.ts.
const TITLE = "Leases and names, replayed";
const PURPOSE = "Follow a recorded run of challenge 5: dnsmasq hands out leases, answers for web.test, and the test checks it, even with dnsmasq stopped.";
const LIMITS =
  "A recording of one real run in the course lab, with the reference solution of challenge 5 part 1. Long outputs are shortened and a line with three dots marks what was left out. Addresses in the pool, the transaction number and the hardware address in the capture change from run to run. The test is the course's own, and it stops dnsmasq for a moment and starts it again.";

export const netM7ReplayChallenge5Data: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: "bash challenges/challenge-5-dhcp-dns/part-1-leases-and-names/dhcp-dns.sh",
      output: outputOf([
        "dnsmasq is running.",
        "--- the laptop and the phone ask for addresses",
        "udhcpc: started, v1.36.1",
        "udhcpc: broadcasting discover",
        "udhcpc: broadcasting discover",
        "udhcpc: broadcasting select for 192.168.1.144, server 192.168.1.1",
        "udhcpc: lease of 192.168.1.144 obtained from 192.168.1.1, lease time 3600",
        "lease applied: 192.168.1.144/24 router=192.168.1.1 dns=192.168.1.1 lease=3600s",
        "...",
        "--- laptop",
        "24: veth-laptop    inet 192.168.1.144/24 scope global veth-laptop\\       valid_lft forever preferred_lft forever",
        "default via 192.168.1.1 dev veth-laptop",
        "192.168.1.0/24 dev veth-laptop proto kernel scope link src 192.168.1.144",
        "nameserver 192.168.1.1",
        "...",
        "--- dig asks the router directly: web.test",
        "203.0.113.80",
        "--- dig asks about a name the router does not know",
        ";; ->>HEADER<<- opcode: QUERY, status: REFUSED, id: 13082",
        "--- curl uses the resolver file from the lease",
        "the server sees you as 203.0.113.1:53406",
        "--- one lease on camera",
        "    0.0.0.0.68 > 255.255.255.255.67: BOOTP/DHCP, Request from 3e:44:4a:51:79:fa, length 300, xid 0x88af800e, Flags [none]",
        "\t    DHCP-Message (53), length 1: Discover",
        "    192.168.1.1.67 > 192.168.1.136.68: BOOTP/DHCP, Reply, length 300, xid 0x88af800e, Flags [none]",
        "\t    DHCP-Message (53), length 1: Offer",
        "    0.0.0.0.68 > 255.255.255.255.67: BOOTP/DHCP, Request from 3e:44:4a:51:79:fa, length 300, xid 0x88af800e, Flags [none]",
        "\t    DHCP-Message (53), length 1: Request",
        "    192.168.1.1.67 > 192.168.1.136.68: BOOTP/DHCP, Reply, length 300, xid 0x88af800e, Flags [none]",
        "\t    DHCP-Message (53), length 1: ACK",
        "Done. Next: bash test.sh",
      ]),
      note: "The laptop and the phone got addresses, a gateway and a resolver from the lease. Then names worked: web.test answered, nosuch.test was refused.",
      predict: {
        question: "After the lease, curl fetches a page by name. Which address does the server say it sees?",
        options: ["192.168.1.144", "203.0.113.1", "203.0.113.80"],
        correct: 1,
      },
    },
    {
      runsOn: "lab",
      command: "bash challenges/challenge-5-dhcp-dns/part-1-leases-and-names/test.sh",
      output: outputOf([
        "PASS namespaces laptop, phone, router and server exist",
        "PASS dnsmasq is running in the router",
        "PASS GAP 2: the laptop has 192.168.1.144/24, inside the pool 192.168.1.100 to 192.168.1.150",
        "PASS the phone has 192.168.1.136/24, a different address from the laptop",
        "PASS GAP 3: the laptop has a default route via 192.168.1.1, from the lease",
        "PASS GAP 3: /etc/netns/laptop/resolv.conf says nameserver 192.168.1.1, from the lease",
        "PASS GAP 4: dig @192.168.1.1 web.test returns 203.0.113.80",
        "PASS curl http://web.test:8080/ works from the laptop, and the server sees 203.0.113.1",
        "PASS the server cannot ask the router for names on 203.0.113.1, as it should",
        "PASS dig @192.168.1.1 nosuch.test returns no answer",
        "PASS dhcp-capture.txt holds four DHCP packets",
        "PASS with dnsmasq stopped, the phone gets no lease and ends with no address after about 3 seconds",
        "PASS dnsmasq is back and the phone has a lease again",
        "RESULT: all checks passed",
      ]),
      note: "Every check passes, including the two that must fail: no lease with dnsmasq stopped, and no answer for nosuch.test.",
    },
  ],
};

function Challenge5Beat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM7ReplayChallenge5Data });
}

export const netM7ReplayChallenge5: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: Challenge5Beat,
};
