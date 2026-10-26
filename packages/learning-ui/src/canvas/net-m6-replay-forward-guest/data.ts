import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 6.8 phone readers: challenge 4 part 2 played from a real recording (session
// forward-guest in recordings/replay-sessions.txt): forwarding-guest.sh builds
// the part 1 network, forwards 203.0.113.1:8080 to the laptop's web server,
// keeps the guest away from the home network, runs the three tests from the
// outside, and prints the router's rules; test.sh checks every gap. At the
// first step the output is hidden until the learner picks what happens to a
// request for port 22, where nothing listens. The renderer is ReplayCanvas in
// net-m1-replay-setup-checker; the model is models/net-replay.ts.
const TITLE = "The home router, part 2, replayed";
const PURPOSE = "Follow a recorded run of challenge 4 part 2: a forwarded port, the three tests from the outside, a guest who cannot reach the home network, the router's rules, and the test.";
const LIMITS =
  "A recording of one real run of the reference solution in the course lab. The script and the test are the course's own. The run shows the three outside tests, the guest's two requests and the router's rules, then the test. The guest's blocked request times out after three seconds. The same symptoms can have other causes.";

export const netM6ReplayForwardGuestData: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: "bash challenges/challenge-4-home-router/part-2-forwarding-and-a-guest-network/forwarding-guest.sh",
      output: outputOf([
        "--- building the part 1 network",
        "--- three tests from the server",
        "forwarded: exit 0",
        "unforwarded: exit 7",
        "direct: exit 7",
        "--- the guest reaches the server, which sees the router's address:",
        "the server sees you as 203.0.113.1:56938",
        "--- the guest asks for the laptop's page (this must be blocked, so it times out):",
        "curl: (28) Connection timed out after 3002 milliseconds",
        "(blocked or failed, exit 28)",
        "--- the router's rules:",
        "table ip nat {",
        "\tchain postrouting {",
        "\t\ttype nat hook postrouting priority srcnat; policy accept;",
        "\t\toifname \"veth-rout\" masquerade",
        "\t}",
        "",
        "\tchain prerouting {",
        "\t\ttype nat hook prerouting priority dstnat; policy accept;",
        "\t\tiifname \"veth-rout\" tcp dport 8080 dnat to 192.168.1.23:80",
        "\t}",
        "}",
        "table ip filter {",
        "\tchain forward {",
        "\t\ttype filter hook forward priority filter; policy accept;",
        "\t\tip saddr 192.168.50.0/24 ip daddr 192.168.1.0/24 drop",
        "\t}",
        "}",
        "Done. Next: bash test.sh",
      ]),
      note: "Port 8080 reached the laptop (exit 0). Port 22 was refused at once (exit 7). The guest's request timed out.",
      predict: {
        question: "A request goes to the router's port 22, where nothing listens. What happens?",
        options: ["Refused at once", "Hangs, no answer", "Reaches laptop"],
        correct: 0,
      },
    },
    {
      runsOn: "lab",
      command: "bash challenges/challenge-4-home-router/part-2-forwarding-and-a-guest-network/test.sh",
      output: outputOf([
        "PASS namespaces laptop, phone, router, server and guest exist",
        "PASS part 1 still works: the laptop reaches the server, which sees 203.0.113.1",
        "PASS mid-point: the router can read the laptop's web page at 192.168.1.23:80",
        "PASS mid-point: the guest reaches the router, 192.168.50.1",
        "PASS GAP 1: from the server, http://203.0.113.1:8080/ returns the laptop's page",
        "PASS an unforwarded port, 203.0.113.1:22, is refused at once (exit 7, Connection refused)",
        "PASS from the server, 192.168.1.23 is not reachable (curl exit 7, at once)",
        "PASS the guest reaches the server, which sees 203.0.113.1",
        "PASS GAP 2: the guest cannot reach the laptop (curl timed out, exit 28)",
        "PASS the phone still reaches the laptop's page (the rule only blocks the guest)",
        "PASS GAP 3: outside-tests.txt has forwarded 0, unforwarded 7 and direct 7",
        "RESULT: all checks passed",
      ]),
      note: "Every check passes, including the refused port 22 and the guest that times out.",
    },
  ],
};

function NetM6ReplayForwardGuestBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM6ReplayForwardGuestData });
}

export const netM6ReplayForwardGuest: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: NetM6ReplayForwardGuestBeat,
};
