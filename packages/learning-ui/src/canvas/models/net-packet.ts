// The packet model behind the net-m1 packet canvases (inspect, lines, change,
// jobs, wrap and unwrap). Pure: no React, no clock, no randomness.
//
// A packet is a list of layers, outermost first, around a payload. Each layer
// holds fields {id, label, value, what, who, module}. The helpers wrap a
// payload in layers, take the outer layer off, apply a router hop (new source
// and destination MAC, TTL minus one) and compare two packets field by field.
//
// Rules in one place:
//   - A packet is built from the inside out: the message, then TCP (or UDP),
//     then IP, then Ethernet last, so Ethernet is the outermost header.
//   - A router takes off only the Ethernet header, reads the IP header, lowers
//     TTL by one and puts a new Ethernet header on for the next link.
//   - A router drops a packet whose TTL would reach 0 (module 4).
//   - ICMP has no port field; a slot with `absent: true` marks what is missing.

export type LayerId = "ethernet" | "arp" | "ip" | "icmp" | "udp" | "tcp";

export type PacketField = {
  id: string;
  label: string;
  value: string;
  /** What it is, in one short sentence. */
  what: string;
  /** Who set it: a phrase that follows "set by", for example "your laptop". */
  who: string;
  /** The module that explains it, or null for the message itself. */
  module: number | null;
  /** A slot that does not exist in this protocol (the empty port slot of ICMP). */
  absent?: boolean;
};

export type PacketLayer = {
  id: LayerId;
  /** "Ethernet header". */
  name: string;
  /** Three or four words for the band title: "this link". */
  short: string;
  /** The job, as a sentence. */
  job: string;
  /** The kind of address it carries: "MAC address". */
  address: string;
  /** Who reads this header. */
  readBy: string;
  /** The module that explains it. */
  module: number;
  fields: PacketField[];
  /** The fields that hold the address this header exists to carry. */
  addressIds: string[];
};

/** Layers outermost first, then the message. */
export type Packet = {
  layers: PacketLayer[];
  payload: PacketField;
};

// ---------------------------------------------------------------- layers

type LayerInfo = Omit<PacketLayer, "fields" | "addressIds">;

/** What each kind of header is for, in the course's words. */
export const LAYER_INFO: Record<LayerId, LayerInfo> = {
  ethernet: {
    id: "ethernet",
    name: "Ethernet header",
    short: "this link",
    job: "Reach the next device on this link.",
    address: "MAC address",
    readBy: "the next device on this link. Every new link gets a new Ethernet header.",
    module: 3,
  },
  arp: {
    id: "arp",
    name: "ARP message",
    short: "asking for a MAC",
    job: "Ask who owns an IP address, to learn the MAC that goes with it.",
    address: "IP address and MAC address",
    readBy: "every device on the link.",
    module: 3,
  },
  ip: {
    id: "ip",
    name: "IP header",
    short: "the whole path",
    job: "Reach the far computer, however many links away it is.",
    address: "IP address",
    readBy: "every router on the path, and the far computer.",
    module: 2,
  },
  icmp: {
    id: "icmp",
    name: "ICMP header",
    short: "a ping",
    job: "Carry a message about the network itself, such as a ping.",
    address: "none: ICMP has no ports",
    readBy: "the far computer's operating system.",
    module: 1,
  },
  udp: {
    id: "udp",
    name: "UDP header",
    short: "the app",
    job: "Reach one program on that computer.",
    address: "port",
    readBy: "the far computer's operating system, which hands the message to the app.",
    module: 5,
  },
  tcp: {
    id: "tcp",
    name: "TCP header",
    short: "the app",
    job: "Reach one program on that computer.",
    address: "port",
    readBy: "the far computer's operating system, which hands the message to the app.",
    module: 5,
  },
};

/** A layer of the given kind holding these fields. */
export function makeLayer(id: LayerId, fields: PacketField[], addressIds: string[] = []): PacketLayer {
  return { ...LAYER_INFO[id], fields, addressIds };
}

/** The title over a band: "Ethernet header" is long, so the band says "Ethernet" and the job. */
export function bandTitle(layer: PacketLayer): string {
  return `${layer.name.replace(/ (header|message)$/, "")}: ${layer.short}`;
}

// ---------------------------------------------------------------- reading a packet

/** Every field, outermost layer first, the message last. */
export function allFields(p: Packet): PacketField[] {
  return [...p.layers.flatMap((l) => l.fields), p.payload];
}

