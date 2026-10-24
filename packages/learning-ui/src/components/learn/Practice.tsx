"use client";
import { useState } from 'react';
import { MarkdownText } from './MarkdownText';

// Author-supplied examples have no persisted block ID and never award progress.
export function Practice({ prompt, options, correctOptionIds, correctOptionId, explanation, starterCode, hints = [] }: any) {
  const [selected, setSelected] = useState<string[]>([]);
  const [answer, setAnswer] = useState(starterCode || '');
  const [review, setReview] = useState(false);
  const correct: string[] = correctOptionIds || (correctOptionId ? [correctOptionId] : []);
  const passed = correct.length && selected.length === correct.length && selected.every(id => correct.includes(id));
  return <section className="my-8 space-y-5 rounded-2xl border border-border bg-card p-6">
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Practice example · not graded</p>
    <div className="text-lg leading-7"><MarkdownText text={prompt || 'Try it yourself'} /></div>
    {options ? <fieldset className="space-y-2"><legend className="sr-only">Choose an answer</legend>{options.map((option: any) => <label key={option.id} className="flex gap-3 rounded-xl border border-border p-4"><input type="checkbox" checked={selected.includes(option.id)} onChange={() => { setReview(false); setSelected(selected.includes(option.id) ? selected.filter(id => id !== option.id) : [...selected, option.id]); }} /><MarkdownText text={option.label} /></label>)}</fieldset> : <textarea aria-label="Practice answer" rows={7} value={answer} onChange={event => setAnswer(event.target.value)} className="w-full rounded-xl border border-border bg-background p-4 font-mono text-sm" />}
    {hints.length > 0 && <details><summary className="cursor-pointer font-medium">Hints</summary><ul className="mt-3 list-disc pl-5">{hints.map((hint: string, i: number) => <li key={i}>{hint}</li>)}</ul></details>}
    {correct.length > 0 && <button onClick={() => setReview(true)} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Check practice answer</button>}
    {review && <div role="status" className="rounded-xl bg-muted p-4"><p className="font-semibold">{passed ? 'Correct' : 'Try again'}</p>{explanation && <MarkdownText text={explanation} />}</div>}
  </section>;
}
