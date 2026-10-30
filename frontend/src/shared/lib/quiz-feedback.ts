// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
// What a learner may read after answering a quiz or predict block.
//
// Explanations are written either as one paragraph about the right answer, or as one line per
// option that starts with the option in quotes: "Option text" why it is right or wrong. Showing
// all of it after a wrong pick gives the answer away, so until the learner gets it right (or the
// block allows no retry) only the lines about the options they picked are shown.

type Option = { id: string; label: string };

const QUOTED_LINE = /^\s*["“](.+?)["”]\s*[:.,-]?\s*(.*)$/;

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").replace(/[.?!\s]+$/, "").trim();
}

export function visibleExplanation(input: {
  explanation: string | null | undefined;
  options: readonly Option[];
  selected: readonly string[];
  isCorrect: boolean | null;
  allowRetry?: boolean;
}): string | undefined {
  const { explanation, options, selected, isCorrect, allowRetry } = input;
  if (!explanation) return undefined;
  if (isCorrect === true || allowRetry === false) return explanation;

  const picked = new Set(options.filter((option) => selected.includes(option.id)).map((option) => normalize(option.label)));
  const lines = explanation
    .split("\n")
    .filter((line) => {
      const match = QUOTED_LINE.exec(line);
      return match ? picked.has(normalize(match[1]!)) : false;
    });
  return lines.length > 0 ? lines.join("\n") : undefined;
}
