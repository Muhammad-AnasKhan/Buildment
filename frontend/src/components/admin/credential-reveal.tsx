"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

export function CredentialReveal({
  accessKey,
  secret,
}: {
  accessKey: string;
  secret: string;
}) {
  const [copied, setCopied] = useState<"access" | "secret" | null>(null);

  const copy = useCallback(async (which: "access" | "secret", value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm dark:bg-amber-950/30">
      <p className="font-semibold text-amber-950 dark:text-amber-100">
        Save these credentials now — the secret is shown only once.
      </p>
      <dl className="mt-4 space-y-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-background/60 p-3">
          <dt className="w-full text-[10px] font-sans font-semibold uppercase tracking-wide text-muted-foreground">
            Access key
          </dt>
          <dd className="min-w-0 flex-1 break-all">{accessKey}</dd>
          <Button type="button" size="sm" variant="outline" onClick={() => copy("access", accessKey)}>
            {copied === "access" ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-background/60 p-3">
          <dt className="w-full text-[10px] font-sans font-semibold uppercase tracking-wide text-muted-foreground">
            Secret key
          </dt>
          <dd className="min-w-0 flex-1 break-all">{secret}</dd>
          <Button type="button" size="sm" variant="outline" onClick={() => copy("secret", secret)}>
            {copied === "secret" ? "Copied" : "Copy"}
          </Button>
        </div>
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">
        Use headers{" "}
        <code className="rounded bg-muted px-1 py-0.5">x-buildment-access-key</code> and{" "}
        <code className="rounded bg-muted px-1 py-0.5">x-buildment-secret-key</code> on integration
        requests.
      </p>
    </div>
  );
}
