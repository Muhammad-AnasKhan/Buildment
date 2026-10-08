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
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-medium">Save these credentials now — the secret is shown only once.</p>
      <dl className="mt-3 space-y-2 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <dt className="text-amber-800">Access key</dt>
          <dd className="break-all">{accessKey}</dd>
          <Button type="button" size="sm" variant="outline" onClick={() => copy("access", accessKey)}>
            {copied === "access" ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <dt className="text-amber-800">Secret key</dt>
          <dd className="break-all">{secret}</dd>
          <Button type="button" size="sm" variant="outline" onClick={() => copy("secret", secret)}>
            {copied === "secret" ? "Copied" : "Copy"}
          </Button>
        </div>
      </dl>
      <p className="mt-3 text-xs text-amber-800/80">
        Use headers <code className="rounded bg-amber-100 px-1">x-buildment-access-key</code> and{" "}
        <code className="rounded bg-amber-100 px-1">x-buildment-secret-key</code> on integration
        requests.
      </p>
    </div>
  );
}
