/** Undo HTML escaping on interactive block placeholders stored in chapter MDX. */
export function restoreInteractiveBlockTags(source: string): string {
  let out = source
    .replace(
      /&lt;(Quiz|OpenQuestion|CodeExercise|ChapterRecap|ProjectPreview|LearningObjectives|Predict)\s+id="([^"]+)"\s*\/>/g,
      '<$1 id="$2" />'
    )
    .replace(
      /&lt;(MermaidDiagram)\s+chart="([^"]+)"\s*\/>/g,
      '<$1 chart="$2" />'
    )
    .replace(
      /&lt;(MandatoryReadCard|BigWordAlert|RealWorldEvent)\s+([^/]+)\s*\/>/g,
      '<$1 $2 />'
    )
    .replace(
      /&lt;(DiffBlock|StateMachine|EntityDiagram)\s+([\s\S]*?)\s*\/>/g,
      '<$1 $2 />'
    );

  const pairedTags = [
    "Callout",
    "InterestingRead",
    "ArticleBreak",
    "ApiRequestPanel",
    "ComparePanel",
    "FileTree",
    "TerminalBlock",
    "ArchitectureDiagram",
    "TraceRequest",
  ] as const;

  for (const tag of pairedTags) {
    out = out.replace(
      new RegExp(`&lt;(${tag})([\\s\\S]*?)>([\\s\\S]*?)&lt;\\/\\1>`, "g"),
      "<$1$2>$3</$1>"
    );
  }

  const voidTags = [
    "ApiRequest",
    "CompareColumn",
    "FileTreeItem",
    "TerminalLine",
    "ArchNode",
    "TraceStep",
  ] as const;

  for (const tag of voidTags) {
    out = out.replace(
      new RegExp(`&lt;(${tag})\\s+([\\s\\S]*?)\\s*\\/>`, "g"),
      "<$1 $2 />"
    );
  }

  return out;
}
