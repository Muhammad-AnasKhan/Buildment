// AI Engineering Interview course, chapter 11.3 "The KV cache from first
// principles". Pure arithmetic for the KV cache of one token and of one chat.
// Memory in stats is GB (decimal, 1e9 bytes); KiB (1,024 bytes) is used only
// for the per-token size.

import type { SliderValues } from "../renderers/slider/types";

/** The chat length the canvas sizes, in tokens. */
export const CHAT_TOKENS = 32_768;
/** The KV head count of the full multi-head comparison. */
export const FULL_KV_HEADS = 32;
export const BYTES_PER_KIB = 1_024;
export const BYTES_PER_GB = 1_000_000_000;

export type KvShape = { layers: number; kvHeads: number; headSize: number; bytesPerValue: number };

function whole(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(1, Math.round(value)) : fallback;
}

export function kvShape(values: SliderValues): KvShape {
  return {
    layers: whole(values.layers, 32),
    kvHeads: whole(values.kvHeads, 8),
    headSize: whole(values.headSize, 128),
    bytesPerValue: whole(values.bytesPerValue, 2),
  };
}

/** Bytes of KV cache for one token: keys and values (2) x layers x KV heads x head size x bytes per value. */
export function kvBytesPerToken(shape: KvShape): number {
  return 2 * shape.layers * shape.kvHeads * shape.headSize * shape.bytesPerValue;
}

/** Bytes of KV cache for a chat of the given length. */
export function kvBytesPerChat(shape: KvShape, tokens: number = CHAT_TOKENS): number {
  return kvBytesPerToken(shape) * tokens;
}

export type KvResult = {
  shape: KvShape;
  perTokenBytes: number;
  perTokenKiB: number;
  chatBytes: number;
  chatGB: number;
  /** The same settings with 32 KV heads (full multi-head attention), per chat in GB. */
  fullGB: number;
  /** The same settings with one KV head, per chat in GB. */
  oneHeadGB: number;
  /** KV heads / 32. Above 1 means this model is larger than full multi-head. */
  ratio: number;
};

export function kvResult(values: SliderValues): KvResult {
  const shape = kvShape(values);
  const perTokenBytes = kvBytesPerToken(shape);
  const chatBytes = kvBytesPerChat(shape);
  return {
    shape,
    perTokenBytes,
    perTokenKiB: perTokenBytes / BYTES_PER_KIB,
    chatBytes,
    chatGB: chatBytes / BYTES_PER_GB,
    fullGB: kvBytesPerChat({ ...shape, kvHeads: FULL_KV_HEADS }) / BYTES_PER_GB,
    oneHeadGB: kvBytesPerChat({ ...shape, kvHeads: 1 }) / BYTES_PER_GB,
    ratio: shape.kvHeads / FULL_KV_HEADS,
  };
}

/** GB with two decimals, or three below 0.1 GB so a small chat does not show as 0.00. */
export function gb(value: number): string {
  return `${value.toFixed(value < 0.1 ? 3 : 2)} GB`;
}

export const kib = (value: number) => `${value.toLocaleString("en-US")} KiB`;

/** A multiplier without a trailing ".0", for example "4" or "6.4". */
export function times(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

const COMPARED = "than 32 KV heads at these settings";

/** The comparison with full multi-head attention in words. */
export function comparison(ratio: number): { value: string; detail: string } {
  const factor = ratio < 1 ? 1 / ratio : ratio;
  if (times(factor) === "1") return { value: "About the same", detail: "as 32 KV heads at these settings" };
  return { value: `${times(factor)} times ${ratio < 1 ? "smaller" : "larger"}`, detail: COMPARED };
}

const INPUT_NAMES: Record<keyof KvShape, string> = {
  layers: "the number of layers",
  kvHeads: "the number of KV heads",
  headSize: "the head size",
  bytesPerValue: "the bytes per value",
};

/** "What changed": names the input that moved and the factor it put on the cache. */
export function describeKvChange(before: SliderValues, after: SliderValues): string {
  const a = kvShape(before);
  const b = kvShape(after);
  const bytesA = kvBytesPerToken(a);
  const bytesB = kvBytesPerToken(b);
  const changed = (Object.keys(INPUT_NAMES) as (keyof KvShape)[]).filter((key) => a[key] !== b[key]);
  if (changed.length === 0) return "Nothing changed: the settings are the same, so the cache per token is the same.";
  const chat = CHAT_TOKENS.toLocaleString("en-US");
  const sizes = `from ${kib(bytesA / BYTES_PER_KIB)} to ${kib(bytesB / BYTES_PER_KIB)} per token, so one ${chat}-token chat goes from ${gb(kvBytesPerChat(a) / BYTES_PER_GB)} to ${gb(kvBytesPerChat(b) / BYTES_PER_GB)}`;
  const factor = bytesB / bytesA;
  if (changed.length > 1) {
    const word = factor > 1 ? `${times(factor)} times larger` : `${times(1 / factor)} times smaller`;
    return `Several settings moved, so the cache is ${word}: ${sizes}.`;
  }
  const key = changed[0];
  const name = INPUT_NAMES[key];
  const effect =
    factor === 2
      ? `doubling ${name} doubles the cache`
      : factor === 0.5
        ? `halving ${name} halves the cache`
        : factor > 1
          ? `multiplying ${name} by ${times(factor)} multiplies the cache by ${times(factor)}`
          : `dividing ${name} by ${times(1 / factor)} divides the cache by ${times(1 / factor)}`;
  const reason = key === "bytesPerValue" ? "Every stored number takes that many bytes." : "The size is a plain product of its parts, so each part scales it directly.";
  return `Going from ${a[key]} to ${b[key]}: ${effect}, ${sizes}. ${reason}`;
}
