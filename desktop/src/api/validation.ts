import { isCourse } from './catalog';
import type { CourseDetail } from '../domain/catalog';

// These checks protect the UI from missing or malformed server data.
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isChapter(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (typeof value.title !== 'string') return false;
  if (typeof value.order !== 'number') return false;
  return (
    value.estimatedMinutes === null ||
    typeof value.estimatedMinutes === 'number'
  );
}

function isModule(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (typeof value.title !== 'string') return false;
  if (typeof value.order !== 'number') return false;
  if (!Array.isArray(value.chapters)) return false;
  for (const chapter of value.chapters) {
    if (!isChapter(chapter)) return false;
  }
  return true;
}

export function isCourseDetail(value: unknown): value is CourseDetail {
  if (!isRecord(value) || !isCourse(value)) return false;
  const detail = value as unknown as Record<string, unknown>;
  if (typeof detail.signedIn !== 'boolean') return false;
  if (!['active', 'payment_required', 'none'].includes(String(detail.access)))
    return false;
  if (!Array.isArray(detail.modules)) return false;
  for (const module of detail.modules) {
    if (!isModule(module)) return false;
  }
  return true;
}
