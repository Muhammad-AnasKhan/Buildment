import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.4 beat 1 (watch only): a fictional school with 100 staff laptops, 1 exam
// server and 499 guest phones on one network. Staff and guest traffic mix on it.
// A guest phone sends unwanted traffic to the exam server and the traffic
// arrives, because nothing on a flat network sits in the way. Arriving means the
// model lets the traffic reach the server; it does not mean a login works or any
// data is taken. The school, the counts and the groups are made up.
export const netM3SceneFlatSchool = {
  kind: "scene",
  title: "600 devices, one network",
  purpose: "A school puts 100 staff laptops, 1 exam server and 499 guest phones on one network. A guest phone can reach the exam server.",
  limits:
    "A fictional school with made-up counts, not a report about a real school. Each group is one card. Reaching the server means the traffic arrives: it does not mean a login works, and no data is taken. The picture shows no attack steps.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "staff", label: "Staff", kind: "worker", sub: "100 laptops", x: 70, y: 100 },
      { id: "exam", label: "Exam", kind: "server", sub: "1 server", x: 350, y: 100 },
      { id: "net", label: "One network", kind: "router", sub: "no boundary", x: 210, y: 190 },
      { id: "guests", label: "Guests", kind: "phone", sub: "499 phones", x: 210, y: 290 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "staff", to: "net", label: "staff data", tone: "good" },
      { kind: "fly", at: 0.3, dur: 1, from: "guests", to: "net", label: "guest data", tone: "good" },
      { kind: "say", at: 1.5, actor: "net", text: "all mixed", tone: "accent" },
      { kind: "say", at: 2.4, actor: "guests", text: "sends unwanted", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 1, from: "guests", to: "net", label: "to exam server", tone: "warn" },
      { kind: "fly", at: 3.6, dur: 1.1, from: "net", to: "exam", label: "to exam server", tone: "warn" },
      { kind: "say", at: 4.9, actor: "exam", text: "traffic arrives", tone: "bad" },
      { kind: "mark", at: 4.9, actor: "exam", tone: "bad" },
      { kind: "verdict", at: 5.1, text: "A guest can reach the exam server.", tone: "bad" },
    ],
    loop: 8,
  },
} satisfies SceneSpec;
