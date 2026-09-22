/** Code exercises were removed from the course — keep registry entry for legacy Response rows. */
export async function CodeExerciseComponent({ id }: { id: string }) {
  return (
    <div className="not-prose my-6 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
      This lesson no longer includes an in-browser code lab ({id}). Follow the highlighted code
      blocks and terminal steps in the chapter instead.
    </div>
  );
}
