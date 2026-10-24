# Canvas spec: sysdesign-m26-bloom-play

- **Course and chapter:** system-design, module 26 (web crawler), chapter 26.4 beat 2, "Drag the error, watch the memory". A predict ("20 billion URLs: how much memory does a 1% Bloom filter need?") sits right before it.
- **Renderer:** custom beat canvas on `BeatFrame`, built on `primitives/estimate-chain.tsx` with a footer of three bars. Pure model in `models/crawl-bloom.ts`, which reuses `hashCount` and `withCommas` from `models/bloom.ts` (the chapter 7.3 filter counts memory per key; this one counts the whole crawl and compares with exact fingerprints).
- **Claim:** A Bloom filter holds the seen set in a small fraction of the memory of exact fingerprints, at the price of a small share of new URLs wrongly skipped. Each 10 times lower error costs about 4.8 more bits per URL.

## Model (S113)

| Quantity | Formula |
|---|---|
| Bits per URL | -ln(p) / (ln 2)^2 |
| Hash functions | round(bits per URL x ln 2) |
| Bloom filter memory (GB) | URLs x bits per URL / 8 / 1e9 |
| Exact fingerprints (GB) | URLs x 8 / 1e9 |
| URL strings (GB) | URLs x 100 / 1e9 |
| New URLs wrongly skipped per billion | p x 1e9 |

Default (the chapter): 20 billion URLs, 1% gives 9.6 bits, 7 hashes, 24 GB against 160 GB and 2 TB, 10 million skipped per billion.

## Inputs

- URLs known: 1, 5, 20, 50, 100 billion (default 20 billion). The blue card on the left.
- Error rate: 10%, 1%, 0.1%, 0.01% (default 1%). The blue card on the right.
- Tap a blue card, then drag it sideways, use the arrow keys, Home and End, or use the one slider under the picture.
- Fixed: exact fingerprint 8 bytes, average URL 100 bytes.

## Picture

A chain: error rate to bits per URL to hash functions; URLs known and bits per URL to Bloom filter memory. Below it, three bars on one linear scale whose full length is the URL strings; the Bloom bar is ringed (its tone follows the verdict). The Bloom bar is thin on purpose (a minimum of 3 units keeps it visible); the numbers are exact. A line under the bars gives the new URLs wrongly skipped per billion. Changed from the written spec: URL strings under 1 TB are written in GB ("100 GB", not "0.1 TB").

## Verdicts (B = Bloom memory, E = exact memory; one decimal under 10 GB, none above; 38 characters or fewer, tested)

| Error | Verdict (tone) |
|---|---|
| 10% | Small, but 1 in 10 new URLs lost (warn) |
| 1% | Bloom: B instead of E (good) |
| 0.1% | B, only 1 in 1,000 URLs lost (good) |
| 0.01% | B, 1 in 10,000 URLs lost (good) |

## Accessibility

Each input card is a `role="slider"` with value text such as "20 billion URLs, 1 percent error, 24 gigabytes for a Bloom filter against 160 for exact fingerprints". With reduced motion the dots do not flow; the bars and numbers update at once.

## Sources

S113 for the formulas; chapter 7.3 for the small filter; the measured run in the chapter 26.4 fold (10.10%, 1.01% and 0.096% on 1 million URLs against targets of 10%, 1% and 0.1%).
