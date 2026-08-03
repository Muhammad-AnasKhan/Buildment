export default async function ChapterEditorPage({
  params,
}: {
  params: Promise<{ courseSlug: string; chapterId: string }>;
}) {
  const { courseSlug, chapterId } = await params;
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Edit chapter {chapterId} of {courseSlug}
      </h1>
      <p className="mt-2 text-muted-foreground">
        The MDXEditor-based chapter editor is built in M1. See{" "}
        <code>docs/02-content-authoring.mdx</code>.
      </p>
    </div>
  );
}
