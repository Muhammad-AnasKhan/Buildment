"use client";

// Last line of defense for the "unknown component fails safely" acceptance
// criterion (docs/phases/m1-content-pipeline.mdx): publish-time validation
// should prevent unrenderable chapters, but if one slips through (e.g. it was
// imported before validation existed), the reader degrades instead of
// crashing the whole page.
export default function ChapterReaderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-lg font-semibold text-amber-900">
          This chapter can&apos;t be displayed right now
        </h1>
        <p className="mt-2 text-sm text-amber-800">
          The content failed to render. This usually means the chapter contains
          a component the platform doesn&apos;t support yet — your mentor has been
          notified via error tracking.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-full bg-amber-900 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
        >
          Try again
        </button>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-amber-600">ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
