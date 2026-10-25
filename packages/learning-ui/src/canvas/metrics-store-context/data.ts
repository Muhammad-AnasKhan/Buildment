import type { CustomCanvasSpec } from "../registry";
import type { ContextPickerConfig } from "../models/context-picker";
import { makeContextPickerCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 6.4: Prometheus, VictoriaMetrics (single node, cluster
// or Enterprise), or something on top of Prometheus. Rules read from project
// docs (dossier B17 to B28) and checked 2026-10-25. No rule uses a speed or
// memory claim as a fact (B26 is a vendor claim). Other tools also offer
// multi-node storage and downsampling; the dossier does not compare them, so
// the reasons say so and the chapter says this course did not check.
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
      id: "view",
      label: "One view across",
      choices: [
        { id: "no", label: "Not needed" },
        { id: "yes", label: "Needed" },
      ],
    },
    {
      id: "pain",
      label: "Main pain",
      choices: [
        { id: "none", label: "None" },
        { id: "long", label: "Long keep" },
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
    { id: "vmcluster", label: "VM cluster", sub: "multi-node" },
    { id: "vmee", label: "VM Enterprise", sub: "paid edition" },
    { id: "thanos", label: "Thanos/Mimir", sub: "adds a global view" },
  ],
  rules: [
    { when: { servers: "several", view: "yes", pain: "cost" }, pick: "vmcluster", why: "VM cluster is a path past one node; its docs prefer single-node below 1M points a second." },
    { when: { servers: "several", view: "yes" }, pick: "thanos", why: "Thanos or Mimir add one view over Prometheus servers. Other tools also do multi-node." },
    { when: { need: "down" }, pick: "vmee", why: "VictoriaMetrics lists downsampling as Enterprise only. Other tools also offer it." },
    { when: { servers: "several" }, pick: "prom", why: "Servers with no shared view can stay separate Prometheus servers." },
    { when: { pain: "long" }, pick: "prom", why: "Years can fit on one server with disk planning. Back up with snapshots." },
    { when: { pain: "cost" }, pick: "vm", why: "Memory or disk cost hurts: test VictoriaMetrics on your own data first." },
  ],
  fallback: { pick: "prom", why: "One server and no pain: the default, Prometheus, is the simple choice." },
  start: { servers: "one", view: "no", pain: "none", need: "free" },
  hint: "Change one fact at a time and read the reason.",
};

export const metricsStoreContext: CustomCanvasSpec = {
  kind: "custom",
  title: "The metrics store depends on your context",
  purpose: "Set how many metrics servers you run, whether you need one view across them, your main pain and what you need, and see which store the project docs point to.",
  limits:
    "The rules are the course's reading of project docs checked on 2026-10-25, not a ranking. No independent benchmark was found, so no rule treats a speed or memory saving as a fact: those are the vendor's claims until you measure. Other tools also offer multi-node storage and downsampling, and this course did not compare them. Editions and licences change.",
  component: makeContextPickerCanvas(METRICS_STORE_CONTEXT),
};
