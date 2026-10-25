// Flip deck as a pure model: each card shows a claim on its front. The
// learner commits to a verdict first ("the data supports it", "partly",
// "it does not"), then the card flips to show what the evidence says and
// where it comes from. Predict, then reveal, for a whole deck. No React here.

export type FlipVerdict = {
  id: string;
  /** Button label, at most about 16 characters ("Data supports it"). */
  label: string;
};

export type FlipCard = {
  id: string;
  /** The claim on the front, at most about 90 characters. */
  front: string;
  /** The verdict id the evidence supports. */
  answer: string;
  /** What the evidence says, at most about 170 characters, plain English. */
  back: string;
  /** Short source line, at most about 44 characters ("US BLS, checked 2026-10-25"). */
  source: string;
};

export type FlipDeckConfig = {
  /** Two or three verdicts. */
  verdicts: FlipVerdict[];
  /** Four to eight cards. */
  cards: FlipCard[];
  /** Small label on the card front ("Claim you may hear"). */
  deckLabel: string;
  /** Banner before the first answer, at most 38 characters. */
  prompt: string;
  /** The one line under the picture telling the learner what to do. */
  hint: string;
  /** Shown after the last card, at most about 120 characters. */
  endNote: string;
};

export type FlipState = {
  /** Index of the current card; equals cards.length when the deck is done. */
  index: number;
  /** The verdict the learner chose for the current card, or null before choosing. */
  chosen: string | null;
  /** Card ids answered as the evidence says, on the first choice. */
  matched: string[];
};

export function startFlip(): FlipState {
  return { index: 0, chosen: null, matched: [] };
}

/** Choose a verdict for the current card. Ignored once a verdict is chosen or the deck is done. */
export function chooseVerdict(state: FlipState, cards: FlipCard[], verdict: string): FlipState {
  const card = cards[state.index];
  if (!card || state.chosen !== null) return state;
  const matched = verdict === card.answer && !state.matched.includes(card.id) ? [...state.matched, card.id] : state.matched;
  return { ...state, chosen: verdict, matched };
}

/** Move to the next card after the current one is flipped. */
export function nextCard(state: FlipState, cards: FlipCard[]): FlipState {
  if (state.chosen === null || state.index >= cards.length) return state;
  return { ...state, index: state.index + 1, chosen: null };
}

export function isFlipDone(state: FlipState, cards: FlipCard[]): boolean {
  return state.index >= cards.length;
}

/** Problems with the data: unknown answer ids, duplicate ids, empty text, text over the limits. Empty when fine. */
export function checkFlipDeck(config: FlipDeckConfig): string[] {
  const problems: string[] = [];
  const text = (value: string, what: string, max: number) => {
    if (!value.trim()) problems.push(`${what}: empty`);
    else if (value.length > max) problems.push(`${what}: ${value.length} characters, at most ${max}`);
  };
  const { verdicts, cards } = config;
  if (verdicts.length < 2 || verdicts.length > 3) problems.push(`${verdicts.length} verdicts, need 2 or 3`);
  if (cards.length < 4 || cards.length > 8) problems.push(`${cards.length} cards, need 4 to 8`);
  const verdictIds = new Set<string>();
  for (const v of verdicts) {
    if (verdictIds.has(v.id)) problems.push(`verdict ${v.id}: duplicate id`);
    verdictIds.add(v.id);
    text(v.label, `verdict ${v.id} label`, 16);
  }
  const seen = new Set<string>();
  for (const c of cards) {
    if (seen.has(c.id)) problems.push(`card ${c.id}: duplicate id`);
    seen.add(c.id);
    if (!verdictIds.has(c.answer)) problems.push(`card ${c.id}: unknown answer ${c.answer}`);
    text(c.front, `card ${c.id} front`, 90);
    text(c.back, `card ${c.id} back`, 170);
    text(c.source, `card ${c.id} source`, 44);
  }
  text(config.deckLabel, "deckLabel", 28);
  text(config.prompt, "prompt", 38);
  text(config.hint, "hint", 140);
  text(config.endNote, "endNote", 120);
  return problems;
}
