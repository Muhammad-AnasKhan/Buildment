// Bundle course illustrations so they also work with Electron's file:// URLs.
const assets = import.meta.glob(
  '/node_modules/@buildment/learning-ui/assets/course-assets/**/*',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>;

export function lessonAsset(value: unknown): any {
  if (typeof value === 'string' && value.startsWith('/course-assets/'))
    return (
      assets['/node_modules/@buildment/learning-ui/assets' + value] || value
    );
  if (Array.isArray(value)) return value.map(lessonAsset);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, lessonAsset(item)]),
    );
  return value;
}
