import { useState } from 'react';
export function LearningLog({
  chapterId,
  questions,
  initial,
  onSaved,
}: {
  chapterId: string;
  questions: Array<{ id: string; title: string; hint?: string }>;
  initial: Record<string, string>;
  onSaved: () => void;
}) {
  const [answers, setAnswers] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const result = await window.buildment.learning.saveLog(
        chapterId,
        answers,
      );
      if (!result.ok) setMessage(result.message);
      else {
        setMessage('Reflection saved');
        onSaved();
      }
    } catch {
      setMessage('Could not save. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="my-6 space-y-4 rounded-xl border border-border p-6">
      <h3 className="font-semibold">Learning reflection</h3>
      {questions.map((question) => (
        <label className="block space-y-2" key={question.id}>
          <span>{question.title}</span>
          {question.hint && (
            <p className="text-sm text-muted-foreground">{question.hint}</p>
          )}
          <textarea
            value={answers[question.id] || ''}
            onChange={(event) =>
              setAnswers({ ...answers, [question.id]: event.target.value })
            }
            className="w-full rounded border border-border bg-background p-3"
            rows={4}
          />
        </label>
      ))}
      <button
        disabled={busy}
        onClick={() => void save()}
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
      >
        {busy ? 'Saving…' : 'Save reflection'}
      </button>
      <p role="status">{message}</p>
    </section>
  );
}
