# Canvas spec: sysdesign-m16-split-or-not

- **Course and chapter:** system-design, 16.2 beat 5, "Weigh team, releases and clarity". Playable; new slug.
- **Renderer:** custom beat canvas on `BeatFrame`: three `SvgNode` cards (Monolith, Modular, Services), a points strip, and one `SnapStopsRail` plus point bar per factor. No toggle.
- **Claim:** Whether to split depends on three things that can be weighed: how many people must coordinate, how often releases wait for other teams, and how stable the boundaries are. A big team with many collisions and stable walls has a reason to split the parts that hurt; a small team with unclear walls does not.
- **Input:** team size on a snap rail 3, 8, 15, 30, 60, 120 (default 15); releases that waited last month 0, 1, 3, 6, 10 (default 3); boundary clarity New idea, Mostly clear, Stable for a year (default Mostly clear). Arrow keys step along the snap points.
- **Model** (`model.ts`, `weigh`): team points 0 for 8 or fewer, 1 for 15, 2 for 30, 3 for 60 or more; collision points 0 for 0 or 1, 1 for 3, 2 for 6, 3 for 10; clarity points 0, 1, 2. Total 0 to 8: 0 or 1 monolith, 2 to 4 modular monolith, 5 or more split the parts that hurt. New idea with 5 or more points is capped at modular monolith. A course rule of thumb, not a law.
- **Numbers to check** (tested): (3, 0, new) 0 points monolith; (8, 1, mostly) 1; (15, 3, mostly) 3 modular (Tawseel); (15, 3, stable) 4; (3, 0, stable) 2 modular; (30, 6, mostly) 5 split; (60, 6, stable) 7 split; (120, 10, new) 6 capped to modular; (120, 10, stable) 8 split.
- **Picture:** the recommended card is ringed and filled, the others are dimmed. A strip of eight cells fills to the total, with the zones monolith, modular, split. Each factor has its words, a point bar and its own rail.
- **Verdicts:** "Stay one monolith" (good), "Modular monolith, hard walls" (accent), "Split the parts that hurt" (accent), "Walls unclear: stay modular" (warn).
- **Reduced motion:** the ring and the bars change without a transition.
- **Accessibility:** each rail is a `role="slider"` with value text such as "team size 15 people, 1 point"; the verdict is repeated in an `aria-live` region.
- **Sources:** Fowler, "Monolith First" [S36] is the only anchor; the points are a course rule of thumb.
- **Layout note:** the cards are labelled Monolith, Modular and Services (a card label has room for about 10 characters); the verdict banner carries the full names.
