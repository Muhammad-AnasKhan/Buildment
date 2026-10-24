import { useState } from 'react';
import { MarkdownText } from '../MarkdownText';

export function ReadingCard({
  title,
  href,
  url,
  description,
  summary,
  source,
  readMinutes,
  blockId,
  initialRead = false,
  onSaved,
}: any) {
  const [read, setRead] = useState(initialRead);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function markRead() {
    if (!blockId) {
      setRead(true);
      return;
    }
    setBusy(true);
    try {
      const result = await window.buildment.learning.answer(blockId, {
        complete: true,
      });
      if (!result.ok) setError(result.message);
      else {
        setRead(true);
        onSaved?.();
      }
    } catch {
      setError('Could not save reading progress. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  const link = href || url;
  return (
    <section className="my-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Required reading{readMinutes ? ` · ${readMinutes} min` : ''}
      </p>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="my-4 text-[15px] leading-7">
        <MarkdownText text={summary || description || ''} />
      </div>
      {typeof link === 'string' && /^https?:\/\//.test(link) && (
        <a
          className="inline-block underline underline-offset-4"
          href={link}
          target="_blank"
          rel="noreferrer"
        >
          {source || 'Open reading'} ↗
        </a>
      )}
      <div className="mt-5 border-t border-border pt-4">
        <button
          disabled={read || busy}
          onClick={() => void markRead()}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
        >
          {read ? 'Reading completed' : busy ? 'Saving…' : 'Mark as read'}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3">
          {error}
        </p>
      )}
    </section>
  );
}
