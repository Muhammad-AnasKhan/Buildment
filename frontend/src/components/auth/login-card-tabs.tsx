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
      <div
        role="tablist"
        aria-label="Sign-in method"
        className="mb-5 grid grid-cols-2 gap-1 rounded-[14px] border border-border bg-background p-1"
      >
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
                "rounded-[10px] p-[9px] text-sm font-semibold outline-none transition-all duration-200 focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "bg-card text-foreground shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)]"
                  : "text-muted-foreground hover:text-foreground",
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
          <p className="mt-[18px] text-center text-[15px] text-muted-foreground">{switchToSignup}</p>
        </div>
      ) : (
        <div role="tabpanel" id="login-panel-magic" aria-labelledby="login-tab-magic">
          <MagicLinkForm redirectTo={redirectTo} />
          <p className="mt-[18px] text-center text-[15px] text-muted-foreground">
            We&rsquo;ll email a one-time link. No password needed.
          </p>
        </div>
      )}
    </>
  );
}
