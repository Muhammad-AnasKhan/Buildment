/** Undo HTML escaping on interactive block placeholders stored in chapter MDX. */
export function restoreInteractiveBlockTags(source: string): string {
  return source
    .replace(
      /&lt;(Quiz|OpenQuestion|Callout)\s+id="([^"]+)"\s*\/>/g,
      '<$1 id="$2" />'
    )
    .replace(
      /&lt;(MermaidDiagram)\s+chart="([^"]+)"\s*\/>/g,
      '<$1 chart="$2" />'
    )
    .replace(
      /&lt;(ProjectPreview|LearningObjectives|ChapterRecap)\s+([^/]+)\s*\/>/g,
      '<$1 $2 />'
    );
}
