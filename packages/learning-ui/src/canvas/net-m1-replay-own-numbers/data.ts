import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 1.3 phone readers: the numbers checker played from a real recording (session
// own-numbers in recordings/replay-sessions.txt). The same checker reads a
// file with a dotted mask, then a file with a hex mask. At the hex step the
// output is hidden until the learner picks the prefix. The renderer is
// ReplayCanvas in net-m1-replay-setup-checker; the model is models/net-replay.ts.
const TITLE = "The numbers checker, replayed";
const PURPOSE = "Follow a recorded run of the numbers checker with a dotted mask and with a hex mask, and predict the prefix for the hex one.";
const LIMITS =
  "A recording of real runs in the course lab. The recording passes the checker two small number files kept in /tmp, one with each kind of mask; your own file is my-numbers.txt. The addresses are lab examples, not yours. Only the mask line differs between the two runs.";

const CHECKER = "bash challenges/challenge-0-setup/part-2-your-numbers/check-numbers.sh";

export const netM1ReplayOwnNumbersData: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: `${CHECKER} /tmp/numbers-dotted.txt`,
      output: outputOf([
        "address   192.168.1.23",
        "mask      255.255.255.0 = /24",
        "prefix    192.168.1.23/24",
        "gateway   192.168.1.1",
        "dns       192.168.1.1",
        "public    203.0.113.45",
        "PASS my-numbers.txt looks right",
      ]),
      note: "The checker prints each number back. The dotted mask 255.255.255.0 is /24, so the prefix is 192.168.1.23/24.",
    },
    {
      runsOn: "lab",
      command: `${CHECKER} /tmp/numbers-hex.txt`,
      output: outputOf([
        "address   192.168.1.23",
        "mask      0xffffff00 = 255.255.255.0 = /24",
        "prefix    192.168.1.23/24",
        "gateway   192.168.1.1",
        "dns       192.168.1.1",
        "public    203.0.113.45",
        "PASS my-numbers.txt looks right",
      ]),
      note: "A hex mask is four pairs of digits and each ff is eight ones. Three ff pairs make 24 ones, the same /24 as the dotted mask.",
      predict: {
        question: "The mask is 0xffffff00. Which prefix does the checker print after the address?",
        options: ["/16", "/32", "/24"],
        correct: 2,
      },
    },
  ],
};

function OwnNumbersBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM1ReplayOwnNumbersData });
}

export const netM1ReplayOwnNumbers: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: OwnNumbersBeat,
};
