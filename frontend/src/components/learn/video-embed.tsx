import { cn } from "@/lib/utils";
import { PlaySquare, ExternalLink } from "lucide-react";

// MDX embed for videos: `<Video src="https://…" caption="…" />`.
// Direct video files render a native player; YouTube/Vimeo/Loom URLs render a
// privacy-friendly iframe. Any other host is refused outright — the reader's
// component allowlist exists so mentor content can't embed arbitrary pages
// (docs/09-security.mdx), so no raw-iframe fallback here either.

const EMBED_HOSTS: Array<{
  match: RegExp;
  toEmbed: (url: URL) => string | null;
}> = [
  {
    match: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/,
    toEmbed: (url) => {
      const id =
        url.searchParams.get("v") ??
        (url.hostname.endsWith("youtu.be") ? url.pathname.slice(1).split("/")[0] : null) ??
        url.pathname.split("/").filter(Boolean).pop();
      if (!id || !/^[\w-]{6,}$/.test(id)) return null;
      const t = url.searchParams.get("t") ?? url.searchParams.get("start");
      let startParam = "";
      if (t) {
        const secMatch = t.match(/^(?:(\d+)m)?(?:(\d+)s?)?$/);
        const sec =
          secMatch && (secMatch[1] || secMatch[2])
            ? parseInt(secMatch[1] || "0", 10) * 60 + parseInt(secMatch[2] || "0", 10)
            : parseInt(t, 10);
        if (!isNaN(sec) && sec > 0) startParam = `?start=${sec}`;
      }
      return `https://www.youtube-nocookie.com/embed/${id}${startParam}`;
    },
  },
  {
    match: /(^|\.)vimeo\.com$/,
    toEmbed: (url) => {
      const id = url.pathname.split("/").filter(Boolean).pop();
      if (!id || !/^\d+$/.test(id)) return null;
      return `https://player.vimeo.com/video/${id}`;
    },
  },
  {
    match: /(^|\.)loom\.com$/,
    toEmbed: (url) => {
      const id = url.pathname.split("/").filter(Boolean).pop();
      if (!id) return null;
      return `https://www.loom.com/embed/${id}`;
    },
  },
  {
    match: /(^|\.)wistia\.com$/,
    toEmbed: (url) => {
      const id = url.pathname.split("/").filter(Boolean).pop();
      if (!id || !/^[\w-]{6,}$/.test(id)) return null;
      return `https://fast.wistia.net/embed/iframe/${id}`;
    },
  },
];

export function resolveVideoEmbed(src: string): { kind: "video"; src: string } | { kind: "iframe"; src: string } | null {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url.pathname)) {
    return { kind: "video", src };
  }

  for (const host of EMBED_HOSTS) {
    if (host.match.test(url.hostname)) {
      const embed = host.toEmbed(url);
      if (embed) return { kind: "iframe", src: embed };
    }
  }
  return null;
}

export function Video({
  src,
  title,
  caption,
  transcriptUrl,
}: {
  src: string;
  title?: string;
  caption?: string;
  transcriptUrl?: string;
}) {
  const resolved = src ? resolveVideoEmbed(src) : null;

  if (!resolved) {
    return (
      <div className="not-prose my-6 rounded-xl border border-dashed border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
        Unsupported or invalid video source ({src || "empty"}). Use a direct .mp4/.webm file, or a YouTube, Vimeo, Loom,
        or Wistia link.
      </div>
    );
  }

  return (
    <section className="not-prose my-8 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <PlaySquare className="size-4 text-primary" />
          <span>Video walkthrough</span>
        </div>
        {transcriptUrl ? (
          <a
            href={transcriptUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>Transcript</span>
            <ExternalLink className="size-3" />
          </a>
        ) : null}
      </header>

      <div className="space-y-4 p-4 sm:p-6">
        {title ? (
          <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {title}
          </h3>
        ) : null}

        <div
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-neutral-950 shadow-md",
            resolved.kind === "iframe" && "aspect-video"
          )}
        >
          {resolved.kind === "video" ? (
            <video src={resolved.src} controls preload="metadata" className="block h-auto w-full" />
          ) : (
            <iframe
              src={resolved.src}
              title={caption ?? title ?? "Embedded video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              className="block size-full"
            />
          )}
        </div>

        {caption ? (
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            {caption}
          </p>
        ) : null}
      </div>
    </section>
  );
}

