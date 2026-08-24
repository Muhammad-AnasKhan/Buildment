import { cn } from "@/lib/utils";

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
      return `https://www.youtube-nocookie.com/embed/${id}`;
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
];

function resolveEmbed(src: string): { kind: "video"; src: string } | { kind: "iframe"; src: string } | null {
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

export function Video({ src, caption }: { src: string; caption?: string }) {
  const resolved = src ? resolveEmbed(src) : null;

  if (!resolved) {
    return (
      <div className="not-prose my-6 rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
        Unsupported video source. Use a direct .mp4/.webm/.ogg file, or a YouTube, Vimeo, or
        Loom link.
      </div>
    );
  }

  return (
    <figure className="not-prose my-8">
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 shadow-sm",
          resolved.kind === "iframe" && "aspect-video"
        )}
      >
        {resolved.kind === "video" ? (
          <video src={resolved.src} controls preload="metadata" className="block h-auto w-full" />
        ) : (
          <iframe
            src={resolved.src}
            title={caption ?? "Embedded video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="block size-full"
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-neutral-400">{caption}</figcaption>
      )}
    </figure>
  );
}
