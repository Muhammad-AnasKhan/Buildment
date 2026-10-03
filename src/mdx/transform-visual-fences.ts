import { load as loadYaml } from "js-yaml";

/**
 * Transforms visual content fences (```video, ```walkthrough, ```diagram, ```roadmap)
 * authored in markdown into their corresponding interactive JSX components on the mentee reader side.
 */
export function transformVisualFences(source: string): string {
  if (!source) return source;

  return source.replace(
    /(?:^|[\r\n])[ \t]*```(video|walkthrough|diagram|roadmap)[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```/g,
    (match, fenceType, yamlText) => {
      try {
        const parsed = loadYaml(yamlText);
        if (!parsed || typeof parsed !== "object") return match;
        const data = parsed as Record<string, unknown>;

        if (fenceType === "video") {
          const src = data.sourceUrl ?? data.src ?? data.url;
          if (!src || typeof src !== "string") return match;
          const title = data.title ? ` title=${JSON.stringify(String(data.title))}` : "";
          const caption = data.caption ? ` caption=${JSON.stringify(String(data.caption))}` : "";
          const transcriptUrl = data.transcriptUrl
            ? ` transcriptUrl=${JSON.stringify(String(data.transcriptUrl))}`
            : "";
          return `\n\n<Video src=${JSON.stringify(src.trim())}${title}${caption}${transcriptUrl} />\n\n`;
        }

        if (fenceType === "walkthrough") {
          if (!data.steps || !Array.isArray(data.steps)) return match;
          const title = data.title ? ` title=${JSON.stringify(String(data.title))}` : "";
          return `\n\n<VisualWalkthrough${title} steps={${JSON.stringify(data.steps)}} />\n\n`;
        }

        if (fenceType === "diagram") {
          if (!data.imageUrl) return match;
          const title = data.title ? ` title=${JSON.stringify(String(data.title))}` : "";
          const alt = data.alt ? ` alt=${JSON.stringify(String(data.alt))}` : "";
          const caption = data.caption ? ` caption=${JSON.stringify(String(data.caption))}` : "";
          const kind = data.kind ? ` kind=${JSON.stringify(String(data.kind))}` : "";
          return `\n\n<VisualDiagram${title} imageUrl=${JSON.stringify(String(data.imageUrl))}${alt}${caption}${kind} />\n\n`;
        }

        if (fenceType === "roadmap") {
          const milestones = data.milestones ?? data.phases;
          if (!milestones || !Array.isArray(milestones)) return match;
          const title = data.title ? ` title=${JSON.stringify(String(data.title))}` : "";
          return `\n\n<Roadmap${title} milestones={${JSON.stringify(milestones)}} />\n\n`;
        }

        return match;
      } catch {
        return match;
      }
    }
  );
}
