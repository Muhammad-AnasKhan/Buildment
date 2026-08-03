export default async function CourseReportsPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reports — {courseSlug}</h1>
      <p className="mt-2 text-muted-foreground">
        Chapter and course reports are built in M6. See <code>docs/06-reports.mdx</code>.
      </p>
    </div>
  );
}
