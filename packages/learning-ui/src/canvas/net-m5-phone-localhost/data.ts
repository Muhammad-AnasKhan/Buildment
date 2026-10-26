import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 5.3 beat 1: a web app runs on the laptop (192.168.1.23), port 3000, and
// works at http://localhost:3000 there. The phone (192.168.1.57) is on the
// same Wi-Fi and opens http://localhost:3000. The learner picks where that
// request goes; the answer is the phone itself, because localhost means this
// computer, and the 127.0.0.0/8 block is never forwarded (IANA special-purpose
// registry, S9). Nothing is listening on the phone's own port 3000. The
// devices and addresses are made up (private range). The renderer is
// NetStepCanvas; the model is models/net-step.ts.
const TITLE = "On the phone, localhost is the phone";
const PURPOSE = "The web app works at localhost:3000 on the laptop. On the phone, the same address leads to the phone itself, not to the laptop.";
const LIMITS =
  "Two made-up devices on one Wi-Fi network. The table is a model of what the name localhost means on the phone, not a recording of a phone. No firewall and no Wi-Fi client isolation are drawn: the next beats add the laptop's address and the listening address first.";

export const netM5PhoneLocalhostData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "phone", kind: "phone", label: "Phone", x: 70, y: 0, addresses: ["192.168.1.57"] },
    { id: "laptop", kind: "host", label: "Laptop", x: 350, y: 0, addresses: ["192.168.1.23"] },
  ],
  links: [{ from: "phone", to: "laptop", label: "Wi-Fi" }],
  tables: [{ id: "names", title: "On the phone", device: "phone", columns: ["Name", "Means"], rows: [] }],
  steps: [
    {
      caption: "The web app runs on the laptop, port 3000. On the laptop, http://localhost:3000 opens it.",
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "On the phone, localhost means this computer itself. That is the phone, not the laptop.",
      highlight: { devices: ["phone"], rows: [{ table: "names", row: 0 }] },
      tableUpdates: [{ table: "names", row: 0, cells: ["localhost", "127.0.0.1, the phone"] }],
      verdict: { text: "The request never leaves the phone", tone: "warn" },
      pick: {
        prompt: "On the phone you open http://localhost:3000. Which computer does the request go to?",
        options: [
          { label: "The laptop on the same Wi-Fi", correct: false, why: "localhost is not the name of another computer. It always means this one." },
          { label: "The phone itself", correct: true, why: "localhost is the loopback address 127.0.0.1. It points back at the machine that uses it." },
          { label: "The Wi-Fi router", correct: false, why: "The router is a different computer. localhost never points to a different one." },
        ],
      },
    },
    {
      caption: "The 127.0.0.0/8 block is never forwarded to another computer. The Wi-Fi never sees this request.",
      highlight: { rows: [{ table: "names", row: 0 }] },
      tableUpdates: [{ table: "names", row: 1, cells: ["127.0.0.0/8", "never forwarded"] }],
    },
    {
      caption: "Nothing on the phone listens on port 3000. The page does not open. The app is on the laptop.",
      highlight: { devices: ["phone"] },
      tableUpdates: [{ table: "names", row: 2, cells: ["Port 3000 here", "no app"] }],
      verdict: { text: "Wrong computer: the phone itself", tone: "bad" },
    },
  ],
};

function PhoneLocalhostBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM5PhoneLocalhostData });
}

export const netM5PhoneLocalhost: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: PhoneLocalhostBeat,
};
