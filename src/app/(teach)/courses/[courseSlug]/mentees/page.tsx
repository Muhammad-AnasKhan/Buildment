export default async function CourseMenteesPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Mentees — {courseSlug}</h1>
      <p className="mt-2 text-muted-foreground">
        Assign by email/bulk and invite links are built in M7. See{" "}
        <code>docs/phases/m7-assignment-and-polish.mdx</code>.
      </p>
    </div>
  );
}
