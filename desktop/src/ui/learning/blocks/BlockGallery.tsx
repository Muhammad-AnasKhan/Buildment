import { BigWordAlert } from '@buildment/learning-ui/components/learn/big-word-alert';
import { Callout } from '@buildment/learning-ui/components/learn/callout';
import { InteractiveCanvas } from '@buildment/learning-ui/canvas/InteractiveCanvas';
import { CANVAS_SLUGS } from '@buildment/learning-ui/canvas/registry';
import { Practice } from './Practice';
import { useState } from 'react';

export function BlockGallery() {
  return (
    <section className="my-8 space-y-5" aria-label="Learning block examples">
      <h3 className="text-xl font-semibold">Explore the learning tools</h3>
      <p className="text-sm leading-7 text-muted-foreground">
        Try these examples to see how reading cards, practice questions, and
        interactive diagrams work. Practice here does not change course
        progress.
      </p>
      <details className="rounded-xl border border-border p-5">
        <summary className="cursor-pointer font-semibold">
          Reading and practice
        </summary>
        <BigWordAlert
          term="Idempotency"
          plainEnglish="Repeating the request has the same effect as doing it once."
          whyItMatters="A retried payment must not charge twice."
        />
        <Callout
          type="tip"
          title="Test one change at a time"
          content="Write down what you expect before trying a change."
        />
        <Practice
          prompt="Where should inventory rules be enforced?"
          options={[
            { id: 'browser', label: 'Only in the browser' },
            { id: 'api', label: 'In the API' },
          ]}
          correctOptionIds={['api']}
          explanation="The API checks the rules for every client."
        />
      </details>
      {CANVAS_SLUGS.map((slug) => (
        <CanvasExample key={slug} slug={slug} />
      ))}
    </section>
  );
}
function CanvasExample({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="rounded-xl border border-border p-5"
    >
      <summary className="cursor-pointer text-sm font-medium">
        {slug.replaceAll('-', ' ')}
      </summary>
      {open && <InteractiveCanvas slug={slug} />}
    </details>
  );
}
