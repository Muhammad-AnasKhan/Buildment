import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 8.3 phone readers: capstone part 2 played from a real recording (session
// capstone-2 in recordings/replay-sessions.txt): the reference
// nat-forwarding-isolation.sh adds the masquerade rule, the forwarded port and
// the guest drop rule, then visits the public server from home1 and guest1,
// and the forwarded port from the server; test.sh checks the things that must
// work and the things that must fail. At the test step the output is hidden
// until the learner picks what happens to a visit to 198.51.100.2:22. The
// renderer is ReplayCanvas in net-m1-replay-setup-checker; the model is
// models/net-replay.ts.
const TITLE = "Capstone part 2, replayed";
const PURPOSE = "Follow a recorded run of capstone part 2: the three rules on the home router, what the server sees, and the tests that must fail.";
const LIMITS =
  "A recording of one real run of the reference solution in the course lab, not your script. Long outputs are shortened and a line with three dots marks what was left out. The source ports in the output are random and change on every run, so a test must never check them.";

const BASE = "challenges/challenge-6-capstone/part-2-nat-forwarding-isolation";

export const netM8ReplayCapstone2Data: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: `bash ${BASE}/nat-forwarding-isolation.sh`,
      output: outputOf([
        "--- the router's rules",
        "table ip nat {",
        "\tchain postrouting {",
        "\t\ttype nat hook postrouting priority srcnat; policy accept;",
        '\t\toifname "veth-hout" masquerade',
        "\t}",
        "...",
        '\t\tiifname "veth-hout" tcp dport 8080 dnat to 192.168.1.20:80',
        "...",
        "\t\tip saddr 192.168.50.0/24 ip daddr 192.168.1.0/24 drop",
        "...",
        "--- home1 and guest1 visit the public server",
        "the server sees you as 198.51.100.2:38676",
        "the server sees you as 198.51.100.2:47104",
        "--- the server visits the forwarded port",
        "home web server",
        "...",
        "Done. Next: bash test.sh",
      ]),
      note: "Three rules in one router: masquerade rewrites the source, dnat sends port 8080 to the home web server, and drop keeps the guest away. Both devices appear as 198.51.100.2.",
    },
    {
      runsOn: "lab",
      command: `bash ${BASE}/test.sh`,
      output: outputOf([
        "...",
        "PASS the server reaches the home web server through 198.51.100.2:8080",
        "PASS guest1 cannot reach the home web server (curl timed out, exit 28)",
        "PASS the server cannot reach 192.168.1.20 directly (curl exit 7, at once)",
        "PASS an unforwarded port, 198.51.100.2:22, is refused at once (exit 7, Connection refused)",
        "RESULT: all checks passed",
      ]),
      note: "Nothing listens on port 22, and the router has no rule for it. The router answers with a refusal at once. A silent drop would have timed out.",
      predict: {
        question: "The server connects to 198.51.100.2 on port 22. Nothing is forwarded there. What happens?",
        options: ["Refused at once", "Times out slowly", "It connects fine"],
        correct: 0,
      },
    },
  ],
};

function CapstoneTwoBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM8ReplayCapstone2Data });
}

export const netM8ReplayCapstone2: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: CapstoneTwoBeat,
};
