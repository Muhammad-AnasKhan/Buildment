import Link from "next/link";
import { LabGallery } from "@buildment/learning-ui/labs/LabGallery";

// Dev-only specimen sheet of the lab components, like /zz-lab-preview. Public, no
// auth, no data. Query: ?theme=light|dark|both and ?names=generic|aws.
export default async function LabGalleryPage({ searchParams }: { searchParams: Promise<{ theme?: string; names?: string }> }) {
  const { theme, names } = await searchParams;
  const t = theme === "light" || theme === "dark" ? theme : "both";
  const mode = names === "aws" ? "aws" : "generic";
  const link = (th: string, nm: string, label: string, on: boolean) => (
    <Link
      key={label}
      href={`/zz-lab-gallery?theme=${th}&names=${nm}`}
      className={`rounded-full border px-3 py-1 text-sm ${on ? "border-blue-600 bg-blue-600 text-white" : "border-border hover:bg-muted"}`}
    >
      {label}
    </Link>
  );
  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6">
      <h1 className="mb-1 text-xl font-semibold">Lab components</h1>
      <p className="mb-3 text-sm text-muted-foreground">Every piece of the lab board on its own, in light and dark, with generic or AWS names. The pieces are shared UI (packages/learning-ui, lab-ui). Dev only.</p>
      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Gallery options">
        {link("both", mode, "Light and dark", t === "both")}
        {link("light", mode, "Light", t === "light")}
        {link("dark", mode, "Dark", t === "dark")}
        {link(t, "generic", "Generic names", mode === "generic")}
        {link(t, "aws", "AWS names", mode === "aws")}
      </nav>
      <LabGallery theme={t} mode={mode} />
    </main>
  );
}
