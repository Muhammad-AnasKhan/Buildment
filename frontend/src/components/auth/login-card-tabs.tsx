"use client";

import { useState } from "react";
import { MagicLinkForm, PasswordLoginForm } from "@/components/auth/login-forms";
import { cn } from "@/lib/utils";

type Tab = "password" | "magic";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "password", label: "Password" },
  { id: "magic", label: "Magic link" },
];

/** Segmented Password / Magic link switch. Both forms keep their own server actions. */
export function LoginCardTabs({
  redirectTo,
  defaultEmail,
  switchToSignup,
}: {
  redirectTo?: string | null;
  defaultEmail?: string;
  switchToSignup: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("password");

  return (
    <>
      <div role="tablist" aria-label="Sign-in method" className="mb-6 grid grid-cols-2 gap-2">
        {TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`login-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`login-panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                "min-h-12 rounded-md border-2 px-4 text-[15px] font-bold outline-none transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card text-foreground hover:border-primary",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "password" ? (
        <div role="tabpanel" id="login-panel-password" aria-labelledby="login-tab-password">
          <PasswordLoginForm redirectTo={redirectTo} defaultEmail={defaultEmail} />
          <p className="mt-6 text-center text-base text-muted-foreground">{switchToSignup}</p>
        </div>
      ) : (
        <div role="tabpanel" id="login-panel-magic" aria-labelledby="login-tab-magic">
          <MagicLinkForm redirectTo={redirectTo} />
          <p className="mt-6 text-center text-base text-muted-foreground">
            We email you a link. No password needed.
          </p>
        </div>
      )}
    </>
  );
}
