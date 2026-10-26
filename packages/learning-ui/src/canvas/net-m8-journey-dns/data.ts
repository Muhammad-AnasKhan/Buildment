import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 8.1 beat 3 (step 3 of the journey): home1 asks the DNS server named in its
// lease, the router at 192.168.1.1, for web.test. The router's dnsmasq has the
// name in its own list (address=/web.test/203.0.113.80 in the capstone config),
// so it answers 203.0.113.80 without asking anyone else. DNS comes before any
// connection to the server. Port 53 is the one the dig errors in the capstone
// part 4 run name (communications error to 192.168.1.1#53). The renderer is
// NetStepCanvas; the model is models/net-step.ts.
const TITLE = "The name becomes an address";
const PURPOSE = "home1 asks the DNS server from its lease for web.test. The router answers 203.0.113.80, before any connection starts.";
const LIMITS =
  "Two devices and one name. In the lab the router's name list holds web.test and nothing else, so an unknown name is refused. A real resolver may ask other servers and keep answers for a while. Neither is drawn. The tables are simplified views.";

export const netM8JourneyDnsData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "home1", kind: "host", label: "home1", x: 70, y: 0 },
    { id: "hrouter", kind: "router", label: "hrouter", x: 350, y: 0, addresses: ["192.168.1.1"] },
  ],
  links: [{ from: "home1", to: "hrouter" }],
  tables: [
    { id: "names", title: "hrouter's name list", device: "hrouter", columns: ["Name", "Address"], rows: [["web.test", "203.0.113.80"]] },
    { id: "answer", title: "home1's answer", device: "home1", columns: ["Name", "Address"], rows: [] },
  ],
  steps: [
    {
      caption: "home1 wants web.test, but a connection needs an address. Its lease named 192.168.1.1 as the DNS server.",
      highlight: { devices: ["home1"] },
    },
    {
      caption: "home1 sends a DNS question to 192.168.1.1, port 53: what is the address of web.test?",
      packet: {
        at: 0,
        fields: [
          { label: "src IP", value: "192.168.1.101" },
          { label: "dst IP", value: "192.168.1.1" },
          { label: "dst port", value: "53" },
          { label: "asks", value: "web.test" },
        ],
      },
      highlight: { devices: ["home1"] },
    },
    {
      caption: "The router's dnsmasq looks in its own name list. It has web.test, so it asks nobody else.",
      highlight: { devices: ["hrouter"], rows: [{ table: "names", row: 0 }] },
    },
    {
      caption: "The answer comes back: web.test is 203.0.113.80.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "src IP", value: "192.168.1.1" },
          { label: "dst IP", value: "192.168.1.101" },
          { label: "src port", value: "53" },
          { label: "answer", value: "203.0.113.80" },
        ],
      },
      highlight: { devices: ["hrouter"], rows: [{ table: "names", row: 0 }] },
    },
    {
      caption: "home1 now has the address. DNS finished before any connection to the server started.",
      tableUpdates: [{ table: "answer", row: 0, cells: ["web.test", "203.0.113.80"] }],
      highlight: { devices: ["home1"], rows: [{ table: "answer", row: 0 }] },
      verdict: { text: "web.test is 203.0.113.80", tone: "good" },
    },
  ],
};

function DnsBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM8JourneyDnsData });
}

export const netM8JourneyDns: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: DnsBeat,
};
