import Link from "next/link";

export default function AdminNotFound() {
  return (
    <section className="mx-auto my-12 max-w-xl rounded-2xl border bg-card p-6 text-center text-card-foreground shadow-sm">
      <h1 className="text-lg font-semibold">Not found</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        This admin record does not exist or is not available.
      </p>
      <Link
        href="/admin"
        className="mt-4 inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Back to overview
      </Link>
    </section>
  );
}
