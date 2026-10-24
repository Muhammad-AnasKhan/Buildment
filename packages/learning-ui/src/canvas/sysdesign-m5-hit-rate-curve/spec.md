# Canvas spec: sysdesign-m5-hit-rate-curve

- **Course and chapter:** system-design, 5.4 "Eviction and hit rate", beat "Drag the size, watch the hits". Model `models/hit-rate.ts`; zones from `primitives/slider-zone.tsx`; the skew rail is `SliderRail` from `primitives/picture-slider.tsx`.
- **Claim:** With skewed traffic a small cache catches most reads and each extra slot helps less; with even traffic the hit rate equals the share cached.
- **Model:** N = 10,000 products; the cache holds the top k. Hit rate = H_s(k) / H_s(N), H_s(n) = sum of 1 / i^s for i = 1..n. s = 0 gives k / N. The Zipf shape is an assumption (source needed in the chapter); LRU and LFU only approximate the top k (S27).
- **Inputs:** cache size k, 10 to 10,000 on a log axis (drag along the plot; arrow keys step a ladder of about 10 sizes a decade; snaps 100, 1,000, 2,000); skew s, 0 to 1.2, step 0.1, snaps 0, 0.8, 1.0.
- **Picture:** the curve with a dot that rides it, a dashed even-traffic reference (k / N, which bends on a log axis), a live label placed clear of the curves ("1,000 items: 76.5% of reads"), and a strip of reads above the plot that drifts right, green for a hit and amber for a miss, in the hit rate's proportion.
- **Numbers to check:** s = 1: k = 100 53.0%, 1,000 76.5%, 2,000 83.6%, 5,000 92.9%; s = 0.8, k = 1,000 57.1%; s = 1.2, k = 1,000 90.3%; s = 0, k = 1,000 10.0%.
- **Verdicts:** s = 0 "Even traffic: hits = share cached"; otherwise doubling k gains under 5 points "Past here, more memory buys little"; else "Each extra slot still helps". The s = 0 rule is checked first, because with even traffic each slot adds the same and the doubling gain is not a sign of diminishing returns.
- **Note:** with s = 1 doubling always gains about 7 points until the cache nears the whole catalogue, so the under-5 verdict shows at high skew (1.1 and 1.2) or near 100 percent.