export function findField(p: Packet, id: string): PacketField | undefined {
  return allFields(p).find((f) => f.id === id);
}

/** The layer a field sits in, or undefined for the message. */
export function layerOf(p: Packet, fieldId: string): PacketLayer | undefined {
  return p.layers.find((l) => l.fields.some((f) => f.id === fieldId));
}

/** The accessible name of a field: "TTL, 64, set by your laptop's operating system". */
export function fieldName(f: PacketField): string {
  if (f.absent) return `${f.label}, ${f.value}. ${f.what}`;
  return `${f.label}, ${f.value}, set by ${f.who}`;
}

/** One sentence per layer, for a screen reader or a live summary. */
export function packetSummary(p: Packet): string {
  const parts = p.layers.map((l) => `${l.name}: ${l.fields.map((f) => (f.absent ? `no ${f.label}` : `${f.label} ${f.value}`)).join(", ")}`);
  parts.push(`message: ${p.payload.label} ${p.payload.value}`);
  return `${parts.join(". ")}.`;
}

// ---------------------------------------------------------------- wrapping

/** The order a sender builds a packet in, from the message outward. */
export const WRAP_ORDER: readonly LayerId[] = ["tcp", "ip", "ethernet"];

/** A copy of the packet with `layer` put on the outside. */
export function wrap(p: Packet, layer: PacketLayer): Packet {
  return { layers: [layer, ...p.layers], payload: p.payload };
}

/** The packet without its outer layer, and the layer that came off; null when no layer is left. */
export function unwrap(p: Packet): { packet: Packet; removed: PacketLayer } | null {
  if (p.layers.length === 0) return null;
  const [removed, ...rest] = p.layers;
  return { packet: { layers: rest, payload: p.payload }, removed };
}

/** The header the learner should add next, or null when the packet is complete. */
export function nextToWrap(p: Packet): LayerId | null {
  return WRAP_ORDER[p.layers.length] ?? null;
}

/** Why a header goes on when it does, said when it is added. */
export const WRAP_NOTES: Partial<Record<LayerId, string>> = {
  tcp: "TCP goes right around the message: its ports say which app should get it.",
  ip: "IP goes around TCP: its addresses say which computer the packet is for.",
  ethernet: "Ethernet goes on last, outermost: it names the next device on this link. The packet is ready to send.",
};

export type WrapAttempt = { ok: true; packet: Packet } | { ok: false; reason: string };

/** Add a header if it is the next one in the order; otherwise refuse and say why. */
export function tryWrap(p: Packet, layer: PacketLayer): WrapAttempt {
  const next = nextToWrap(p);
  if (next === layer.id) return { ok: true, packet: wrap(p, layer) };
  if (p.layers.some((l) => l.id === layer.id)) return { ok: false, reason: `The ${layer.name} is already on.` };
  if (next === null) return { ok: false, reason: "The packet is complete: it has all three headers." };
  if (layer.id === "ethernet") {
    return next === "tcp"
      ? { ok: false, reason: "Ethernet goes on last. It is the first header a device reads, so it must be outermost: add TCP, then IP, first." }
      : { ok: false, reason: "Ethernet goes around the IP header, so add IP first." };
  }
  if (layer.id === "ip") return { ok: false, reason: "IP goes around the TCP header, so add TCP first: its ports sit right next to the message." };
  return { ok: false, reason: `The ${layer.name} does not go on yet.` };
}

// ---------------------------------------------------------------- changing a field

/** A copy of the packet with one field's value (and, if given, its explanation) replaced. */
export function setField(p: Packet, id: string, patch: Partial<Pick<PacketField, "value" | "who" | "what">>): Packet {
  const edit = (f: PacketField): PacketField => (f.id === id ? { ...f, ...patch } : f);
  return { layers: p.layers.map((l) => ({ ...l, fields: l.fields.map(edit) })), payload: edit(p.payload) };
}

// ---------------------------------------------------------------- comparing

export type PacketDiff = {
  /** In both packets with a different value. */
  changed: string[];
  /** In both packets with the same value. */
  same: string[];
  /** Only in the second packet. */
  added: string[];
  /** Only in the first packet. */
  removed: string[];
};

