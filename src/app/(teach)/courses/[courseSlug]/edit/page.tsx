export default async function CourseSettingsPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit course {courseSlug}</h1>
      <p className="mt-2 text-muted-foreground">
        Course settings, chapter list with drag-reorder, and publish are built starting M1.
      </p>
    </div>
  );
}
