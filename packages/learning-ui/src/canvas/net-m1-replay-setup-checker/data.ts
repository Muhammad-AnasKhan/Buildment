import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "./ReplayCanvas";

// 1.2 phone readers: the setup checker played from a real recording (sessions
// setup-checker, not-privileged and outside-lab in recordings/replay-sessions.txt).
// First a working lab, then a lab started without --privileged, then the same
// checker outside the lab. At the last step the output is hidden until the
// learner picks the check that fails. The renderer is ReplayCanvas in this
// folder; the model is models/net-replay.ts.
const TITLE = "The setup checker, replayed";
const PURPOSE = "Follow a recorded run of the setup checker: all checks passing, a lab started without privileges, and the checker run outside the lab.";
const LIMITS =
  "A recording of real runs in the course lab, shown one command at a time. Long outputs are shortened and a line with three dots marks what was left out. The runs for the missing privilege and for outside the lab were recorded without the typed command, so the same checker command is shown. Your own run will say the same words but may list different tools.";

const CHECKER = "bash toolkit/check-setup.sh";

export const netM1ReplaySetupCheckerData: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: CHECKER,
      output: outputOf([
        "PASS in-lab",
        "PASS repo-visible",
        "PASS tool-ip",
        "PASS tool-nft",
        "PASS tool-tcpdump",
        "PASS tool-dnsmasq",
        "PASS tool-dig",
        "PASS tool-traceroute",
        "PASS tool-ping",
        "PASS tool-nc",
        "PASS tool-curl",
        "PASS tool-conntrack",
        "PASS tool-busybox",
        "PASS tool-nano",
        "PASS tool-dhclient",
        "PASS namespace-create",
        "PASS veth-create",
        "PASS line-endings",
        "RESULT: all checks passed",
      ]),
      note: "All 18 checks say PASS. The tools are installed and the lab can build networks.",
    },
    {
      runsOn: "lab",
      command: CHECKER,
      output: outputOf([
        "PASS in-lab",
        "PASS repo-visible",
        "...",
        "PASS tool-dhclient",
        "FAIL no-privilege: a namespace could not be made. The lab needs --privileged. Type exit, then start it with: bash lab/start.sh",
        "PASS line-endings",
        "RESULT: 1 check(s) failed. Read the first FAIL line. Its name tells you which check.",
      ]),
      note: "One FAIL line, and its name no-privilege says what is wrong. The tools passed. The fix is in the line: type exit, then start the lab again.",
    },
    {
      runsOn: "computer",
      command: CHECKER,
      output: outputOf([
        "FAIL not-in-lab: this is not the lab. On your computer run: bash lab/start.sh (Windows PowerShell: .\\lab\\start.ps1). Then run this checker again inside the lab. If you did that, rebuild the image: docker build -t networking-lab lab/",
        "RESULT: 1 check(s) failed. Read the first FAIL line. Its name tells you which check.",
      ]),
      note: "Outside the lab the checker stops at the first check and tells you where to go: start the lab, then run it again there.",
      predict: {
        question: "Run on your own computer, the checker prints one FAIL line. Which check name is on it?",
        options: ["no-privilege", "not-in-lab", "tool-ping"],
        correct: 1,
      },
    },
  ],
};

function SetupCheckerBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM1ReplaySetupCheckerData });
}

export const netM1ReplaySetupChecker: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: SetupCheckerBeat,
};
