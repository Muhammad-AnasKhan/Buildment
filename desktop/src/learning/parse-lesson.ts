import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import { remarkChecklist } from '../../../server/src/shared/mdx/remark-checklist';
import { remarkLearningLog } from '../../../server/src/shared/mdx/remark-learning-log';
import { restoreInteractiveBlockTags } from '../../../server/src/shared/mdx/restore-block-tags';
import { chapterBodyForReader } from '../../../server/src/shared/lib/mdx-frontmatter';
import type { LessonNode } from '../domain/learning';
import { literalValue } from './literal-value';

// Parse content as data. Never compile or execute author-provided JavaScript.
export function parseLesson(source: string): LessonNode {
  const parser = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMdx)
    .use(remarkChecklist)
    .use(remarkLearningLog);
  const body = restoreInteractiveBlockTags(chapterBodyForReader(source));
  const tree = parser.runSync(parser.parse(body));
  function clean(node: any): LessonNode {
    const result: LessonNode = { type: node.type };
    for (const key of ['value', 'name', 'depth', 'url', 'ordered'] as const) {
      if (node[key] !== undefined) (result as any)[key] = node[key];
    }
    if (node.attributes) {
      result.attributes = {};
      for (const attribute of node.attributes) {
        if (attribute.type !== 'mdxJsxAttribute') continue;
        if (typeof attribute.value === 'string')
          result.attributes[attribute.name] = attribute.value;
        else if (attribute.value === null)
          result.attributes[attribute.name] = true;
        else if (attribute.value?.type === 'mdxJsxAttributeValueExpression') {
          try {
            result.attributes[attribute.name] = literalValue(
              attribute.value.data?.estree?.body?.[0]?.expression,
            );
          } catch {
            /* Executable expressions are never evaluated. */
          }
        }
      }
    }
    if (node.type === 'image') result.attributes = { alt: node.alt || '' };
    if (node.children) result.children = node.children.map(clean);
    return result;
  }
  return clean(tree);
}