/** Compare two packets field by field, matching fields by id. */
export function compare(a: Packet, b: Packet): PacketDiff {
  const fa = new Map(allFields(a).map((f) => [f.id, f]));
  const fb = new Map(allFields(b).map((f) => [f.id, f]));
  const diff: PacketDiff = { changed: [], same: [], added: [], removed: [] };
  for (const [id, f] of fa) {
    const other = fb.get(id);
    if (!other) diff.removed.push(id);
    else if (other.value !== f.value) diff.changed.push(id);
    else diff.same.push(id);
  }
  for (const id of fb.keys()) if (!fa.has(id)) diff.added.push(id);
  return diff;
}

// ---------------------------------------------------------------- a router hop

export type HopAddresses = {
  /** The router's own MAC on the next link. */
  srcMac: string;
  /** The next device on the next link. */
  dstMac: string;
};

export type HopOk = {
  ok: true;
  /** The packet as it reaches the router. */
  arrived: Packet;
  /** The packet with the Ethernet header taken off. */
  stripped: Packet;
  /** The Ethernet header that came off. */
  removed: PacketLayer;
  /** The packet as it leaves: TTL lowered, new Ethernet header. */
  out: Packet;
  ttlBefore: number;
  ttlAfter: number;
};

export type HopFail = {
  ok: false;
  reason: "no-ethernet" | "no-ip" | "bad-ttl" | "ttl-expired";
  message: string;
};

export type HopResult = HopOk | HopFail;

const TTL_ID = "ip-ttl";
const ETH_DST = "eth-dst";
const ETH_SRC = "eth-src";

/**
 * One router hop. The outer layer must be Ethernet and the next must be IP.
 * The router takes the Ethernet header off, reads the IP header, lowers TTL
 * by one and wraps a new Ethernet header (new MACs, same type) around it. A
 * packet whose TTL is 1 or less is dropped instead: lowering it would reach 0.
 */
export function routerHop(p: Packet, hop: HopAddresses): HopResult {
  const first = unwrap(p);
  if (!first || first.removed.id !== "ethernet") return { ok: false, reason: "no-ethernet", message: "The outer header must be Ethernet." };
  const ip = first.packet.layers[0];
  if (!ip || ip.id !== "ip") return { ok: false, reason: "no-ip", message: "Under the Ethernet header there must be an IP header." };
  const ttlField = ip.fields.find((f) => f.id === TTL_ID);
  // A TTL is a whole number of 0 or more: no sign, no fraction, not blank.
  const ttlBefore = ttlField && /^\d+$/.test(ttlField.value) ? Number(ttlField.value) : Number.NaN;
  if (!Number.isInteger(ttlBefore)) return { ok: false, reason: "bad-ttl", message: "The IP header has no usable TTL." };
  if (ttlBefore <= 1) return { ok: false, reason: "ttl-expired", message: "TTL would reach 0, so the router drops the packet." };
  const ttlAfter = ttlBefore - 1;
  const lowered = setField(first.packet, TTL_ID, { value: String(ttlAfter), who: "the router, which lowers it by one at every hop" });
  const eth: PacketLayer = {
    ...first.removed,
    fields: first.removed.fields.map((f) => {
      if (f.id === ETH_DST) return { ...f, value: hop.dstMac, who: "the router, which knows the next device on the next link" };
      if (f.id === ETH_SRC) return { ...f, value: hop.srcMac, who: "the router's network card on the next link" };
      return f;
    }),
  };
  return { ok: true, arrived: p, stripped: first.packet, removed: first.removed, out: wrap(lowered, eth), ttlBefore, ttlAfter };
}

// ---------------------------------------------------------------- capture lines

/** One word group of a tcpdump line, and the field it is, if it is one. */
export type CaptureSegment = { text: string; field?: string };

/** The line as tcpdump printed it (without the timestamp): the segments joined by single spaces. */
export function lineText(segments: readonly CaptureSegment[]): string {
  return segments.map((s) => s.text).join(" ");
}

/** The field ids a line lights, in the order the words appear. */
export function litFields(segments: readonly CaptureSegment[]): string[] {
  const out: string[] = [];
  for (const s of segments) if (s.field && !out.includes(s.field)) out.push(s.field);
  return out;
}

// ---------------------------------------------------------------- text helpers

/** True for a colon-separated 48-bit MAC address. */
export const isMac = (s: string) => /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/.test(s);

/** True for a MAC whose first byte has the locally administered bit set (second-lowest bit of byte one). */
export const isLocallyAdministered = (mac: string) => isMac(mac) && (Number.parseInt(mac.slice(0, 2), 16) & 0b10) !== 0;
