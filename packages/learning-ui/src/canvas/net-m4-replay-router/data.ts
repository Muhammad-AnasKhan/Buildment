import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 4.7 phone readers: challenge 2 part 1 played from a real recording (session
// router in recordings/replay-sessions.txt, the second recording): router.sh
// with the three gaps filled builds the laptop, the router and the server, runs
// the mid-point pings, prints the routes and pings across the router; test.sh
// then checks everything, including the MAC change and the TTL. At the first
// step the output is hidden until the learner picks the TTL that the reply
// shows after crossing one router. At the second step it is hidden until the
// learner picks what the router answers for an address it has no route for.
// The renderer is ReplayCanvas in net-m1-replay-setup-checker; the model is
// models/net-replay.ts.
const TITLE = "The router build, replayed";
const PURPOSE = "Follow a recorded run of challenge 2 part 1: three computers, one router, the routes, a ping across the router, and the test.";
const LIMITS =
  "A recording of one real run of the reference solution in the course lab. The script is the challenge's own with its three gaps filled. Long outputs are shortened and a line with three dots marks what was left out. The capture of the MAC change is checked by the test but its lines are not printed, so this replay shows the test's PASS lines for it. No NAT is involved.";

const DIR = "challenges/challenge-2-router/part-1-two-subnets-and-a-router";

export const netM4ReplayRouterData: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: `bash ${DIR}/router.sh`,
      output: outputOf([
        "PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.",
        "64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=1.04 ms",
        "...",
        "net.ipv4.ip_forward = 1",
        "default via 192.168.1.1 dev veth-laptop",
        "192.168.1.0/24 dev veth-laptop proto kernel scope link src 192.168.1.23",
        "192.168.1.0/24 dev veth-rin proto kernel scope link src 192.168.1.1",
        "203.0.113.0/24 dev veth-rout proto kernel scope link src 203.0.113.1",
        "192.168.1.0/24 via 203.0.113.1 dev veth-server",
        "203.0.113.0/24 dev veth-server proto kernel scope link src 203.0.113.80",
        "PING 203.0.113.80 (203.0.113.80) 56(84) bytes of data.",
        "64 bytes from 203.0.113.80: icmp_seq=1 ttl=63 time=3.13 ms",
        "64 bytes from 203.0.113.80: icmp_seq=2 ttl=63 time=0.061 ms",
        "...",
        "2 packets transmitted, 2 received, 0% packet loss, time 1001ms",
        "...",
        "Done. Next: bash test.sh",
      ]),
      note: "The ping to the router shows ttl=64. The ping across the router shows ttl=63: the router lowered the TTL by one on the way back.",
      predict: {
        question: "The laptop pings the server across the router. What TTL does the reply show at the laptop?",
        options: ["ttl=64", "ttl=63", "ttl=62"],
        correct: 1,
      },
    },
    {
      runsOn: "lab",
      command: `bash ${DIR}/test.sh`,
      output: outputOf([
        "PASS namespaces laptop, router and server exist",
        "PASS all four plugs have their addresses",
        "PASS mid-point: laptop reaches its own router, 192.168.1.1",
        "PASS mid-point: server reaches its own router, 203.0.113.1",
        "PASS GAP 1: the laptop has a default route via 192.168.1.1",
        "PASS GAP 2: forwarding is on in the router",
        "PASS GAP 3: the server has a route to 192.168.1.0/24 via 203.0.113.1",
        "PASS laptop pings the server, 203.0.113.80, with 0% loss",
        "PASS server pings the laptop, 192.168.1.23, with 0% loss",
        "PASS traceroute shows two hops: 192.168.1.1, then 203.0.113.80",
        "PASS 198.51.100.7: the router, 192.168.1.1, answers Destination Net Unreachable, as it should",
        "PASS inside link: the echo goes from the laptop's MAC to the router's inside MAC, ttl 64",
        "PASS outside link: the same echo goes from the router's outside MAC to the server's MAC, ttl 63",
        "PASS the IP addresses are the same on both sides: 192.168.1.23 > 203.0.113.80",
        "RESULT: all checks passed",
      ]),
      note: "The router answers for an address it has no route for. The MACs changed at the router, and the IP addresses did not.",
      predict: {
        question: "The laptop pings 198.51.100.7, an address the router has no route for. What comes back?",
        options: ["Silent loss, no answer at all", "Time to live exceeded (TTL)", "Destination Net Unreachable"],
        correct: 2,
      },
    },
  ],
};

function RouterBuildBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM4ReplayRouterData });
}

export const netM4ReplayRouter: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: RouterBuildBeat,
};
