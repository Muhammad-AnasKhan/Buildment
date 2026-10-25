// Context picker as a pure model: the learner sets two to four facts about
// their situation (the context), and an ordered list of rules picks which
// option fits, with a one-line reason. The first rule whose facts all match
// wins; if none matches, the fallback applies. It teaches "same question,
// different context, different right answer". No React here.

export type ContextChoice = {
  id: string;
  /** Short label on the pill, at most about 14 characters ("Read-heavy"). */
  label: string;
};

export type ContextFactor = {
  id: string;
  /** The fact being set, at most about 18 characters ("Workload"). */
  label: string;
  /** Two or three choices. */
  choices: ContextChoice[];
};

export type ContextOption = {
  id: string;
  /** The option's name, at most about 14 characters ("PostgreSQL"). */
  label: string;
  /** A short second line, at most about 18 characters ("row store"). */
  sub?: string;
};

export type ContextRule = {
  /** Factor id to choice id. Factors left out match any choice. */
  when: Record<string, string>;
  /** The option id this context picks. */
  pick: string;
  /** Why, in one plain sentence of at most about 90 characters. */
  why: string;
};

export type ContextPickerConfig = {
  /** The question the context answers, at most about 40 characters ("Which database is fastest here?"). */
  question: string;
  /** Two to four factors. */
  factors: ContextFactor[];
  /** Two to five options. */
  options: ContextOption[];
  /** Ordered rules; the first full match wins. */
  rules: ContextRule[];
  /** Used when no rule matches. */
  fallback: { pick: string; why: string };
  /** The context shown first: one choice id per factor id. */
  start: Record<string, string>;
  /** The one line under the picture telling the learner what to do. */
  hint: string;
};

export type ContextResult = { pick: string; why: string; rule: number };

export function resolveContext(config: ContextPickerConfig, context: Record<string, string>): ContextResult {
  const i = config.rules.findIndex((r) => Object.entries(r.when).every(([factor, choice]) => context[factor] === choice));
  if (i >= 0) return { pick: config.rules[i].pick, why: config.rules[i].why, rule: i };
  return { pick: config.fallback.pick, why: config.fallback.why, rule: -1 };
}

/** Every factor combination with its pick, in a stable order (for tests and the reader fallback). */
export function allContexts(config: ContextPickerConfig): { context: Record<string, string>; result: ContextResult }[] {
  if (config.factors.length === 0 || config.factors.some((f) => f.choices.length === 0)) return [];
  let combos: Record<string, string>[] = [{}];
  for (const f of config.factors) {
    combos = combos.flatMap((c) => f.choices.map((ch) => ({ ...c, [f.id]: ch.id })));
  }
  return combos.map((context) => ({ context, result: resolveContext(config, context) }));
}

/** The context to show first: the start choice for each factor, or the factor's first choice when the start is missing or unknown. */
export function startContext(config: ContextPickerConfig): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of config.factors) {
    const want = config.start[f.id];
    out[f.id] = f.choices.some((c) => c.id === want) ? want : (f.choices[0]?.id ?? "");
  }
  return out;
}

/** Problems with the data: unknown ids, a start that is not complete, an option no context can reach. Empty when fine. */
export function checkContextConfig(config: ContextPickerConfig): string[] {
  const problems: string[] = [];
  const dup = (ids: string[], what: string) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`${what}: duplicate id ${id}`);
      seen.add(id);
    }
  };
  if (config.factors.length === 0) problems.push("no factors");
  if (config.factors.length > 4) problems.push(`${config.factors.length} factors, at most 4 fit`);
  if (config.options.length === 0) problems.push("no options");
  if (config.options.length > 5) problems.push(`${config.options.length} options, at most 5 fit`);
  dup(config.factors.map((f) => f.id), "factors");
  dup(config.options.map((o) => o.id), "options");
  for (const f of config.factors) {
    if (f.choices.length === 0) problems.push(`factor ${f.id}: no choices`);
    if (f.choices.length > 3) problems.push(`factor ${f.id}: ${f.choices.length} choices, at most 3 fit`);
    dup(f.choices.map((c) => c.id), `factor ${f.id}`);
  }
  const factor = new Map(config.factors.map((f) => [f.id, new Set(f.choices.map((c) => c.id))]));
  const option = new Set(config.options.map((o) => o.id));
  config.rules.forEach((r, i) => {
    for (const [fid, cid] of Object.entries(r.when)) {
      const choices = factor.get(fid);
      if (!choices) problems.push(`rule ${i}: unknown factor ${fid}`);
      else if (!choices.has(cid)) problems.push(`rule ${i}: unknown choice ${cid} for factor ${fid}`);
    }
    if (!option.has(r.pick)) problems.push(`rule ${i}: unknown option ${r.pick}`);
  });
  if (!option.has(config.fallback.pick)) problems.push(`fallback: unknown option ${config.fallback.pick}`);
  for (const fid of Object.keys(config.start)) {
    const choices = factor.get(fid);
    if (!choices) problems.push(`start: unknown factor ${fid}`);
    else if (!choices.has(config.start[fid])) problems.push(`start: unknown choice ${config.start[fid]} for factor ${fid}`);
  }
  for (const f of config.factors) if (!(f.id in config.start)) problems.push(`start: missing factor ${f.id}`);
  const size = config.factors.reduce((n, f) => n * Math.max(1, f.choices.length), 1);
  if (config.options.length > 0 && size <= 5000) {
    const reached = new Set(allContexts(config).map((c) => c.result.pick));
    for (const o of config.options) if (!reached.has(o.id)) problems.push(`option ${o.id}: no context picks it`);
  }
  return problems;
}
