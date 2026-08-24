export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Admin</h1>
      <p className="mt-1.5 text-sm text-neutral-500">
        User management and platform-wide data — a thin superset of the mentor experience.
      </p>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-10 text-center">
        <p className="text-sm font-medium text-neutral-700">Nothing here yet</p>
        <p className="mt-1 text-sm text-neutral-400">
          Platform admin tools arrive in a later milestone.
        </p>
      </div>
    </div>
  );
}
