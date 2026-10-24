# Canvas spec: sysdesign-m26-design-stepper

- **Course and chapter:** system-design, module 26 (web crawler), chapter 26.2 beat 3, "Step through the design at peak".
- **Renderer:** custom canvas on the house design stepper (`primitives/design-stepper.tsx`, `DesignPicture`) with data from `models/crawl-design.ts` (a `DesignSpec`). The canvas adds the shard choice in step 4 (three chips drawn in the picture with real buttons laid over them), as `sysdesign-m20-design-stepper` does for partitions.
- **Claim:** The numbers decide the blocks. A fetcher that waits for each page is hundreds of times too slow; many downloads in flight make a small fleet; a DNS cache trims it; the frontier and the seen check are split by host so each shard holds a share of the memory and the work.

## Model (target: 2 billion pages a month = 771.6 pages a second)

| Step | Working | Result |
|---|---|---|
| 1. One fetcher | 1 / 0.5 s | 2 pages/s, 386 times too slow |
| 2. Many in flight | 100 / 0.5 s = 200 at most, planned at half = 100; 771.6 / 100 | 8 machines |
| 3. DNS cache | fetch 0.4 s; 100 / 0.4 = 250, planned at half = 125; 771.6 / 125 | 7 machines |
| 4. Shards (k = 4, 8, 16) | 24 GB Bloom filter and 38,580 link checks a second, divided by k | 6 GB and 9,645; 3 GB and 4,823; 1.5 GB and 2,411 |
| 5. Storage | 771.6 x 25 KB compressed | 19.3 MB/s written, 50 TB a month |

## Inputs

Back and Next under the picture, or tap a step chip. In step 4 only: 4, 8 or 16 shards (default 8), three chips inside the picture.

## Picture

Top row: Frontier, Fetchers, Web. Second row: Storage (step 5), DNS cache (step 3), DNS lookup (from step 2). Pills: "2 pages/s", "8 machines", "7 machines" on the fetcher card; "6 GB each" and a chip "N checks/s" on the frontier card; "50 TB/month" on storage. Requests run as dots; in step 3 the lookup dots turn back at the cache instead of going on to the resolver. With reduced motion the dots are not drawn and every pill is already shown.

The written spec drew the frontier as "Frontier shards (x k)" with a pill on each shard. This picture shows one Frontier card labelled "Frontier x8" with one pill for the memory each shard holds and one chip for the checks each answers, which says the same thing without 16 tiny cards.

## Verdicts (38 characters or fewer, tested)

| Step | Verdict (tone) |
|---|---|
| 1 | One fetcher: 386 times too slow (bad) |
| 2 | 8 machines carry 772 pages a second (good) |
| 3 | DNS cache: 7 machines, fewer lookups (good) |
| 4, k = 4 | 4 shards: 6 GB and 9,600 checks each (warn) |
| 4, k = 8 | 8 shards: 3 GB and 4,800 checks each (good) |
| 4, k = 16 | 16 shards: 1.5 GB and 2,400 each (good) |
| 5 | Pages to object storage: 50 TB/month (good) |

The k = 16 verdict says nothing about the cost of more nodes; the chapter fold does.

## Accessibility

Step chips and shard chips are real buttons with visible labels; each shard chip's label includes the memory and checks. The picture is read out as text (`describeDesignFrame`) and the step's sentence is an `aria-live` region.
