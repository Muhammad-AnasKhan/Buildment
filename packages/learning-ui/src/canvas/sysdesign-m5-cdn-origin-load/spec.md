# Canvas spec: sysdesign-m5-cdn-origin-load

- **Course and chapter:** system-design, 5.7 "CDN and edge", beat "Predict the origin's load". Model `models/cdn-origin.ts`; two rails drawn with `SliderRail`, with `SliderZone` controls on top; shield toggle outside the picture.
- **Claim:** A longer edge lifetime cuts origin load and raises staleness; a shield collapses many edges' misses into one per lifetime without much more staleness.
- **Model:** E = 20 edges, r requests a second per edge, T seconds lifetime (RFC 9111, S22). Miss rate per edge = 1 / (1 + r T); origin without shield = E r / (1 + r T); with shield, the shield sees a = E r / (1 + r T) and the origin gets a / (1 + a T). Oldest page about T, or about 2 T with a shield. Derived for the course.
- **Inputs:** T from 1 s to 3,600 s (log rail, snaps 10, 60, 300, 3,600); r from 0.1 to 100 a second (log rail, snaps 1, 5, 50); shield toggle. Defaults 60, 5, off. Arrow keys step a ladder.
- **Picture:** three of the 20 edges (Edge 1, Edge 2, Edge 20), the Shopper, an optional Shield and the Origin as `SvgNode` cards. Fetch dots travel from the edges to the origin (or the shield, then the origin) at a rate that follows the computed fetches, squeezed so a trickle still shows. Live numbers: hit rate on each edge card, requests a minute on the Origin card, oldest page on the Shopper card.
- **Numbers to check:** T 60, r 5: hit 99.7%, origin about 20 a minute; with shield about 1 a minute and oldest page 2 min. T 10, r 5: hit 98.0%, about 118 a minute; with shield about 5.7.
- **Verdicts:** shield on and T over 300 s "Fewer fetches, older pages"; origin under 5 a minute "Origin barely notices the traffic"; 5 to 60 "About one fetch per edge per TTL"; over 60 "Short lifetime: origin works hard".
