// The course hash (chapter 9.7): FNV-1a over the UTF-16 code units, then a
// murmur-style finishing mix. The same function runs in every module 9
// playable and in the challenge, so the numbers in the chapters match the
// pictures. Pure, no React.

export function hash32(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** The size of the hash space: positions run from 0 up to, but not including, this. */
export const HASH_SPACE = 4294967296;
