"use client";

import { useActionState, useState } from "react";
import { signInAsTestAccountAction } from "@/server/actions/sign-in-credentials";
import type { AuthFormState } from "@/lib/auth-form-state";
import type { DevTestAccounts } from "@/server/auth/dev-test-accounts";

const initial: AuthFormState = { fieldErrors: {}, formError: null };

/** Dev-only list of seeded users; each button signs in as that user. The login page only renders it outside production. */
export function TestAccountPicker({
  testAccounts,
  redirectTo,
}: {
  testAccounts: DevTestAccounts;
  redirectTo?: string | null;
}) {
  const [state, action, pending] = useActionState(signInAsTestAccountAction, initial);
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="test-accounts-heading"
      className="w-full max-w-[440px] rounded-3xl border border-dashed border-border bg-card/60 px-5 py-4 text-card-foreground"
    >
      <h3 id="test-accounts-heading" className="text-sm font-semibold">
        Test accounts
      </h3>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        Development only. Password for all:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">{testAccounts.password}</code>
      </p>
      <form action={action} className="mt-3 flex flex-col gap-1.5">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
        {testAccounts.accounts.map((account) => (
          <button
            key={account.email}
            type="submit"
            name="email"
            value={account.email}
            disabled={pending}
            onClick={() => setChosen(account.email)}
            className="flex min-w-0 cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-sm outline-none transition-colors hover:border-foreground/30 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default disabled:opacity-70"
          >
            <span className="w-16 shrink-0 font-semibold">{account.roleLabel}</span>
            <span className="sr-only">, </span>
            <span className="min-w-0 truncate text-muted-foreground">{account.email}</span>
            {pending && chosen === account.email ? (
              <span
                aria-hidden
                className="ml-auto size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
              />
            ) : null}
          </button>
        ))}
      </form>
      {state.formError ? (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
        >
          {state.formError}
        </p>
      ) : null}
    </section>
  );
}
