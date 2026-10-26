import type { ComponentType } from "react";
import { LossTimeline } from "./LossTimelineCanvas";
import type { Mode } from "./lossModel";

// A factory without "use client", so a data.ts can call it on the server (the
// canvas registry runs there). The component it returns is the client
// component in LossTimelineCanvas.tsx. The same model feeds both protocols, so
// the TCP and UDP beats compare like with like.

type CanvasProps = { title: string; purpose: string; limits: string };

export function makeLossTimelineCanvas(mode: Mode): ComponentType<CanvasProps> {
  function LossTimelineCanvas({ title, limits }: CanvasProps) {
    return <LossTimeline mode={mode} title={title} limits={limits} />;
  }
  LossTimelineCanvas.displayName = mode === "tcp" ? "TcpLossTimelineCanvas" : "UdpLossTimelineCanvas";
  return LossTimelineCanvas;
}
