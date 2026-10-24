# Canvas spec: sysdesign-m25-post-entries

- **Course and chapter:** system-design, module 25, chapter 25.3 beat 3, "Post a sale, then break the books".
- **Renderer:** custom beat canvas on `BeatFrame` with entry cards as real toggle buttons drawn in the picture, `DotGrid`, `VerdictBanner` and `BeatChoice` for the Sale / Refund step (the only control outside the picture). Pure model in `models/ledger-entries.ts`.
- **Claim:** A sale is one transaction of three entries whose debits and credits are equal. Take an entry out and the books are off by exactly its amount. A refund is not an edit: it adds three reversing entries, so the history keeps six.

## Model

- Sale: Debit provider-clearing 100, Credit organizer-payable 90, Credit fee-revenue 10.
- Refund: Credit provider-clearing 100, Debit organizer-payable 90, Debit fee-revenue 10.
- Debits = sum of the included debit cards. Credits = sum of the included credit cards. Off by = |debits - credits|. Balanced when debits equal credits and at least one card is in.
- Account balance = debits minus credits for that account over the included cards on screen.
- The Sale step counts the three sale cards only. The Refund step counts all six, and the inclusion of each card is remembered when the step changes.

## Inputs

- Tap a card (or press Enter or Space) to take it out of the books or put it back. All cards start in.
- The Sale / Refund step control switches to the refund, which shows three more cards.

## Picture

Left: the entries as a stack of cards (side pill, account, amount). An included card is solid; an excluded card is dashed, grey and says "missing" where the amount was. Before the refund step the three refund cards wait, faint and not tappable, under the sale. Right: two bars, Debits and Credits, with their totals underneath and a beam between the bar tops that is level when the books balance (green) and tilted when they do not (red). Under them, the three account balances as pills, and a count of entries. Balances that net to zero turn green.

## Numbers (checked in the unit tests)

| Entries in (sale) | Debits | Credits | Verdict |
|---|---|---|---|
| Dr 100 + Cr 90 + Cr 10 | 100 | 100 | Balanced: debits equal credits |
| Cr 90 + Cr 10 | 0 | 100 | Off by 100: a debit is missing |
| Dr 100 + Cr 10 | 100 | 10 | Off by 90: a credit is missing |
| Cr 10 | 0 | 10 | Off by 10: a debit is missing |
| Dr 100 + Cr 90 | 100 | 90 | Off by 10: a credit is missing |
| Cr 90 | 0 | 90 | Off by 90: a debit is missing |
| Dr 100 | 100 | 0 | Off by 100: a credit is missing |
| none | 0 | 0 | Nothing posted yet |

Sale plus refund, all six in: debits 200, credits 200, all three balances 0, verdict "Refunded: 6 entries, balances 0" (31 characters). With any card out, the off-by rule applies to the six cards together.

**Correction to the module spec:** `playable-specs/m25.md` says the six entries total 190 on each side. The sale debits 100 and the refund debits 90 + 10, so each side totals 200 (sale 100 + refund 100). The picture and the tests use 200.

## Verdicts

Balanced: debits equal credits (good). Off by N: a credit is missing, or a debit is missing (bad). Nothing posted yet (accent). Refunded: 6 entries, balances 0 (good). All 38 characters or fewer, tested for every subset of the six entries in both steps.

## Accessibility

Each card is a toggle button (`role="button"`, `aria-pressed`) named like "Debit provider-clearing 100, included" or "..., missing". The SVG description reads out the verdict, totals, count and balances. Colour is never the only signal: a missing card says "missing", the verdict is words. Reduced motion: the picture has no animation (the beam is redrawn at once).

## Sources

Course convention (a balance is debits minus credits). The accounting convention itself is a `source needed` note in chapter 25.3.
