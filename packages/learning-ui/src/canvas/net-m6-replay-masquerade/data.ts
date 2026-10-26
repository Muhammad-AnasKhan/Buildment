import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 6.7 phone readers: challenge 4 part 1 played from a real recording (session
// masquerade in recordings/replay-sessions.txt): masquerade.sh turns forwarding
// on, shows that the ping gets no answer before the masquerade rule, lets both
// devices reach the server (which sees 203.0.113.1), sends both devices out of
// source port 41000, and prints the router's NAT table; test.sh then checks
// every gap. At the first step the output is hidden until the learner picks
// what port the server reports for the phone. The renderer is ReplayCanvas in
// net-m1-replay-setup-checker; the model is models/net-replay.ts.
const TITLE = "The home router, part 1, replayed";
const PURPOSE = "Follow a recorded run of challenge 4 part 1: a router with forwarding and a masquerade rule, two devices that both send from port 41000, the router's NAT table, and the test.";
const LIMITS =
  "A recording of one real run of the reference solution in the course lab. The script and the test are the course's own. Both devices sent from port 41000; the kernel chose the phone's new port, 15510, on that run, and it will differ on yours. The test picks its own random port, so the two ports it names (42261 and 6028) differ from the script's run. The recording ends with the NAT table, shortened to the lines for port 8080 by the script itself. The same symptoms can have other causes.";

export const netM6ReplayMasqueradeData: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: "bash challenges/challenge-4-home-router/part-1-masquerade/masquerade.sh",
      output: outputOf([
        "net.ipv4.ip_forward = 1",
        "--- before masquerade: the laptop pings the server",
        "PING 203.0.113.80 (203.0.113.80) 56(84) bytes of data.",
        "",
        "--- 203.0.113.80 ping statistics ---",
        "1 packets transmitted, 0 received, 100% packet loss, time 0ms",
        "",
        "(no answer, as expected: the server has no way back to 192.168.1.23)",
        "--- mid-point: the laptop and the phone ask the server who they are",
        "the server sees you as 203.0.113.1:54908",
        "the server sees you as 203.0.113.1:55358",
        "--- both devices use source port 41000",
        "laptop sent from 41000. The server says: the server sees you as 203.0.113.1:41000",
        "phone sent from 41000. The server says:  the server sees you as 203.0.113.1:15510",
        "The router's NAT table:",
        "tcp      6 114 TIME_WAIT src=192.168.1.24 dst=203.0.113.80 sport=55358 dport=8080 src=203.0.113.80 dst=203.0.113.1 sport=8080 dport=55358 [ASSURED] mark=0 use=1",
        "tcp      6 115 TIME_WAIT src=192.168.1.24 dst=203.0.113.80 sport=41000 dport=8080 src=203.0.113.80 dst=203.0.113.1 sport=8080 dport=15510 [ASSURED] mark=0 use=1",
        "tcp      6 118 TIME_WAIT src=192.168.1.23 dst=203.0.113.80 sport=41000 dport=8080 src=203.0.113.80 dst=203.0.113.1 sport=8080 dport=41000 [ASSURED] mark=0 use=1",
        "tcp      6 114 TIME_WAIT src=192.168.1.23 dst=203.0.113.80 sport=54908 dport=8080 src=203.0.113.80 dst=203.0.113.1 sport=8080 dport=54908 [ASSURED] mark=0 use=1",
        "Done. Next: bash test.sh",
      ]),
      note: "The phone and the laptop both sent from 41000. The laptop's port was kept, and the phone got a new port.",
      predict: {
        question: "Both devices send from port 41000. What port does the server report for the phone?",
        options: ["Still 41000", "A new port", "Port 8080"],
        correct: 1,
      },
    },
    {
      runsOn: "lab",
      command: "bash challenges/challenge-4-home-router/part-1-masquerade/test.sh",
      output: outputOf([
        "PASS namespaces laptop, phone, router and server exist",
        "PASS mid-point: laptop and phone reach the router, 192.168.1.1",
        "PASS mid-point: the router reaches the server, 203.0.113.80",
        "PASS GAP 1: forwarding is on in the router",
        "PASS GAP 1: laptop and phone both have a default route via 192.168.1.1",
        "PASS GAP 2: the router has a masquerade rule",
        "PASS laptop reaches the server, and the server sees 203.0.113.1",
        "PASS phone reaches the server, and the server sees 203.0.113.1",
        "PASS from the server, 192.168.1.23 is not reachable (curl exit 7, at once)",
        "PASS both devices sent from the same source port, and the server saw two different ports (42261 and 6028)",
        "PASS conntrack -L shows the phone's flow with the new port the server saw (6028)",
        "PASS GAP 3: your two files show two different ports (41000 and 15510)",
        "PASS GAP 4: conntrack.txt lists two flows that both left from sport=41000",
        "RESULT: all checks passed",
      ]),
      note: "Every check passes, including the two that compare the ports and read the new one in the NAT table.",
    },
  ],
};

function NetM6ReplayMasqueradeBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM6ReplayMasqueradeData });
}

export const netM6ReplayMasquerade: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: NetM6ReplayMasqueradeBeat,
};
