"use client";

import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { ControlButton } from "../net-m2-address-bits/bit-parts";
import { WRAP_NOTES, bandTitle, packetSummary, routerHop, tryWrap, type LayerId, type Packet } from "../models/net-packet";
import { CardLine, LiveCard, NoteCard, moduleText } from "./cards";
import type { JobsConfig, UnwrapConfig, WrapConfig } from "./config";
import { MARGIN, OUTER_W, VIEW_W, layoutPacket } from "./layout";
import { GhostHeader, PacketBands, type ChipState } from "./PacketBands";
import { PacketSvg } from "./PacketSvg";
import type { ViewProps } from "./FieldViews";

// The three modes about layers: jobs (tap a header), wrap (add headers in
// order) and unwrap (step a packet through a router).

const BANDS_TOP = 50;
const BOTTOM_PAD = 10;
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------------------------------------------------------------- jobs

export function JobsView({ title, purpose, limits, config }: ViewProps<JobsConfig>) {
  const [sel, setSel] = useState<LayerId>(config.packet.layers[0].id);
  const layout = useMemo(() => layoutPacket(config.packet, { top: BANDS_TOP }), [config.packet]);
  const layer = config.packet.layers.find((l) => l.id === sel) ?? config.packet.layers[0];
  const verdict = `${capital(layer.address)}: ${layer.short}`;
  const stateOf = (id: string): ChipState => (layer.addressIds.includes(id) ? { tone: "accent" } : {});
  return (
    <BeatFrame label={title} limits={limits} hint="Tap a header to see its job and who reads it.">
      <PacketSvg title={title} purpose={purpose} summary={packetSummary(config.packet)} height={Math.ceil(layout.bottom) + BOTTOM_PAD}>
        <PacketBands packet={config.packet} layout={layout} chipState={stateOf} selectedLayer={layer.id} onLayer={setSel} />
        <VerdictBanner width={VIEW_W} text={verdict} tone="accent" />
      </PacketSvg>
      <LiveCard summary={verdict}>
        <NoteCard heading={`${layer.name}: ${layer.short}`}>
          <CardLine lead="Its job:">{layer.job}</CardLine>
          <CardLine lead="The address it holds:">{layer.address}.</CardLine>
          <CardLine lead="Who reads it:">{layer.readBy}</CardLine>
          <CardLine lead="Where the course explains it:">{moduleText(layer.module)}.</CardLine>
        </NoteCard>
      </LiveCard>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- wrap

type WrapStatus = { text: string; banner: string; tone: Tone; card: Tone | undefined };

const START_STATUS: WrapStatus = {
  text: "Add the three headers, one tap each. Which one goes on first?",
  banner: "The message, with no headers yet",
  tone: "accent",
  card: undefined,
};

const ADDED_BANNER: Partial<Record<LayerId, { text: string; tone: Tone }>> = {
  tcp: { text: "TCP header on: the app's port", tone: "accent" },
  ip: { text: "IP header on: the far computer", tone: "accent" },
  ethernet: { text: "Packet complete: ready to send", tone: "good" },
};

const TRAY_H = 44;
const TRAY_GAP = 6;

export function WrapView({ title, purpose, limits, config }: ViewProps<WrapConfig>) {
  const full = config.packet;
  const total = full.layers.length;
  const [packet, setPacket] = useState<Packet>({ layers: [], payload: full.payload });
  const [status, setStatus] = useState<WrapStatus>(START_STATUS);

  // The finished packet fixes where the message sits, so the picture grows outward around it.
  const frame = useMemo(() => {
    const done = layoutPacket(full, { top: BANDS_TOP });
    const payloadBottom = (done.payload?.y ?? 0) + (done.payload?.h ?? 0);
    return { payloadBottom, trayY: Math.ceil(done.bottom) + 12 };
  }, [full]);
  const layout = layoutPacket(packet, { baseDepth: total - packet.layers.length, payloadBottom: frame.payloadBottom });
  const height = frame.trayY + TRAY_H + BOTTOM_PAD;
  const trayW = (OUTER_W - 2 * TRAY_GAP) / 3;

  const add = (id: LayerId) => {
    const layer = full.layers.find((l) => l.id === id);
    if (!layer) return;
    const attempt = tryWrap(packet, layer);
    if (attempt.ok) {
      setPacket(attempt.packet);
      const banner = ADDED_BANNER[id] ?? { text: `${layer.name} on`, tone: "accent" as Tone };
      setStatus({ text: WRAP_NOTES[id] ?? `${layer.name} added.`, banner: banner.text, tone: banner.tone, card: "good" });
    } else {
      setStatus({ text: attempt.reason, banner: "Not yet: that header goes on later", tone: "warn", card: "warn" });
    }
  };
  const reset = () => {
    setPacket({ layers: [], payload: full.payload });
    setStatus(START_STATUS);
  };

  return (
    <BeatFrame label={title} limits={limits} hint="Tap the headers in the order a sender adds them." controls={<ControlButton onClick={reset}>Start over</ControlButton>}>
      <PacketSvg title={title} purpose={purpose} summary={packetSummary(packet)} height={height}>
        {packet.layers.length === 0 ? (
          <text x={VIEW_W / 2} y={BANDS_TOP + 40} textAnchor="middle" aria-hidden="true" className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>
            headers go around the message
          </text>
        ) : null}
        <PacketBands packet={packet} layout={layout} fade />
        {full.layers.map((l, i) => {
          const x = MARGIN + i * (trayW + TRAY_GAP);
          const added = packet.layers.some((p) => p.id === l.id);
          return (
            <SvgButton key={l.id} x={x} y={frame.trayY} width={trayW} height={TRAY_H} rx={12} label={`Add the ${l.name}`} pressed={added} onPress={() => add(l.id)}>
              <rect
                x={x}
                y={frame.trayY}
                width={trayW}
                height={TRAY_H}
                rx={12}
                strokeWidth={added ? 1.5 : 2}
                strokeDasharray={added ? "4 3" : undefined}
                className={cn(added ? cn("fill-muted", NEUTRAL.faintStroke) : cn(NEUTRAL.surface, TONES.accent.stroke), SHAPE_TRANSITION)}
              />
              <g aria-hidden="true">
                <text x={x + trayW / 2} y={frame.trayY + 18} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>
                  {added ? "added" : "add the"}
                </text>
                <text x={x + trayW / 2} y={frame.trayY + 36} textAnchor="middle" className={cn(added ? NEUTRAL.mutedText : NEUTRAL.text, "text-[13px] font-bold")}>
                  {l.name}
                </text>
              </g>
            </SvgButton>
          );
        })}
        <VerdictBanner width={VIEW_W} text={status.banner} tone={status.tone} />
      </PacketSvg>
      <LiveCard summary={status.banner}>
        <NoteCard tone={status.card}>
          <p>{status.text}</p>
        </NoteCard>
      </LiveCard>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- unwrap

const STEP_LABELS = ["Strip", "Read", "New header"] as const;
/** "new" and "was 64" are the notes the chips carry; their room is reserved at every step. */
const NOTE_CHARS: Record<string, number> = { "eth-dst": 3, "eth-src": 3, "ip-ttl": 6 };

export function UnwrapView({ title, purpose, limits, config }: ViewProps<UnwrapConfig>) {
  const hop = useMemo(() => routerHop(config.packet, config.hop), [config.packet, config.hop]);
  const [step, setStep] = useState(0);

  const frame = useMemo(() => {
    if (!hop.ok) return null;
    const arrived = layoutPacket(hop.arrived, { top: BANDS_TOP, noteChars: NOTE_CHARS });
    const payloadBottom = (arrived.payload?.y ?? 0) + (arrived.payload?.h ?? 0);
    const stripped = layoutPacket(hop.stripped, { baseDepth: 1, payloadBottom, noteChars: NOTE_CHARS });
    const out = layoutPacket(hop.out, { top: BANDS_TOP, noteChars: NOTE_CHARS });
    return { arrived, stripped, out, height: Math.ceil(arrived.bottom) + BOTTOM_PAD };
  }, [hop]);

  if (!hop.ok || !frame) {
    return (
      <BeatFrame label={title} limits={limits}>
        <p className="p-3 text-sm text-foreground">{hop.ok ? "" : hop.message}</p>
      </BeatFrame>
    );
  }

  const ethernet = hop.removed;
  const ipDst = hop.stripped.layers[0].fields.find((f) => f.id === "ip-dst")?.value ?? "";
  const newDst = hop.out.layers[0].fields.find((f) => f.id === "eth-dst")?.value ?? "";
  const newSrc = hop.out.layers[0].fields.find((f) => f.id === "eth-src")?.value ?? "";

  const banners = [
    { text: "Arrives with its Ethernet header", tone: "accent" as Tone },
    { text: "Ethernet header off: only for that link", tone: "accent" as Tone },
    { text: `Read the IP header: TTL ${hop.ttlBefore}`, tone: "accent" as Tone },
    { text: `TTL ${hop.ttlAfter}, new Ethernet header`, tone: "good" as Tone },
  ];
  const banner = banners[step];

  const stateOf = (id: string): ChipState => {
    if (step === 2 && (id === "ip-dst" || id === "ip-ttl")) return { tone: "accent" };
    if (step === 3) {
      if (id === "ip-ttl") return { tone: "warn", note: `was ${hop.ttlBefore}` };
      if (id === "eth-dst" || id === "eth-src") return { tone: "accent", note: "new" };
    }
    return {};
  };

  const layout = step === 0 ? frame.arrived : step === 3 ? frame.out : frame.stripped;
  const packet = step === 0 ? hop.arrived : step === 3 ? hop.out : hop.stripped;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint="Step the packet through the router: Strip, Read, New header."
      controls={
        <>
          <ControlButton onClick={() => setStep((s) => Math.min(3, s + 1))} disabled={step >= 3}>
            {step >= 3 ? "Done" : STEP_LABELS[step]}
          </ControlButton>
          <ControlButton onClick={() => setStep(0)}>Start over</ControlButton>
        </>
      }
    >
      <PacketSvg title={title} purpose={purpose} summary={packetSummary(packet)} height={frame.height}>
        {step === 1 || step === 2 ? <GhostHeader band={frame.arrived.bands[0]} packet={hop.arrived} title={`${bandTitle(ethernet)} (taken off)`} /> : null}
        <PacketBands packet={packet} layout={layout} chipState={stateOf} fade />
        <VerdictBanner width={VIEW_W} text={banner.text} tone={banner.tone} />
      </PacketSvg>
      <LiveCard summary={banner.text}>
        {step === 0 ? (
          <NoteCard heading="The packet reaches the router">
            <p>Its Ethernet header was addressed to this router, on this link only. Press Strip to take it off.</p>
          </NoteCard>
        ) : step === 1 ? (
          <NoteCard heading="Strip: the Ethernet header comes off">
            <p>It named the router on the last link, so the router is done with it. The IP header and everything inside stay as they are.</p>
          </NoteCard>
        ) : step === 2 ? (
          <NoteCard heading="Read: the router reads the IP header">
            <p>{`The packet is for ${ipDst}, with TTL ${hop.ttlBefore}. The router does not open the TCP header or the message.`}</p>
          </NoteCard>
        ) : (
          <NoteCard heading="New header: ready for the next link" tone="good">
            <p>{`The router lowered TTL from ${hop.ttlBefore} to ${hop.ttlAfter} and wrapped a new Ethernet header, from its own MAC ${newSrc} to the next device, ${newDst}. The IP addresses and the message did not change.`}</p>
          </NoteCard>
        )}
      </LiveCard>
    </BeatFrame>
  );
}
