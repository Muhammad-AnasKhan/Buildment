import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 3.9 phone readers: challenge 1 part 2 played from a real recording (session
// wrong-mask in recordings/replay-sessions.txt): wrong-mask.sh gives the two
// computers masks that disagree (the laptop /24, the phone /28), and test.sh
// shows the two different failures and the fix. At the test step the output is
// hidden until the learner picks which computer says "Network is unreachable".
// The renderer is ReplayCanvas in net-m1-replay-setup-checker; the model is
// models/net-replay.ts.
const TITLE = "The wrong mask, replayed";
const PURPOSE = "Follow a recorded run of challenge 1 part 2: one cable, two masks that disagree, two different failures, and the fix.";
const LIMITS =
  "A recording of one real run in the course lab. The script and the test are the course's own. The run shows pings in both directions, then the fix where both masks are /24. No router or gateway is involved, and the same symptoms can have other causes.";

export const netM3ReplayWrongMaskData: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: "bash challenges/challenge-1-two-computers/part-2-wrong-mask/wrong-mask.sh",
      output: outputOf([
        "10: veth-laptop@if9: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000 link-netns phone",
        "    inet 192.168.1.10/24 scope global veth-laptop",
        "       valid_lft forever preferred_lft forever",
        "9: veth-phone@if10: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000 link-netns laptop",
        "    inet 192.168.1.20/28 scope global veth-phone",
        "       valid_lft forever preferred_lft forever",
        "Done. laptop is 192.168.1.10/24 and phone is 192.168.1.20/28.",
      ]),
      note: "One cable, two computers: the laptop has a /24 mask and the phone has a /28 mask. They disagree.",
    },
    {
      runsOn: "lab",
      command: "bash challenges/challenge-1-two-computers/part-2-wrong-mask/test.sh",
      output: outputOf([
        "--- masks disagree: laptop /24, phone /28",
        "PASS laptop to 192.168.1.20: silent loss (2 sent, 0 received)",
        "PASS phone to 192.168.1.10: Network is unreachable",
        "PASS laptop to 192.168.1.99: silent loss (2 sent, 0 received)",
        "PASS the ARP request for 192.168.1.99 goes unanswered",
        "--- the fix: both /24",
        "PASS laptop to 192.168.1.20: 0% loss",
        "PASS phone to 192.168.1.10: 0% loss",
        "RESULT: all checks passed",
      ]),
      note: "The phone refuses at once: it thinks the laptop is not on its network. The laptop sends and hears only silence. Both /24 fixes it.",
      predict: {
        question: "One computer answers a ping with Network is unreachable. Which one?",
        options: ["The one with /24", "The one with /28", "Both of them"],
        correct: 1,
      },
    },
  ],
};

function WrongMaskBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM3ReplayWrongMaskData });
}

export const netM3ReplayWrongMask: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: WrongMaskBeat,
};
