import type { CaptureSegment, HopAddresses, Packet } from "../models/net-packet";

// What each packet slug hands to the one PacketCanvas component.

/** Tap any field of one real packet. */
export type InspectConfig = {
  mode: "inspect";
  packet: Packet;
  /** The field that is selected when the picture opens. */
  initial: string;
  /** The verdict banner: what the picture shows, in words (at most about 40 characters). */
  verdict: string;
};

/** One recorded tcpdump line and the packet it is. */
export type CaptureLine = {
  id: string;
  /** The short name on the button: "Echo request". */
  title: string;
  /** What the line is, in one sentence. */
  what: string;
  segments: CaptureSegment[];
  packet: Packet;
};

/** Tap one of the recorded lines; its words and fields light up. */
export type LinesConfig = { mode: "lines"; lines: CaptureLine[] };

export type ChangeOption = {
  id: string;
  /** The destination, on the button. */
  address: string;
  /** "recorded in the lab" or "made up for this picture". */
  note: string;
  packet: Packet;
};

/** Pick a destination; the fields that differ from the first option light up as changed. */
export type ChangeConfig = { mode: "change"; options: [ChangeOption, ChangeOption]; initial: string };

/** Tap a header to see its job. */
export type JobsConfig = { mode: "jobs"; packet: Packet };

/** Add the headers in order; `packet` is the finished packet. */
export type WrapConfig = { mode: "wrap"; packet: Packet };

/** Step the finished packet through a router. */
export type UnwrapConfig = { mode: "unwrap"; packet: Packet; hop: HopAddresses };

export type PacketConfig = InspectConfig | LinesConfig | ChangeConfig | JobsConfig | WrapConfig | UnwrapConfig;
export type PacketMode = PacketConfig["mode"];
