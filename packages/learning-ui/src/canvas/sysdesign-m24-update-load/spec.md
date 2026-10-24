# Canvas spec: sysdesign-m24-update-load

- **Course and chapter:** system-design, module 24 (geospatial search and ride matching), chapter 24.3 beat 3, "Move the dials, see the load".
- **Renderer:** custom beat canvas on `BeatFrame`. Parts reused: `SvgNode` (the drivers card), `SnapStopsRail` (two rails), `RadioChipRow` (the store switch), `flowDots` (the lane). Pure model in `models/safar-update-load.ts`. The shared `traffic-playground.tsx` was not used: it draws a server queue and a curve inset, and this picture needs a block of node icons instead.
- **Claim:** The same stream of location reports needs about 100 disk database nodes or about 5 memory nodes. Halving the gap between reports doubles the load.

## Model

| Quantity | Formula |
|---|---|
| Reports a second | drivers / seconds between reports |
| Disk nodes | ceil(reports / 2,500) |
| Memory nodes | ceil(reports / 50,000) |

2,500 writes a second is the course number for a database node (chapter 20.2); 50,000 updates a second for a memory node is illustrative.

## Inputs

- Drivers online: 100K, 250K, 500K, 1M, 2M (default 1M). A snap rail inside the picture.
- Seconds between reports: 1, 2, 4, 8, 15 (default 4). A snap rail inside the picture.
- Store: Disk database or Memory map (default Disk database). Radio chips inside the picture.
- No control outside the picture.

## Picture

A drivers card on the left (status shows the reports a second) sends dots along a lane into a store block on the right. The dots flow at a rate that grows with the log of the reports. The block shows the store name, the node count in the verdict colour, and up to 20 node icons (disk nodes are drawn with two bars, memory nodes with a chip), then `+ n more` for the rest. New icons fade in when the count grows.

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| disk and 10 or more nodes | `<n> disk nodes for old data` (bad); the number follows the model |
| disk and fewer than 10 nodes | Disk handles it, at a high price (warn) |
| memory and 10 or fewer nodes | Memory: `<n>` nodes carry it (good); `Memory: 1 node carries it` for one |
| memory and more than 10 nodes | Even memory needs `<n>` nodes (warn) |

All verdicts are 38 characters or fewer (tested across every input combination).

## Numbers to check

| Drivers | Gap (s) | Reports /s | Disk nodes | Memory nodes |
|---|---|---|---|---|
| 100K | 4 | 25,000 | 10 | 1 |
| 250K | 4 | 62,500 | 25 | 2 |
| 500K | 4 | 125,000 | 50 | 3 |
| 1M | 4 | 250,000 | 100 | 5 |
| 1M | 1 | 1,000,000 | 400 | 20 |
| 1M | 2 | 500,000 | 200 | 10 |
| 1M | 8 | 125,000 | 50 | 3 |
| 1M | 15 | 66,667 | 27 | 2 |
| 2M | 4 | 500,000 | 200 | 10 |

All nine rows are unit tests (`tests/unit/canvas/sysdesign-m24-models.test.ts`).

## Reduced motion and accessibility

- Reduced motion: dots are static (four spread along the lane); the node count and icons update; icons do not fade.
- Both rails are `role="slider"` with value text such as "1,000,000 drivers, a report every 4 seconds: 250,000 reports a second, 100 nodes on disk database". The store chips are a radio group. The node count is also live text (a polite region).
- Colour sits next to words (verdict banner, node count).

## Limits

No replicas, failures or search load; node capacities are course numbers.

## Sources

Arithmetic on course assumptions. No external source.
