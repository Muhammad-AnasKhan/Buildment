import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 5.2 beat 3: two tabs talk to the same website. Each conversation is named by
// five numbers: the protocol (TCP), the laptop's address and port, and the
// website's address and port. The two tabs match in four of the five; only the
// laptop's port differs (51234 and 51236). The learner first picks which of the
// five numbers differs, then the last step lights that column. The website is
// a documentation address (203.0.113.80); the laptop's is private. The
// renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "Five numbers name one conversation";
const PURPOSE = "Two tabs talk to the same website. Compare the five numbers of each conversation and find the one that differs.";
const LIMITS =
  "Two made-up conversations over TCP, with ports chosen by the model. The two tables are one list of conversations, split in two so that each fits on a phone: the laptop's end on top, the website's end below. The course calls these the five numbers; a real computer keeps them in the same way for every connection, and the commands ss -tn and netstat -an list them.";

export const netM5FiveNumbersData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 0, addresses: ["192.168.1.23"] },
    { id: "website", kind: "server", label: "Website", x: 350, y: 0, addresses: ["203.0.113.80"] },
  ],
  links: [{ from: "laptop", to: "website" }],
  tables: [
    { id: "mine", title: "The laptop's end", device: "laptop", columns: ["Name", "Proto", "Address", "Port"], rows: [] },
    { id: "theirs", title: "The website's end", device: "website", columns: ["Name", "Address", "Port"], rows: [] },
  ],
  steps: [
    {
      caption: "Tab 1 is one conversation. It has five numbers: the protocol, two addresses and two ports.",
      packet: {
        at: 0,
        fields: [
          { label: "protocol", value: "TCP" },
          { label: "from", value: "192.168.1.23:51234" },
          { label: "to", value: "203.0.113.80:443" },
        ],
      },
      tableUpdates: [
        { table: "mine", row: 0, cells: ["Tab 1", "TCP", "192.168.1.23", "51234"] },
        { table: "theirs", row: 0, cells: ["Tab 1", "203.0.113.80", "443"] },
      ],
      highlight: { rows: [{ table: "mine", row: 0 }, { table: "theirs", row: 0 }] },
    },
    {
      caption: "Tab 2 talks to the same website on the same port 443. It is a second conversation.",
      packet: {
        at: 0,
        fields: [
          { label: "protocol", value: "TCP" },
          { label: "from", value: "192.168.1.23:51236" },
          { label: "to", value: "203.0.113.80:443" },
        ],
      },
      tableUpdates: [
        { table: "mine", row: 1, cells: ["Tab 2", "TCP", "192.168.1.23", "51236"] },
        { table: "theirs", row: 1, cells: ["Tab 2", "203.0.113.80", "443"] },
      ],
      highlight: { rows: [{ table: "mine", row: 1 }, { table: "theirs", row: 1 }] },
    },
    {
      caption: "Four numbers match. Only the laptop's port differs, 51234 and 51236. That one number tells the tabs apart.",
      highlight: { rows: [{ table: "mine", row: 0 }, { table: "mine", row: 1 }] },
      verdict: { text: "Only the laptop's port differs", tone: "good" },
      pick: {
        prompt: "Tab 1 and tab 2 talk to the same website. Which of the five numbers is different?",
        options: [
          { label: "The website's port, 443", correct: false, why: "Both tabs go to 443. This number is the same in both rows." },
          { label: "The laptop's address", correct: false, why: "Both tabs use 192.168.1.23. The laptop has only one address." },
          { label: "The laptop's port", correct: true, why: "Tab 1 uses 51234 and tab 2 uses 51236. Everything else matches." },
        ],
      },
    },
  ],
};

function FiveNumbersBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM5FiveNumbersData });
}

export const netM5FiveNumbers: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: FiveNumbersBeat,
};
