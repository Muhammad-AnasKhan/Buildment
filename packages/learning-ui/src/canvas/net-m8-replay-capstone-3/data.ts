import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 8.4 phone readers: capstone part 3 played from a real recording (session
// capstone-3 in recordings/replay-sessions.txt): the reference
// dhcp-and-dns.sh starts one dnsmasq for both subnets and asks for leases from
// home1 and guest1; test.sh checks the leases, the names and the two checks
// that must fail. At the test step the output is hidden until the learner
// picks what a guest gets when it asks the router for a name while the drop
// rule is on. The renderer is ReplayCanvas in net-m1-replay-setup-checker; the
// model is models/net-replay.ts.
const TITLE = "Capstone part 3, replayed";
const PURPOSE = "Follow a recorded run of capstone part 3: two leases from one dnsmasq, names that work from both subnets, and the tests that must fail.";
const LIMITS =
  "A recording of one real run of the reference solution in the course lab, not your script. Long outputs are shortened and a line with three dots marks what was left out. The leased addresses are picked by dnsmasq inside each pool, so yours will differ.";

const BASE = "challenges/challenge-6-capstone/part-3-dhcp-and-dns";

export const netM8ReplayCapstone3Data: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: `bash ${BASE}/dhcp-and-dns.sh`,
      output: outputOf([
        "--- home1 asks for a lease",
        "udhcpc: started, v1.36.1",
        "udhcpc: broadcasting discover",
        "udhcpc: broadcasting discover",
        "udhcpc: broadcasting select for 192.168.1.126, server 192.168.1.1",
        "udhcpc: lease of 192.168.1.126 obtained from 192.168.1.1, lease time 3600",
        "lease applied: 192.168.1.126/24 router=192.168.1.1 dns=192.168.1.1 lease=3600s",
        "...",
        "lease applied: 192.168.50.111/24 router=192.168.50.1 dns=192.168.50.1 lease=3600s",
        "...",
        "--- names: dig asks the router, curl uses the resolver file from the lease",
        "203.0.113.80",
        "203.0.113.80",
        "the server sees you as 198.51.100.2:55230",
        "the server sees you as 198.51.100.2:41758",
        "Done. Next: bash test.sh",
      ]),
      note: "One dnsmasq gave each subnet its own pool, gateway and DNS address. The guest lease points at 192.168.50.1. Both names resolve, and the server sees one address.",
    },
    {
      runsOn: "lab",
      command: `bash ${BASE}/test.sh`,
      output: outputOf([
        "PASS dnsmasq is running (started with bg_start dnsmasq)",
        "PASS home1 has 192.168.1.126/24 and home2 has 192.168.1.103/24, both in 192.168.1.100 to 192.168.1.150",
        "PASS guest1 has 192.168.50.111/24, in 192.168.50.100 to 192.168.50.150",
        "...",
        "PASS guest1: dig @192.168.50.1 web.test returns 203.0.113.80 (the guest can ask the router for names)",
        "...",
        "PASS dig @192.168.1.1 nosuch.test returns no answer",
        "PASS a brand-new device gets a lease (192.168.1.145/24), so the home pool still has room",
        "PASS with dnsmasq stopped, a new device gets no lease and ends with no address after about 3 seconds",
        "PASS dnsmasq is running again with your dnsmasq.conf",
        "RESULT: all checks passed",
      ]),
      note: "The drop rule matches packets to the home subnet. A question to the router itself is not addressed to that subnet, so the guest still gets its answer.",
      predict: {
        question: "The drop rule blocks guest to home. A guest asks the router at 192.168.50.1 for web.test. What does dig get?",
        options: ["Silence, timeout", "A REFUSED status", "The address back"],
        correct: 2,
      },
    },
  ],
};

function CapstoneThreeBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM8ReplayCapstone3Data });
}

export const netM8ReplayCapstone3: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: CapstoneThreeBeat,
};
