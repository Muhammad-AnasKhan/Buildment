/** Undo HTML escaping on interactive block placeholders stored in chapter MDX. */
export function restoreInteractiveBlockTags(source: string): string {
  return source.replace(
    /&lt;(Quiz|OpenQuestion)\s+id="([^"]+)"\s*\/>/g,
    '<$1 id="$2" />'
  );
}
