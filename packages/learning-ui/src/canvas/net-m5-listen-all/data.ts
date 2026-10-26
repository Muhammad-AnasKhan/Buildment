import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 5.3 beat 5: the web app is started again so that it listens on 0.0.0.0:3000,
// "any address this computer has". The laptop's listening row changes from
// 127.0.0.1:3000 to 0.0.0.0:3000. Both the laptop itself and the phone now
// reach the app. 0.0.0.0 appears only in the listening column: it is a promise,
// not an address to browse to. The "listening" table is a model view of what
// ss -tlnp lists. The devices and addresses are made up (private range). The
// renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "0.0.0.0 answers on every address";
const PURPOSE = "Move the app from 127.0.0.1 to 0.0.0.0. The listening row changes, and now the laptop and the phone both connect.";
const LIMITS =
  "Two made-up devices on one Wi-Fi network. The table is a model of what ss -tlnp lists; the real output from the course lab is in chapter 5.6. 0.0.0.0 is a listening promise, never an address to type into a browser. The laptop's firewall and the Wi-Fi's client isolation can still block a request on a real network, and neither is drawn here.";

export const netM5ListenAllData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "phone", kind: "phone", label: "Phone", x: 70, y: 0, addresses: ["192.168.1.57"] },
    { id: "laptop", kind: "host", label: "Laptop", x: 350, y: 0, addresses: ["192.168.1.23"] },
  ],
  links: [{ from: "phone", to: "laptop", label: "Wi-Fi" }],
  tables: [{ id: "listening", title: "Laptop is listening on", device: "laptop", columns: ["Address:port", "App"], rows: [["127.0.0.1:3000", "web app"]] }],
  steps: [
    {
      caption: "The app listens on 127.0.0.1:3000, so the phone was turned away. Stop the app and start it again.",
      highlight: { devices: ["laptop"], rows: [{ table: "listening", row: 0 }] },
    },
    {
      caption: "This time the app is told to listen on 0.0.0.0: every address the laptop has. The row changes.",
      tableUpdates: [{ table: "listening", row: 0, cells: ["0.0.0.0:3000", "web app"] }],
      highlight: { devices: ["laptop"], rows: [{ table: "listening", row: 0 }] },
    },
    {
      caption: "On the laptop, http://localhost:3000 still works. 127.0.0.1 is one of the addresses the laptop has.",
      highlight: { devices: ["laptop"] },
      verdict: { text: "The laptop still connects", tone: "good" },
    },
    {
      caption: "The phone asks 192.168.1.23, port 3000. That is also an address the laptop has, so the app answers.",
      packet: {
        at: 0,
        fields: [
          { label: "from", value: "192.168.1.57" },
          { label: "to", value: "192.168.1.23:3000" },
        ],
      },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The page comes back to the phone. One listening address now serves both devices.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "from", value: "192.168.1.23:3000" },
          { label: "data", value: "the page" },
        ],
      },
      highlight: { devices: ["phone"] },
      verdict: { text: "Both devices connect", tone: "good" },
    },
  ],
};

function ListenAllBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM5ListenAllData });
}

export const netM5ListenAll: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ListenAllBeat,
};
