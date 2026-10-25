import type { CustomCanvasSpec } from "../registry";
import type { ContextPickerConfig } from "../models/context-picker";
import { makeContextPickerCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 6.4: Prometheus, VictoriaMetrics, or something on top
// of Prometheus. Rules read from project docs (dossier B17 to B28) and checked
// 2026-10-25. No rule uses a speed or memory claim as a fact (B26 is a vendor
// claim).
export const METRICS_STORE_CONTEXT: ContextPickerConfig = {
  question: "Which metrics store fits?",
  factors: [
    {
      id: "servers",
      label: "Metrics servers",
      choices: [
        { id: "one", label: "One" },
        { id: "several", label: "Several" },
      ],
    },
    {
      id: "keep",
      label: "Keep data for",
      choices: [
        { id: "weeks", label: "Weeks" },
        { id: "years", label: "Years" },
      ],
    },
    {
      id: "pain",
      label: "Main pain",
      choices: [
        { id: "none", label: "None" },
        { id: "cost", label: "RAM or disk" },
      ],
    },
    {
      id: "need",
      label: "You need",
      choices: [
        { id: "free", label: "Free edition" },
        { id: "down", label: "Downsampling" },
      ],
    },
  ],
  options: [
    { id: "prom", label: "Prometheus", sub: "single node" },
    { id: "vm", label: "VictoriaMetrics", sub: "Apache 2.0" },
    { id: "vmee", label: "VM Enterprise", sub: "paid edition" },
    { id: "thanos", label: "Thanos/Mimir", sub: "on top of Prometheus" },
  ],
  rules: [
    { when: { servers: "several" }, pick: "thanos", why: "Several servers need one global view: Thanos or Mimir add it. Check Mimir's AGPLv3." },
    { when: { need: "down" }, pick: "vmee", why: "Downsampling is listed as an Enterprise feature, not in the free edition." },
    { when: { keep: "years", pain: "cost" }, pick: "vm", why: "Long keep and cost pain: test VictoriaMetrics. Its savings are the vendor's claim." },
    { when: { keep: "years" }, pick: "prom", why: "Years can fit on one server with disk planning. Back up with snapshots." },
    { when: { pain: "cost" }, pick: "vm", why: "Memory or disk cost hurts: test VictoriaMetrics on your own data first." },
  ],
  fallback: { pick: "prom", why: "One server and no pain: the default, Prometheus, is the simple choice." },
  start: { servers: "one", keep: "weeks", pain: "none", need: "free" },
  hint: "Change one fact at a time and read the reason.",
};

export const metricsStoreContext: CustomCanvasSpec = {
  kind: "custom",
  title: "The metrics store depends on your context",
  purpose: "Set how many metrics servers you run, how long you keep data, your main pain and what you need, and see which store the project docs point to.",
  limits:
    "The rules are the course's reading of project docs checked on 2026-10-25, not a ranking. No independent benchmark was found, so no rule treats a speed or memory saving as a fact: those are the vendor's claims until you measure. Other tools exist, and editions and licences change.",
  component: makeContextPickerCanvas(METRICS_STORE_CONTEXT),
};
