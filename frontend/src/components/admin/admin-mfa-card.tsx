"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { AdminActionForm } from "./admin-action-form";
import { adminSelectClassName } from "./admin-ui";
import {
  activateMfaAction,
  beginMfaEnrollmentAction,
  disableMfaAction,
  regenerateRecoveryCodesAction,
} from "@/server/actions/admin/mfa";
import {
  activateAccountMfaAction,
  beginAccountMfaEnrollmentAction,
  disableAccountMfaAction,
  regenerateAccountRecoveryCodesAction,
} from "@/server/actions/account-mfa";
import type { AdminTotpEnrollment } from "@/shared/api/admin";

// Two-step TOTP setup: the secret is shown once, then a code confirms it before
// MFA is enforced. Backup codes appear exactly once, at enable or regenerate time.
// The secret/codes travel through a server action (never the URL).

function CodeForm({
  submitLabel,
  pendingLabel,
  onSubmit,
}: {
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (formData: FormData) => Promise<string | null>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError(null);
        startTransition(async () => {
          setError(await onSubmit(formData));
        });
      }}
    >
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Code from your app
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={10}
          placeholder="123456"
          required
          className={adminSelectClassName}
        />
      </label>
      <Button type="submit" size="sm" loading={pending} loadingLabel={pendingLabel}>
        {submitLabel}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function RecoveryCodesPanel({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 dark:bg-amber-950/30">
      <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
        Save your backup codes now — each one signs you in once.
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm">
        {codes.map((code) => (
          <li key={code} className="rounded bg-background/60 px-2 py-1 text-center">
            {code}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        They are not shown again. Use one if you lose access to your authenticator app.
      </p>
      <Button type="button" size="sm" variant="outline" className="mt-3" onClick={onDone}>
        I&apos;ve saved them
      </Button>
    </div>
  );
}

export function MfaSettingsCard({
  enabled,
  recoveryCodesRemaining,
  mode = "admin",
}: {
  enabled: boolean;
  recoveryCodesRemaining: number;
  mode?: "admin" | "account";
}) {
  const [enrollment, setEnrollment] = useState<AdminTotpEnrollment | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const beginEnrollmentAction = mode === "admin" ? beginMfaEnrollmentAction : beginAccountMfaEnrollmentAction;
  const activateAction = mode === "admin" ? activateMfaAction : activateAccountMfaAction;
  const regenerateAction = mode === "admin" ? regenerateRecoveryCodesAction : regenerateAccountRecoveryCodesAction;
  const disableAction = mode === "admin" ? disableMfaAction : disableAccountMfaAction;

  function begin() {
    setError(null);
    startTransition(async () => {
      const result = await beginEnrollmentAction();
      if (result.ok) setEnrollment(result.enrollment);
      else setError(result.message);
    });
  }

  return (
    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Two-factor authentication</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {enabled
            ? `Enabled. You will be asked for a code when you sign in. ${recoveryCodesRemaining} backup code${recoveryCodesRemaining === 1 ? "" : "s"} remaining.`
            : "Protect your account with a time-based code from an authenticator app."}
        </p>
      </div>

      {recoveryCodes ? (
        <RecoveryCodesPanel codes={recoveryCodes} onDone={() => setRecoveryCodes(null)} />
      ) : null}

      {enabled ? (
        <div className="space-y-3">
          <CodeForm
            submitLabel="Regenerate backup codes"
            pendingLabel="Generating…"
            onSubmit={async (formData) => {
              const result = await regenerateAction(formData);
              if (result.ok) {
                setRecoveryCodes(result.recoveryCodes);
                return null;
              }
              return result.message;
            }}
          />
          <AdminActionForm
            action={disableAction}
            submitLabel="Disable"
            pendingLabel="Disabling…"
            variant="outline"
            size="sm"
            confirm={{
              question: "Disable two-factor authentication?",
              description: "Your account will be protected by your password alone, and backup codes are cleared.",
              confirmLabel: "Disable",
              fields: (
                <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                  Current authenticator code
                  <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={10} placeholder="123456" className={adminSelectClassName} />
                </label>
              ),
            }}
          />
        </div>
      ) : enrollment ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Scan this code with your authenticator app, then confirm the 6-digit code it shows.
            </p>
            {enrollment.qrDataUrl ? (
              <>
                {/* Data URL from our own API; next/image is not used for inline QR payloads. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={enrollment.qrDataUrl}
                  alt="QR code for authenticator setup"
                  width={240}
                  height={240}
                  className="mt-3 rounded-md bg-white p-2"
                />
              </>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">QR unavailable — use the secret below.</p>
            )}
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                Can&apos;t scan? Enter the secret instead
              </summary>
              <p className="mt-2 break-all font-mono text-sm">{enrollment.secret}</p>
              <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{enrollment.otpauthUri}</p>
            </details>
          </div>
          <CodeForm
            submitLabel="Confirm and enable"
            pendingLabel="Confirming…"
            onSubmit={async (formData) => {
              const result = await activateAction(formData);
              if (result.ok) {
                setRecoveryCodes(result.recoveryCodes);
                setEnrollment(null);
                return null;
              }
              return result.message;
            }}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Button type="button" variant="outline" size="sm" loading={pending} loadingLabel="Preparing…" onClick={begin}>
            Set up authenticator app
          </Button>
          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

export function AdminMfaCard(props: { enabled: boolean; recoveryCodesRemaining: number }) {
  return <MfaSettingsCard {...props} mode="admin" />;
}
