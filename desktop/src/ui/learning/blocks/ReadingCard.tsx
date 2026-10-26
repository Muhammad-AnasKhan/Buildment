import { useState } from 'react';
import { MustReadCard as SharedMustReadCard } from '@buildment/learning-ui/blocks/must-read/MustReadCard';

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
    if (read || busy) return;
    if (!blockId) {
      setRead(true);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await window.buildment.learning.answer(blockId, { complete: true });
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
  if (typeof link !== 'string' || !/^https?:\/\//.test(link)) return null;
  return (
    <SharedMustReadCard
      title={title || 'Required reading'}
      href={link}
      source={source}
      summary={summary || description || ''}
      readMinutes={readMinutes}
      blockId={blockId}
      read={read}
      disabled={busy}
      error={error}
      onReadChange={() => void markRead()}
    />
  );
}
