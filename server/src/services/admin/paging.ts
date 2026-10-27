import type { AdminPageInfo } from "../../shared/api/admin.js";

// Offset pagination for the admin lists. Page numbers need a total, so each list
// counts first and then clamps the requested page (a stale `?page=9` link on a
// shrunken list shows the last page instead of an empty one).

export const DEFAULT_PAGE_SIZE = 25;

export type Paging = { page: number; pageSize: number; skip: number; take: number; pageCount: number; total: number };

export function resolvePaging(query: { page?: number; pageSize?: number }, total: number): Paging {
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(query.page ?? 1, pageCount);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize, pageCount, total };
}

export function pageInfo(paging: Paging): AdminPageInfo {
  return { page: paging.page, pageSize: paging.pageSize, total: paging.total, pageCount: paging.pageCount };
}
