/** Undo HTML escaping on interactive block placeholders and components stored in chapter MDX. */
export function restoreInteractiveBlockTags(source: string): string {
  let out = source
    // ArticleBreak was a purely decorative wrapper. Old published snapshots
    // retain their prose, but no longer render a separate block surface.
    .replace(/<ArticleBreak\b[^>]*>/g, "")
    .replace(/<\/ArticleBreak>/g, "")
    .replace(
      /&lt;(MermaidDiagram|StateMachine|EntityDiagram)\s+chart="([^"]+)"\s*(\/&gt;|\/>)/g,
      '<$1 chart="$2" />'
    );

  const blockNames = [
    "Quiz",
    "OpenQuestion",
    "CodeExercise",
    "ChapterRecap",
    "ProjectPreview",
    "LearningObjectives",
    "Predict",
    "MustRead",
    "VideoBlock",
    "VisualWalkthrough",
    "VisualDiagram",
    "Roadmap",
    "Steps",
    "Step",
    "Checklist",
    "LearningLog",
    "BigWordAlert",
    "RealWorldEvent",
    "GlossaryTerm",
    "DiffBlock",
    "CheckpointIntro",
    "PendingBlock",
    "PendingBlockCard",
    "Callout",
    "InterestingRead",
    "ApiRequestPanel",
    "ApiRequest",
    "ComparePanel",
    "CompareColumn",
    "FileTree",
    "FileTreeItem",
    "TerminalBlock",
    "TerminalLine",
    "ArchitectureDiagram",
    "ArchNode",
    "TraceRequest",
    "TraceStep",
    "FaqGroup",
    "FaqItem",
  ].join("|");

  // 1. Self-closing tags: &lt;Tag ... /&gt; or &lt;Tag ... />
  // Restrict attributes to not cross another tag boundary (&lt; or <)
  out = out.replace(
    new RegExp(`&lt;(${blockNames})\\s+((?:(?!&lt;|<|\\/&gt;|\\/>)[\\s\\S])*?)\\s*(\\/&gt;|\\/>)`, "g"),
    "<$1 $2 />"
  );
  out = out.replace(
    new RegExp(`&lt;(${blockNames})\\s*(\\/&gt;|\\/>)`, "g"),
    "<$1 />"
  );

  // 2. Closing tags: &lt;/Tag&gt; or &lt;/Tag>
  out = out.replace(
    new RegExp(`&lt;\\/(${blockNames})(&gt;|>)`, "g"),
    "</$1>"
  );

  // 3. Opening tags for paired blocks: &lt;Tag ...&gt; or &lt;Tag ...>
  out = out.replace(
    new RegExp(`&lt;(${blockNames})((?:(?!&lt;|<|&gt;|>)[\\s\\S])*?)(&gt;|>)`, "g"),
    "<$1$2>"
  );

  return out;
}
