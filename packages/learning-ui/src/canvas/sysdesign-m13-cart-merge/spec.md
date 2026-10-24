# Canvas spec: sysdesign-m13-cart-merge

- **Course and chapter:** system-design, 13.6 ("Siblings and application merges"), beat 3, "Try four merge rules on one conflict".
- **Renderer:** custom beat canvas on `BeatFrame`: `SvgRadioChip` for the four rules (a radio group inside the picture), `BeatChoice` (Case 1 | Case 2), `BeatActionButton` (Flip stamps), `DotGrid`, `VerdictBanner`.
- **Claim:** Each simple merge rule has a blind spot: union cannot remove, remove by name cannot add again, last write wins loses one side. Tagged adds (an OR-Set) get both cases right.
- **Model** (`model.ts`): the cart starts as eggs, milk. Case 1: Hana removes milk, Dina adds tea (meant: eggs, tea). Case 2: Hana removes milk, Dina adds milk again (meant: eggs, milk). Stamps: Hana 10, Dina 12; Flip stamps swaps them. Rules: last write wins takes the whole cart with the later stamp; union; remove by name = union minus every name either side removed; tagged adds keep an item if one of its tags is not removed (the model builds the tags).
- **Numbers to check** (tests): case 1: last write wins eggs, milk, tea (flipped: eggs); union eggs, milk, tea; by name eggs, tea; tagged eggs, tea. Case 2: last write wins eggs, milk (flipped: eggs); union eggs, milk; by name eggs; tagged eggs, milk.
- **Verdicts:** "Milk came back"; "Dina's add was lost"; "Both people's intent kept"; "Right only if Dina's stamp is later" (last write wins, right by luck).
- **Picture:** two lanes (Hana, Dina) with the edit, its stamp and the cart each person has; a merge arrow with the rule named; the made cart item by item (a check for right, "back" for an item nobody wants, a dashed "lost" for a missing one) and the cart they meant underneath; one line saying why the rule behaves so.
- **Reduced motion:** the result appears without the dot on the arrow.
- **Accessibility:** rule chips are radio buttons; a polite live region says, for example, "Union, case 1: eggs, milk and tea. Milk came back."
- **Sources:** [S45], [S74], [S43].
