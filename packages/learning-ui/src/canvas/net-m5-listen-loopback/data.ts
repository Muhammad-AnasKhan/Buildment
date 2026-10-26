import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 5.3 beat 4: the web app now listens on 127.0.0.1:3000 only. The laptop's own
// request to localhost works, because it stays inside the laptop. The phone's
// request to 192.168.1.23:3000 reaches the laptop, but nothing listens on that
// address, so the laptop turns it away at once. This is the refusal the lab
// recorded (curl exit 7, "Couldn't connect to server"; 5.6): a refusal is a
// quick no, not a silence. The "listening" table is a model view of what
// ss -tlnp lists. The devices and addresses are made up (private range). The
// renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "127.0.0.1 answers only the laptop";
const PURPOSE = "With the app listening on 127.0.0.1, the laptop can open it but the phone is turned away at once.";
const LIMITS =
  "Two made-up devices on one Wi-Fi network. The table is a model of what ss -tlnp lists; the real output from the course lab is in chapter 5.6. A firewall that silently drops the request would look different (a long wait, not a quick refusal), and no firewall is drawn here.";

export const netM5ListenLoopbackData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "phone", kind: "phone", label: "Phone", x: 70, y: 0, addresses: ["192.168.1.57"] },
    { id: "laptop", kind: "host", label: "Laptop", x: 350, y: 0, addresses: ["192.168.1.23"] },
  ],
  links: [{ from: "phone", to: "laptop", label: "Wi-Fi" }],
  tables: [{ id: "listening", title: "Laptop is listening on", device: "laptop", columns: ["Address:port", "App"], rows: [] }],
  steps: [
    {
      caption: "The web app is started so that it listens on 127.0.0.1, port 3000. The table shows its listening address.",
      tableUpdates: [{ table: "listening", row: 0, cells: ["127.0.0.1:3000", "web app"] }],
      highlight: { devices: ["laptop"], rows: [{ table: "listening", row: 0 }] },
    },
    {
      caption: "On the laptop, http://localhost:3000 works. The request stays inside the laptop and meets the app.",
      highlight: { devices: ["laptop"], rows: [{ table: "listening", row: 0 }] },
      verdict: { text: "Works on the laptop itself", tone: "good" },
    },
    {
      caption: "Now the phone asks 192.168.1.23, port 3000. The request crosses the Wi-Fi and reaches the laptop.",
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
      caption: "The app listens only on 127.0.0.1, not on 192.168.1.23. The laptop answers no, and answers at once.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "from", value: "192.168.1.23:3000" },
          { label: "reply", value: "refused" },
        ],
      },
      highlight: { devices: ["phone"], rows: [{ table: "listening", row: 0 }] },
      verdict: { text: "The phone is refused at once", tone: "bad" },
    },
  ],
};

function ListenLoopbackBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM5ListenLoopbackData });
}

export const netM5ListenLoopback: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ListenLoopbackBeat,
};
