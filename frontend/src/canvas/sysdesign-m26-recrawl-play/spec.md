# Canvas spec: sysdesign-m26-recrawl-play

- **Course and chapter:** system-design, module 26 (web crawler), chapter 26.3 beat 6, "When to visit a page again".
- **Renderer:** custom beat canvas on `BeatFrame`: `SvgRadioChip` for the kind of page and a `SnapStopsRail` for the visit gap, both inside the picture. Pure model in `models/crawl-recrawl.ts`.
- **Claim:** Visiting a page as often as it changes keeps it fresh without wasting fetches. Too often, and most visits find nothing new. Too rarely, and changes pile up unseen. Both depend only on the change rate times the gap.

## Model (c = changes a day, T = gap in days; changes are random events at an average rate c)

| Quantity | Formula |
|---|---|
| Fresh share of time | (1 - e^(-cT)) / (cT) |
| Wasted share of visits | e^(-cT) |
| Visits a page a month | 30 / T |
| Visits a day for 10 million pages | 10,000,000 / T |

Kinds: News front page (c = 6), Product page (c = 1/7), Old article (c = 1/90). Gaps: 1 hour, 4 hours, 12 hours, 1 day, 3 days, 7 days, 14 days, 30 days, 90 days. Defaults: News, 1 day.

## Picture

A strip with the page's changes as ticks (evenly spaced at the average rate, so the picture is deterministic) and DalilBot's visits below at the chosen gap. The strip is as long as eight visits or two and a half changes, whichever is longer, and says its length. A row with more than 48 marks is drawn with 48 and says "more than shown". Two bars: Fresh and Wasted visits, each with its percentage; a readout "Visits a day for 10 million pages". Fresh is good at 50% or more, bad below; wasted is warn above 70%.

## Verdicts (38 characters or fewer, tested)

| Condition | Verdict (tone) |
|---|---|
| wasted above 70% | Most visits find nothing new (warn) |
| fresh below 50% and wasted at most 70% | Stale most of the time (bad) |
| otherwise | Fresh enough, little wasted (good) |

## Numbers to check

The table of fresh and wasted percent for all 27 kind and gap pairs is in the unit test (`tests/unit/canvas/sysdesign-m26-playables.test.ts`). Visits a day for 10 million pages: 240 million, 60 million, 20 million, 10 million, 3.3 million, 1.4 million, 0.71 million, 0.33 million, 0.11 million. Changed from the written spec: 0.71 million is written with two significant figures like the others (the spec had 0.7).

## Accessibility

The kind chips are radio buttons with visible labels; the gap rail is a `role="slider"` with value text such as "News front page, visit every 1 day, fresh 17 percent, wasted 0 percent"; the picture's description repeats it with the verdict. With reduced motion nothing animates; the bars change at once.

## Source

The change model is the usual random-change model for web pages (Cho and Garcia-Molina, ACM TOIT 2003; not in the dossier, flagged in the chapter). The two formulas were derived from it and the table computed with code. Page kinds and rates are course numbers.
