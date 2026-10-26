import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 8.2 phone readers: capstone part 1 played from a real recording (session
// capstone-1 in recordings/replay-sessions.txt): the reference
// addresses-and-routes.sh prints the home router's routes and how home1 and
// hrouter reach the server, and test.sh checks every path. At the test step the
// output is hidden until the learner picks what the "no NAT yet" check expects.
// The renderer is ReplayCanvas in net-m1-replay-setup-checker; the model is
// models/net-replay.ts.
const TITLE = "Capstone part 1, replayed";
const PURPOSE = "Follow a recorded run of capstone part 1: the home router's routes, the route each device picks, and the test that proves every path.";
const LIMITS =
  "A recording of one real run of the reference solution in the course lab, not your script. Long outputs are shortened and a line with three dots marks what was left out. The test list is cut to the checks that matter here. Your own script and its output will differ in small ways, such as interface names.";

const BASE = "challenges/challenge-6-capstone/part-1-addresses-and-routes";

export const netM8ReplayCapstone1Data: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: `bash ${BASE}/addresses-and-routes.sh`,
      output: outputOf([
        "--- hrouter routes",
        "default via 198.51.100.1 dev veth-hout",
        "192.168.1.0/24 dev br-home proto kernel scope link src 192.168.1.1",
        "192.168.50.0/24 dev veth-hguest proto kernel scope link src 192.168.50.1",
        "198.51.100.0/30 dev veth-hout proto kernel scope link src 198.51.100.2",
        "--- home1: how to reach the server",
        "203.0.113.80 via 192.168.1.1 dev veth-home1 src 192.168.1.30 uid 0",
        "    cache",
        "--- hrouter: how to reach the server",
        "203.0.113.80 via 198.51.100.1 dev veth-hout src 198.51.100.2 uid 0",
        "    cache",
        "Done. Next: bash test.sh",
      ]),
      note: "The home router has three connected subnets and one default route. home1 sends the server's traffic to 192.168.1.1, and hrouter sends it to 198.51.100.1.",
    },
    {
      runsOn: "lab",
      command: `bash ${BASE}/test.sh`,
      output: outputOf([
        "PASS all seven namespaces exist",
        "PASS hrouter has 192.168.1.1/24, 192.168.50.1/24 and 198.51.100.2/30",
        "...",
        "PASS forwarding is on in hrouter and prouter",
        "...",
        "PASS the public server sees hrouter as 198.51.100.2",
        "...",
        "PASS traceroute from hrouter shows 198.51.100.1, then 203.0.113.80",
        "PASS no NAT yet: home1 gets no reply from 203.0.113.80 (100% loss), as it should",
        "PASS the capture on veth-hout shows the private source 192.168.1.30 leaving the home router",
        "RESULT: all checks passed",
      ]),
      note: "The packet leaves with a private source, 192.168.1.30. The server cannot answer it, so home1 hears only silence. That is why NAT exists.",
      predict: {
        question: "Before NAT exists, home1 pings 203.0.113.80. What does the test expect?",
        options: ["A normal reply", "No reply at all", "A quick refusal"],
        correct: 1,
      },
    },
  ],
};

function CapstoneOneBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM8ReplayCapstone1Data });
}

export const netM8ReplayCapstone1: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: CapstoneOneBeat,
};
