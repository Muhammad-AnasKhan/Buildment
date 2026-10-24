# Canvas spec: sysdesign-m13-crdt-play

- **Course and chapter:** system-design, 13.7 ("CRDTs"), beat 5, "Merge in any order, three set types".
- **Renderer:** custom beat canvas on `BeatFrame`: `SvgButton` replica cards, `BeatSegmented` (Plain set | By name | OR-Set), `BeatActionButton` (Reset), `DotGrid`, `VerdictBanner`.
- **Claim:** Merge functions that are commutative, associative and idempotent make every merge order end in the same state. Converging does not mean being right: only the OR-Set ends in the cart the people meant (eggs, rice).
- **Model** (`model.ts`): replicas A, B, C start with milk, rice. A removes both, B adds rice again, C adds eggs. Plain set: names, a remove deletes the name, merge = union. By name: names plus removed names (a removed name stays removed), merge = union of both. OR-Set: tagged adds (milk s:1, rice s:2, rice B:1, eggs C:1) and removed tags, merge = union of both; an item shows if it has a tag that is not removed. A tap on X then Y merges X into Y.
- **Numbers to check** (tests): after merging all three, in any of the 6 orders: plain eggs, milk, rice; by name eggs; OR-Set eggs, rice. Merge is commutative, associative and idempotent.
- **Verdicts:** "Replicas still differ: keep merging"; "All agree, but milk came back"; "All agree, but rice was lost"; "All agree: eggs and rice. Correct."
- **Picture:** three replica cards listing their state (OR-Set tags as rows, removed ones struck through and marked "gone"), the cart each shows, an accent arrow from the last source to the last target with a dot flying along it, a merges counter and what people meant. Switching type resets.
- **Reduced motion:** no flying dot; the target card updates at once.
- **Accessibility:** cards are buttons ("Replica B, merge A into B" once a source is picked); arrow keys move between replicas, Enter selects; the verdict is in a polite live region.
- **Sources:** [S74], [S75].
