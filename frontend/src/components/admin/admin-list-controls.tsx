// Admin list helpers. Filtering is the live client bar
// (admin-live-filter-bar.tsx); paging is admin-pagination.tsx.

/** Builds a query string from the given values, ignoring empties. */
export function buildListQuery(values: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

/** Page-aware variant: always includes the page, skipping page 1. */
export function buildPagedQuery(
  values: Record<string, string | undefined>,
  page: number
): string {
  return buildListQuery({ ...values, ...(page > 1 ? { page: String(page) } : { page: undefined }) });
}
