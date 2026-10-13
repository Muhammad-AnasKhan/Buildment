/** Remove inline block placeholders from MDX (used for quiz-chapter wizard mode). */
export function stripInteractiveBlockTags(source: string): string {
  return source.replace(/<(Quiz|OpenQuestion|Predict)\s+id="[^"]+"\s*\/>/g, "");
}
