// Read only literal data from remark-mdx's syntax tree. Never execute MDX.
export function literalValue(node: any): unknown {
  if (!node) throw new Error('Missing literal');
  if (node.type === 'Literal' && !node.regex && !node.bigint) return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis.map((part: any) => part.value.cooked).join('');
  if (node.type === 'ArrayExpression') return node.elements.map(literalValue);
  if (
    node.type === 'UnaryExpression' &&
    node.operator === '-' &&
    node.argument.type === 'Literal' &&
    typeof node.argument.value === 'number'
  )
    return -node.argument.value;
  if (node.type === 'ObjectExpression') {
    const value: Record<string, unknown> = {};
    for (const property of node.properties) {
      if (
        property.type !== 'Property' ||
        property.computed ||
        property.method ||
        property.kind !== 'init'
      )
        throw new Error('Not literal data');
      const key = property.key.name ?? property.key.value;
      if (
        typeof key !== 'string' ||
        ['__proto__', 'constructor', 'prototype'].includes(key)
      )
        throw new Error('Invalid key');
      value[key] = literalValue(property.value);
    }
    return value;
  }
  throw new Error('Not literal data');
}
