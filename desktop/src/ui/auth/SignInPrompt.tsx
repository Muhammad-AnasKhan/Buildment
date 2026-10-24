import { Sprout } from 'lucide-react';
export function SignInPrompt({
  busy,
  onSignIn,
}: {
  busy: boolean;
  onSignIn: () => void;
}) {
  const button =
    'rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50';
  return (
    <section
      aria-labelledby="ready-title"
      className="mt-8 flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-ok-soft/40 p-6"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ok-soft text-ok">
        <Sprout size={23} />
      </span>
      <div className="min-w-48 flex-1">
        <h2 id="ready-title" className="text-lg font-semibold">
          Ready to start learning?
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Explore the full outline below. Sign in when you’re ready to enroll.
        </p>
      </div>
      <button disabled={busy} onClick={onSignIn} className={button}>
        {busy ? 'Connecting…' : 'Sign in with browser'}
      </button>
    </section>
  );
}
