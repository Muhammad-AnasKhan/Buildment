# Canvas spec: sysdesign-m23-tiny-index

- **Course and chapter:** system-design, module 23, chapter 23.2 beat 2, "Build an index from three documents".
- **Renderer:** custom beat canvas on `BeatFrame` with `primitives/use-stepper.ts` (Back and Next under the picture, four step chips on top, as in `design-stepper.tsx`), `SvgButton` for the tappable word cards, `VerdictBanner`. Pure model in `models/tiny-index.ts`.
- **Claim:** A search index is a table flipped: from "product to words" into "word to products". A query reads the lists of its words, and a rare word makes a short list.

## Steps

1. Products: three wide cards, "Red running shoes", "Blue running shorts", "Red waterproof hiking shoes". Caption: "Three products, in plain text".
2. Words: each product card shrinks and its words appear as beads on a string (lower case, split on non-letters, a trailing s stripped from words longer than 3 letters; the stripped s is drawn struck through: shoe with a struck s, short with a struck s). Caption: "Words are cleaned and split".
3. Flip: seven word cards appear one after another, each with its list of product numbers as small numbered dots, and a curve from the word to each product that holds it. Caption: "Now each word lists its products". Words are in alphabetical order, as in the chapter's output: blue [2], hiking [3], red [1, 3], running [1, 2], shoe [1, 3], short [2], waterproof [3].
4. Ask: the seven word cards become toggles (tap to add or remove a query word; default red + shoe). A chosen word lights its card, its list and its curves, and small dots travel from the word to its products (ambient). Products in every chosen list get a green ring (AND). A bar under each product is its score, one piece for each chosen word it contains, a rare word making a longer piece, with the total beside it ("no match" when it holds none).

Deviation from the first spec: the query-word chips are the word cards themselves (one row of seven 44 unit tall toggles), instead of a separate chip row. This keeps the picture at 372 units tall and teaches "tap the word's list" directly.

## Formulas

- Weight of a word = ln(3 / number of products that contain it): red, shoe, running 0.405; blue, short, waterproof, hiking 1.099.
- Score of a product = sum of the weights of the chosen words it contains.
- AND = products in every chosen list; nothing is lit when no word is chosen.

## Numbers checked (tested)

| Query | AND | Ranked (score) |
|---|---|---|
| red | 1, 3 | 1: 0.405, 3: 0.405 |
| red + shoe | 1, 3 | 1: 0.811, 3: 0.811 |
| red + waterproof + shoe | 3 | 3: 1.910, 1: 0.811 |
| blue + red | none | 2: 1.099, 1: 0.405, 3: 0.405 |
| running + shoe | 1 | 1: 0.811, 2: 0.405, 3: 0.405 |
| hiking | 3 | 3: 1.099 |
| waterproof + hiking | 3 | 3: 2.197 |
| running | 1, 2 | 1: 0.405, 2: 0.405 |

## Verdicts (38 characters or fewer, tested for all 128 queries)

Step 4: "Found: product 3 matches every word" (one product, the digit is its number; good), "2 products have every word" (good), "No product has every word" (warn), "Tap words to ask a question" (accent). Steps 1 to 3 show the captions above.

## Accessibility

- Each word card is a toggle button (`role="button"`, `aria-pressed`) with a label such as "waterproof, in 1 product, adds 1.10". A visually hidden `aria-live` region reads the query, the products in every list and the ranked scores. Back, Next and the step chips are real buttons; Left, Right, Home and End move the step.
- Reduced motion: the steps appear without fades and no dots travel; step 4 shows the default query result.
- Colour sits next to words: the chosen cards also carry a check mark, the AND ring comes with the banner text.

## Limits shown to the learner

Three tiny made-up products; every word appears once in each product, so only rarity changes the score; real engines compress lists and also use how often a word repeats and how long the text is.

## Sources

Lucene term dictionary and posting lists [S100]; the tokenizer and index code of chapter 23.2.
