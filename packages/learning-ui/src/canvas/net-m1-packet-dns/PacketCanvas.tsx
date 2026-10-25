"use client";

import { ChangeView, InspectView, LinesView } from "./FieldViews";
import { JobsView, UnwrapView, WrapView } from "./BuildViews";
import type { PacketConfig } from "./config";

export type PacketCanvasProps = {
  title: string;
  purpose: string;
  limits: string;
  config: PacketConfig;
};

/**
 * The packet renderer: one component, six modes. A packet is drawn as nested
 * header bands (Ethernet outermost, then IP, then ICMP, UDP or TCP, then the
 * message) with every field a chip. The model is in models/net-packet.ts; the
 * data for each slug is in its own folder.
 */
export function PacketCanvas({ title, purpose, limits, config }: PacketCanvasProps) {
  const view = { title, purpose, limits };
  switch (config.mode) {
    case "inspect":
      return <InspectView {...view} config={config} />;
    case "lines":
      return <LinesView {...view} config={config} />;
    case "change":
      return <ChangeView {...view} config={config} />;
    case "jobs":
      return <JobsView {...view} config={config} />;
    case "wrap":
      return <WrapView {...view} config={config} />;
    case "unwrap":
      return <UnwrapView {...view} config={config} />;
  }
}
