import { hashCount, withCommas } from "./bloom";
import { flowRate } from "./envelope-estimate";

// 26.4 "Drag the error, watch the memory". The Bloom filter for DalilBot's
// seen set, sized from the formulas in [S113]. Pure functions, no React.
// (models/bloom.ts is chapter 7.3's small filter, counted per key; this file
// counts the whole crawl and compares with exact fingerprints.)
//
//   bits per URL    = -ln(p) / (ln 2)^2
//   hash functions  = round(bits per URL x ln 2)
//   Bloom (GB)      = URLs x bits per URL / 8 / 1e9
//   exact (GB)      = URLs x 8 bytes / 1e9
//   URL strings (GB)= URLs x 100 bytes / 1e9
//   skipped / 1e9   = p x 1e9 new URLs wrongly seen as old

export const URL_STEPS = [1e9, 5e9, 20e9, 50e9, 100e9] as const;
export const ERROR_STEPS = [0.1, 0.01, 0.001, 0.0001] as const;
export const URLS_DEFAULT = 20e9;
export const ERROR_DEFAULT = 0.01;
export const FINGERPRINT_BYTES = 8;
export const URL_BYTES = 100;

export type BloomPlan = {
  urls: number;
  error: number;
  bitsPerUrl: number;
  hashes: number;
  bloomGb: number;
  exactGb: number;
  stringsGb: number;
  skippedPerBillion: number;
};

export function bloomPlan(urls: number, error: number): BloomPlan {
  const bitsPerUrl = -Math.log(error) / Math.LN2 ** 2;
  return {
    urls,
    error,
    bitsPerUrl,
    hashes: hashCount(bitsPerUrl),
    bloomGb: (urls * bitsPerUrl) / 8 / 1e9,
    exactGb: (urls * FINGERPRINT_BYTES) / 1e9,
    stringsGb: (urls * URL_BYTES) / 1e9,
    skippedPerBillion: error * 1e9,
  };
}

/** "9.6 bits". */
export const bitsText = (b: number) => `${Number(b.toFixed(1))} bits`;
export const hashesText = (k: number) => `${k} ${k === 1 ? "hash" : "hashes"}`;

/** Memory with one decimal under 10 GB and none above: "1.2 GB", "24 GB", "240 GB". */
export function gbText(gb: number): string {
  if (gb < 10) return `${Number(gb.toFixed(1))} GB`;
  return `${withCommas(gb)} GB`;
}

/** Sizes for the bars: GB below 1,000, else TB. */
export function sizeText(gb: number): string {
  if (gb >= 1000) return `${Number((gb / 1000).toPrecision(3))} TB`;
  return gbText(gb);
}

/** "10%", "1%", "0.1%", "0.01%". */
export const errorText = (p: number) => `${Number((p * 100).toPrecision(2))}%`;

/** "10 million", "100,000" new URLs wrongly skipped in a billion. */
export function skippedText(n: number): string {
  return n >= 1e6 ? `${withCommas(n / 1e6)} million` : withCommas(n);
}

export type Verdict = { text: string; tone: "good" | "warn" };

/** At most 38 characters. */
export function bloomVerdict(p: BloomPlan): Verdict {
  const b = gbText(p.bloomGb);
  if (p.error >= 0.1) return { text: "Small, but 1 in 10 new URLs lost", tone: "warn" };
  if (p.error >= 0.01) return { text: `Bloom: ${b} instead of ${gbText(p.exactGb)}`, tone: "good" };
  if (p.error >= 0.001) return { text: `${b}, only 1 in 1,000 URLs lost`, tone: "good" };
  return { text: `${b}, 1 in 10,000 URLs lost`, tone: "good" };
}

export function bloomTail(p: BloomPlan): string {
  const words = (gb: number) => sizeText(gb).replace(" GB", " gigabytes").replace(" TB", " terabytes");
  return `${p.urls / 1e9} billion URLs, ${Number((p.error * 100).toPrecision(2))} percent error, ${words(p.bloomGb)} for a Bloom filter against ${words(p.exactGb).replace(" gigabytes", "")} for exact fingerprints`;
}

/** Dots a second on the links of the chain. */
export function bloomRates(p: BloomPlan) {
  return {
    bits: flowRate(p.bitsPerUrl / 10),
    hashes: flowRate(p.hashes / 7),
    memory: flowRate(p.bloomGb / 24),
    urls: flowRate(p.urls / 20e9),
  };
}

/** Bar lengths, 0 to 1, on one linear scale whose full length is the URL strings. */
export function barShares(p: BloomPlan) {
  const full = p.stringsGb;
  return { bloom: p.bloomGb / full, exact: p.exactGb / full, strings: 1 };
}
