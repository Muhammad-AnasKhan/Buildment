import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.3 beat 6: AWS us-east-1, 19 to 20 October 2025. A race in DynamoDB's DNS
// automation left the regional endpoint's record with no addresses. The
// database itself was running, but nothing could find it by name.
export const sysdesignM3DnsEmpty: SceneSpec = {
  kind: "scene",
  title: "An empty DNS record hides a healthy service",
  purpose: "An app asks for the database's address and gets no address back, so it cannot connect even though the database is running.",
  limits: "A simplified retelling of the AWS post-event summary for 19 to 20 October 2025. The real outage also had long knock-on effects on EC2 launches and load balancer health checks, which are left out here.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "app", kind: "server", label: "App server", sub: "needs DynamoDB", x: 60, y: 165 },
      { id: "resolver", kind: "server", label: "Resolver", sub: "asks DNS", x: 210, y: 165 },
      { id: "record", kind: "note", label: "DNS record", sub: "endpoint name", x: 360, y: 95 },
      { id: "db", kind: "database", label: "DynamoDB", sub: "running", x: 360, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "app", to: "resolver", label: "address?" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "resolver", to: "record", label: "addresses?" },
      { kind: "say", at: 1.6, actor: "record", text: "0 addresses", tone: "bad" },
      { kind: "mark", at: 1.6, actor: "record", tone: "bad" },
      { kind: "fly", at: 1.7, dur: 0.7, from: "record", to: "resolver", label: "none", tone: "bad" },
      { kind: "fly", at: 2.4, dur: 0.7, from: "resolver", to: "app", label: "no address", tone: "bad" },
      { kind: "say", at: 3.1, actor: "app", text: "cannot connect", tone: "bad" },
      { kind: "say", at: 3.1, actor: "db", text: "still running", tone: "good" },
      { kind: "verdict", at: 3.3, text: "Healthy database, no way to find it", tone: "bad" },
    ],
    loop: 6.5,
  },
};
