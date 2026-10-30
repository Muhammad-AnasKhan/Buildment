import type { LessonNode } from '../../domain/learning';
import type { Heading } from '@buildment/learning-ui/components/learn/chapter-toc';

/** Give the outline and rendered headings the same stable, unique anchors. */
export function lessonHeadings(document: LessonNode) {
  const headings: Heading[] = [];
  const counts = new Map<string, number>();
  const text = (node: LessonNode): string =>
    node.value || node.children?.map(text).join('') || '';
  function visit(node: LessonNode): LessonNode {
    const copy = { ...node, children: node.children?.map(visit) };
    if (node.type === 'heading') {
      const title = text(node);
      const slug =
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim() || 'section';
      const count = counts.get(slug) || 0;
      counts.set(slug, count + 1);
      const id = count ? `${slug}-${count}` : slug;
      copy.attributes = { ...node.attributes, id };
      if ((node.depth || 2) <= 3)
        headings.push({ id, text: title, level: node.depth || 2 });
    }
    return copy;
  }
  return { document: visit(document), headings };
}
