import Link from "next/link";

export default function IntegrationsDocsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-sm leading-relaxed text-neutral-700">
      <h1 className="text-2xl font-semibold text-neutral-900">Organization integrations</h1>
      <p className="mt-3">
        External platforms authenticate with{" "}
        <code className="rounded bg-neutral-100 px-1">x-buildment-access-key</code> and{" "}
        <code className="rounded bg-neutral-100 px-1">x-buildment-secret-key</code> on every request.
      </p>
      <p className="mt-4">
        Machine-readable catalog:{" "}
        <Link href="/integrations/v1" className="font-medium text-indigo-600 underline">
          GET /integrations/v1
        </Link>
      </p>
      <p className="mt-4 text-neutral-500">
        Local demo credentials: run{" "}
        <code className="rounded bg-neutral-100 px-1">pnpm db:seed:integration</code> after{" "}
        <code className="rounded bg-neutral-100 px-1">pnpm db:seed</code>.
      </p>
    </div>
  );
}
