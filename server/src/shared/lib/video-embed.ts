// Direct video files render a native player; YouTube/Vimeo/Loom/Wistia URLs render a
// privacy-friendly iframe. Any other host is refused — the reader's component
// allowlist exists so mentor content can't embed arbitrary pages (docs/09-security.mdx).

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

export type VideoEmbed = { kind: "video"; src: string } | { kind: "iframe"; src: string };

export function resolveVideoEmbed(src: string): VideoEmbed | null {
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
