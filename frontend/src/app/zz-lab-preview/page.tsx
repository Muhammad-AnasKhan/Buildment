import { Lab } from "@/lab/Lab";

// Temporary preview page for the HLD lab board. Public, no auth, no DB.
// Delete after review.
export default function LabPreviewPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-4 text-xl font-semibold">Lab preview</h1>
      <Lab slug="hld-m2-utilisation-knee" />
    </main>
  );
}
