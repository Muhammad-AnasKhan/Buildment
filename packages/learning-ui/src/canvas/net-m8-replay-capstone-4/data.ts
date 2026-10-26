import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 8.5 phone readers: capstone part 4 played from a real recording (session
// capstone-4 in recordings/replay-sessions.txt), the demonstration fault F3
// (default route missing on the home router), which is not valid for a
// learner's write-up. The course's check script injected the fault, ran the
// three test sets and printed their FAIL lines (indented four spaces), then
// applied the fix and ran the three test sets again. At the first step the
// output is hidden until the learner picks what is missing on hrouter. The
// fix command is the one in the part 4 README. The renderer is ReplayCanvas in
// net-m1-replay-setup-checker; the model is models/net-replay.ts.
const TITLE = "Capstone part 4, replayed";
const PURPOSE = "Follow a recorded demonstration fault: the home router loses its default route, the tests name the symptom, and one fix puts it right.";
const LIMITS =
  "A recording of one demonstration fault, F3, made by the course's own check script, not by a learner. That fault is not valid for your write-up. The FAIL lines are the ones the three test sets print, indented four spaces, and some are left out. The last line is the check script's own summary of running the three test sets again. Your own bash test.sh prints one PASS line for each part.";

export const netM8ReplayCapstone4Data: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: "bash test.sh",
      output: outputOf([
        "...",
        "    FAIL hrouter reaches the public server, 203.0.113.80, through prouter FAILED. Ping said: ping: connect: Network is unreachable",
        "...",
        "    FAIL hrouter: ip route get 203.0.113.80 should say 'via 198.51.100.1'. It said: RTNETLINK answers: Network is unreachable",
        "    FAIL traceroute from hrouter should show 198.51.100.1 then 203.0.113.80. It showed: traceroute to 203.0.113.80 (203.0.113.80), 5 hops max, 60 byte packets",
        "...",
      ]),
      note: "Three test sets fail. The first FAIL names the layer: hrouter itself has no way to the server. The error is Network is unreachable, not silence.",
      predict: {
        question: "hrouter cannot find any route to 203.0.113.80 and says Network is unreachable. What is missing?",
        options: ["A masquerade rule", "A default route", "A name server"],
        correct: 1,
      },
    },
    {
      runsOn: "lab",
      command: ["ip netns exec hrouter ip route add default via 198.51.100.1", "bash test.sh"].join("\n"),
      output: outputOf(["PASS F3: after the fix, all three test sets pass"]),
      note: "One command fixed one cause, and the earlier tests pass again. Fix one fault at a time, so you can say which fix worked.",
    },
  ],
};

function CapstoneFourBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM8ReplayCapstone4Data });
}

export const netM8ReplayCapstone4: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: CapstoneFourBeat,
};
