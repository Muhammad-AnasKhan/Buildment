# Canvas spec: sysdesign-m15-partition-key-play

- **Course and chapter:** system-design, 15.4 ("Delivery, ordering and partition keys"), beat 5, "Choose a key: order against balance". Playable; new slug.
- **Renderer:** custom beat canvas on `BeatFrame`: four key cards drawn inside the picture with `SvgButton` (a real button each, `aria-pressed`), four partition bars, two badges, `DotGrid`, `VerdictBanner`. `beat-segmented.tsx` was not used because its pills sit outside the picture, and the spec asks for the key cards inside it. No toggle.
- **Claim:** The key decides which events stay in order and how evenly the partitions are loaded. A key that keeps related events together can overload one partition, and a key that spreads well can split related events.
- **Input:** one of four keys (default order id).
- **Model** (`model.ts`): 1,000 events, 4 partitions, from the generator in the spec (mulberry32, seed 15; 50 customers weighted 1/(i+1), 200 orders of 5 events). Partition = fnv(key) mod 4; no key gives a random partition drawn after the data. Largest share = max / 1,000. "Orders in order" is true when every order's events share a partition; "customers in order" likewise.
- **Numbers to check** (tested): order id 250 / 250 / 250 / 250, 25.0%, orders yes, customers no. Customer id 170 / 320 / 325 / 185, 32.5%, yes, yes. Country 900 / 60 / 40 / 0, 90.0%, yes, yes. No key 249 / 264 / 243 / 244, 26.4%, no, no. Customer c0 holds 200 events, c1 155, c2 60; PS 900, EG 60, JO 40.
- **Picture:** four vertical bars with a dashed line at 25%; the hottest bar turns amber above 30% and red above 50%; each bar has its count above and its name and share below; small dots fall into each bar (more into the fuller ones). Two badges under the key cards: orders in order and customers in order (a check or a cross, with words). A "no" for customers is grey, because it is not always a fault.
- **Verdicts:** "Even load, one order stays in order" (good), "Hot partition: 33% of all events" (warn), "One partition holds 90% of events" (bad), "Even load, but no order at all" (bad). The percentages are filled in from the numbers.
- **Reduced motion:** the bars are drawn at their final height and no dots fall.
- **Accessibility:** each bar has a text label with its count; the key cards are buttons with `aria-pressed`; the SVG description spells out all four counts, the largest share and both badges.
- **Sources:** Kafka keys and partitions [S81]; hash partitioning and hot keys, chapters 9.2 and 9.4. The data set is a course example.
