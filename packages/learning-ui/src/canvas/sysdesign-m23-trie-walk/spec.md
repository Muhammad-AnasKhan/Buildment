# Canvas spec: sysdesign-m23-trie-walk

- **Course and chapter:** system-design, module 23, chapter 23.3 beat 3, "Keep the best three at every node". The signature playable of the module.
- **Renderer:** custom beat canvas on `BeatFrame`; letter keys are `SvgButton`s (46 by 44 units), the path is drawn as circles, `VerdictBanner` on top, one control outside the picture (Reset). Pure model in `models/trie-walk.ts`.
- **Claim:** If every node of a trie stores its best three queries ahead of time, a suggestion costs one step per letter typed and reads nothing below the node.

## Data and model

Nine made-up queries with counts: shoes 9200, shirt 7000, watch 5200, shorts 4100, shoes red 3100, sheets 2600, shower curtain 1800, shoulder bag 1500, shoelaces 900. The trie is built with the chapter's code (each query offered to every node on its path, a node keeps the best 3): 50 nodes for 71 characters. The typed text walks from the root one letter at a time; the answer is the list stored on the node reached. A letter with no child makes the answer empty and the walk stops there. The root stores nothing, as in the chapter code.

## Picture (top to bottom)

1. Search box with the typed text (up to 14 characters).
2. The path: a root node ("start") and one circle for each letter walked, joined by lines. The node reached is solid blue and ringed (the ring breathes a little while on screen). If a letter has no child, a dashed amber node shows that letter and a line says the walk stops.
3. The next letters: under the current node, dimmed dashed circles joined by dashed lines, one for each child. A node at the end of a query says so.
4. A card "Best 3 stored on node" with the prefix, up to three rows (rank, query, a count bar, the count), and a footer: "Steps: n letters" and "Queries read below the node: 0".
5. Keys in two rows of seven: s h o e r w a t i u c l, space (drawn as an open box), backspace. Keys that lead on from the current node are tinted blue; any key can be tapped, and a letter with no child leads to the empty answer. After a dead end the backspace key is tinted.

Reset is the only control outside the picture. Reduced motion: new nodes and rows appear without fades and the ring does not breathe; the final node is shown.

## Numbers checked (tested against the chapter code for every prefix of every query, and against a filter of the list)

| Typed | Answer (count) |
|---|---|
| s, sh | shoes 9200, shirt 7000, shorts 4100 |
| she | sheets 2600 |
| shi | shirt 7000 |
| sho | shoes 9200, shorts 4100, shoes red 3100 |
| shoe | shoes 9200, shoes red 3100, shoelaces 900 |
| shoes | shoes 9200, shoes red 3100 |
| shoes + space | shoes red 3100 |
| shor | shorts 4100 |
| show | shower curtain 1800 |
| shou | shoulder bag 1500 |
| w, wa | watch 5200 |
| x | none |

## Verdicts (38 characters or fewer)

"Type a letter to walk down" (empty box; accent), "Answer read from 1 node" (non-empty answer; good), "No query starts with this" (empty answer after letters; warn).

## Accessibility

- Each key is a button ("Type s, leads on from this node", "Type space", "Backspace, remove the last letter"). A visually hidden `aria-live` region reads the typed text, the steps, "read below the node: 0" and the answers. The picture's group label carries the same sentence.
- Colour sits next to words and shapes: lit keys are also written as children under the node; the dead end has a dashed amber node and a sentence.

## Limits shown to the learner

Nine queries; k is 3 so the picture fits a phone (Dalil shows up to ten); counts are made up and frozen, whereas a real trie is rebuilt from counts every few minutes. The keys cover the letters s h o e r w a t i u c l and the space only, so a few queries (shower curtain, shoulder bag) cannot be typed to the very end.

## Sources

Course design; the code and output are in chapter 23.3.
