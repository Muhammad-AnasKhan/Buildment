import Link from "next/link";
import { Lab } from "@/lab/Lab";
import { getLabSpec } from "@/lab/registry";
import { LAB_SLUGS, isLabSlug } from "@/shared/lab/slugs";

// Temporary preview page for the lab boards, one per course. Public, no auth,
// no DB. Delete after review.
export default async function LabPreviewPage({ searchParams }: { searchParams: Promise<{ lab?: string }> }) {
  const { lab } = await searchParams;
  const slug = isLabSlug(lab) ? lab : LAB_SLUGS[0];
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="mb-3 text-xl font-semibold">Lab preview</h1>
      <nav className="mb-2 flex flex-wrap gap-2">
        {LAB_SLUGS.map((s) => (
          <Link
            key={s}
            href={`/zz-lab-preview?lab=${s}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              s === slug ? "border-blue-600 bg-blue-600 text-white" : "border-border hover:bg-muted"
            }`}
          >
            {getLabSpec(s)?.title}
          </Link>
        ))}
      </nav>
      <Lab key={slug} slug={slug} />
    </main>
  );
}
