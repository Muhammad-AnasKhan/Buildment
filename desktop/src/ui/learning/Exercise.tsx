import { useEffect, useState } from 'react';
import { MarkdownText } from './MarkdownText';
import { lessonBlocks } from './blocks/registry';
import { lessonAsset } from './blocks/assets';
import type { BlockState, AnswerResult } from '../../domain/learning';

export function Exercise({
  id,
  onSaved,
  quizAnswers,
  onQuizAnswer,
}: {
  id: string;
  onSaved: () => void;
  quizAnswers?: Record<string, string[]>;
  onQuizAnswer?: (id: string, selected: string[]) => void;
}) {
  const [block, setBlock] = useState<BlockState | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [grade, setGrade] = useState<AnswerResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    window.buildment.learning
      .block(id)
      .then((result) => {
        if (!active) return;
        if (!result.ok) {
          setError(result.message);
          return;
        }
        const value = result.data;
        setBlock(value);
        if (value.type === 'QUIZ') {
          setSelected(value.initialState?.selected || []);
          setGrade(value.initialState);
        }
        if (value.type === 'PREDICT') {
          setSelected(value.initialState ? [value.initialState.selected] : []);
          setGrade(value.initialState);
        }
        if (value.type === 'CODE')
          setText(value.initialState?.source || value.config.starterCode);
        if (value.type === 'OPEN_QUESTION') {
          setText(value.initialState?.text || '');
          setUrl(value.initialState?.url || '');
        }
      })
      .catch(
        () =>
          active &&
          setError('Could not load the exercise. Reload the lesson to retry.'),
      );
    return () => {
      active = false;
    };
  }, [id]);
  async function submit() {
    if (!block || busy) return;
    setBusy(true);
    setError('');
    let payload: Record<string, unknown> = {};
    if (block.type === 'QUIZ') payload = { selected };
    if (block.type === 'PREDICT') payload = { selected: selected[0] };
    if (block.type === 'CODE') payload = { source: text };
    if (block.type === 'OPEN_QUESTION') payload = { text, url };
    if (block.type === 'MUST_READ') payload = { complete: true };
    try {
      const result = await window.buildment.learning.answer(id, payload);
      if (!result.ok) setError(result.message);
      else {
        setGrade(result.data);
        onSaved();
      }
    } catch {
      setError('Could not save your answer. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  if (!block)
    return (
      <div
        className="my-5 rounded-xl border border-border p-5"
        role={error ? 'alert' : 'status'}
      >
        {error || 'Loading exercise…'}
      </div>
    );
  const presentation = {
    VIDEO: 'Video',
    VISUAL_DIAGRAM: 'VisualDiagram',
    PROJECT_PREVIEW: 'ProjectPreview',
    LEARNING_OBJECTIVES: 'LearningObjectives',
    CHAPTER_RECAP: 'ChapterRecap',
    VISUAL_WALKTHROUGH: 'VisualWalkthrough',
    ROADMAP: 'Roadmap',
  }[block.type as string];
  if (presentation) {
    const Component = lessonBlocks[presentation];
    return (
      <Component
        {...lessonAsset(block.config)}
        src={'sourceUrl' in block.config ? block.config.sourceUrl : undefined}
      />
    );
  }
  const choice = block.type === 'QUIZ' || block.type === 'PREDICT';
  const batch = block.type === 'QUIZ' && quizAnswers !== undefined;
  const answers = batch ? quizAnswers[id] || selected : selected;
  const multiple =
    block.type === 'QUIZ' && block.config.quizType === 'multiple';
  const locked =
    grade?.isCorrect === true ||
    ('allowRetry' in block.config &&
      block.config.allowRetry === false &&
      grade !== null);
  const interactive = [
    'QUIZ',
    'PREDICT',
    'CODE',
    'OPEN_QUESTION',
    'MUST_READ',
  ].includes(block.type);
  return (
    <section
      className="my-7 space-y-5 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      aria-label="Exercise"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {block.type.replaceAll('_', ' ')}
      </p>
      {'prompt' in block.config && (
        <div className="text-[17px] font-medium leading-8">
          <MarkdownText text={String(block.config.prompt)} />
        </div>
      )}
      {choice && (
        <fieldset disabled={busy || locked} className="space-y-2">
          <legend className="sr-only">Choose your answer</legend>
          {block.config.options.map((option) => (
            <label
              key={option.id}
              className={
                'flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-[15px] transition-colors hover:bg-muted/50 ' +
                (answers.includes(option.id)
                  ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border')
              }
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={id}
                checked={answers.includes(option.id)}
                onChange={() => {
                  let next = [option.id];
                  if (multiple)
                    next = answers.includes(option.id)
                      ? answers.filter((item) => item !== option.id)
                      : [...answers, option.id];
                  setSelected(next);
                  if (batch) onQuizAnswer?.(id, next);
                }}
                className="mt-1"
              />
              <MarkdownText text={option.label} />
            </label>
          ))}
        </fieldset>
      )}
      {(block.type === 'CODE' || block.type === 'OPEN_QUESTION') && (
        <textarea
          aria-label={block.type === 'CODE' ? 'Your code' : 'Your answer'}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={8}
          className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm"
        />
      )}
      {block.type === 'OPEN_QUESTION' && (
        <input
          aria-label="Submission link"
          placeholder="Submission link (if required)"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="w-full rounded border border-border bg-background p-3"
        />
      )}
      {block.type === 'MUST_READ' && (
        <div>
          <h3 className="font-semibold">{block.config.title}</h3>
          <p>{block.config.description}</p>
          <p className="break-all select-all text-sm">{block.config.url}</p>
        </div>
      )}
      {!interactive &&
        !['LEARNING_OBJECTIVES', 'CHAPTER_RECAP', 'PROJECT_PREVIEW'].includes(
          block.type,
        ) && <ContentValues value={block.config} />}
      {interactive && !batch && (
        <button
          disabled={busy || locked || (choice && !selected.length)}
          onClick={() => void submit()}
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {busy
            ? 'Saving…'
            : block.type === 'MUST_READ'
              ? 'Mark as read'
              : 'Submit answer'}
        </button>
      )}
      {batch && (
        <p className="text-xs text-muted-foreground">
          Submit all answers at the end of this quiz.
        </p>
      )}
      {grade && (
        <div
          role="status"
          className={
            'rounded-xl border p-4 text-sm leading-7 ' +
            (grade.isCorrect === true
              ? 'border-ok/30 bg-ok-soft'
              : 'border-border bg-muted/50')
          }
        >
          <p>
            {grade.isCorrect === true
              ? 'Correct'
              : grade.isCorrect === false
                ? 'Not correct yet'
                : 'Answer saved'}
          </p>
          {grade.score !== null && (
            <p>
              Score: {grade.score} / {grade.maxScore}
            </p>
          )}
          {grade.explanation && (
            <div className="mt-2">
              <MarkdownText text={grade.explanation} />
            </div>
          )}
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

function ContentValues({ value }: { value: unknown }) {
  if (typeof value === 'string' || typeof value === 'number')
    return <p className="whitespace-pre-wrap leading-7">{String(value)}</p>;
  if (Array.isArray(value))
    return (
      <ul className="space-y-3">
        {value.map((item, index) => (
          <li key={index}>
            <ContentValues value={item} />
          </li>
        ))}
      </ul>
    );
  if (value && typeof value === 'object')
    return (
      <div className="space-y-3">
        {Object.entries(value)
          .filter(([key]) => !['id', 'type'].includes(key))
          .map(([key, item]) => (
            <div key={key}>
              <ContentValues value={item} />
            </div>
          ))}
      </div>
    );
  return null;
}
