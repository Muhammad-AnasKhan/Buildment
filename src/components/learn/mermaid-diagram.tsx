"use client";

import { useEffect, useId, useState } from "react";

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, chart: string) => Promise<{ svg: string }>;
};

type MermaidDiagramProps = {
  chart: string;
  title?: string;
  legend?: string;
};

declare global {
  interface Window {
    mermaid?: MermaidApi;
  }
}

const MERMAID_SRC = "/vendor/mermaid.min.js";

let mermaidPromise: Promise<MermaidApi> | null = null;
let renderQueue: Promise<unknown> = Promise.resolve();

function loadMermaid() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mermaid only runs in the browser"));
  }
  if (window.mermaid) {
    mermaidPromise ??= Promise.resolve(window.mermaid);
    return mermaidPromise;
  }
  if (!mermaidPromise) {
    mermaidPromise = new Promise<MermaidApi>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${MERMAID_SRC}"]`);
      const script = existing ?? document.createElement("script");
      const onLoad = () => {
        if (!window.mermaid) {
          reject(new Error("Mermaid failed to load"));
          return;
        }
        resolve(window.mermaid);
      };
      script.addEventListener("load", onLoad, { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error("Failed to load Mermaid script")),
        { once: true }
      );
      if (!existing) {
        script.src = MERMAID_SRC;
        script.async = true;
        document.head.appendChild(script);
      } else if (window.mermaid) {
        onLoad();
      }
    });
  }
  return mermaidPromise;
}

function initMermaid(api: MermaidApi, isDark: boolean) {
  api.initialize({
    startOnLoad: false,
    theme: "base",
    look: "classic",
    securityLevel: "strict",
    fontFamily: "inherit",
    themeVariables: {
      primaryColor: isDark ? "#30363d" : "#f5f6f7",
      primaryBorderColor: isDark ? "#8b949e" : "#6b7280",
      primaryTextColor: isDark ? "#e6edf3" : "#1f2937",
      secondaryColor: isDark ? "#26352d" : "#f3f7f4",
      secondaryBorderColor: isDark ? "#6c927a" : "#6b8a75",
      secondaryTextColor: isDark ? "#d4e7da" : "#23402d",
      tertiaryColor: isDark ? "#39332a" : "#faf7f1",
      tertiaryBorderColor: isDark ? "#a89170" : "#89785d",
      tertiaryTextColor: isDark ? "#f0e4d0" : "#423727",
      lineColor: isDark ? "#9da7b3" : "#697386",
      fontSize: "15px",
    },
  });
  return api;
}

function enqueueRender(id: string, chart: string, isDark: boolean) {
  const run = renderQueue.then(async () => {
    const api = await loadMermaid();
    initMermaid(api, isDark);
    return api.render(id, chart);
  });
  renderQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export function MermaidDiagram({ chart, title, legend }: MermaidDiagramProps) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDark(root.classList.contains("dark"));
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startRender = () => {
      enqueueRender(`mermaid-${reactId}`, chart, isDark)
        .then(({ svg: svgCode }) => {
          if (!cancelled) {
            setSvg(svgCode);
            setError(null);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Failed to render diagram");
          }
        });
    };

    const idleId =
      typeof requestIdleCallback === "function"
        ? requestIdleCallback(startRender)
        : window.setTimeout(startRender, 1);

    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback === "function") {
        cancelIdleCallback(idleId);
      }
      clearTimeout(idleId);
    };
  }, [chart, isDark, reactId]);

  if (error) {
    return (
      <pre className="not-prose my-6 overflow-x-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-200">
        {error}
      </pre>
    );
  }

  return (
    <div className="not-prose my-8 overflow-x-auto rounded-2xl border border-border/90 bg-card p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
      {title ? <p className="mb-4 text-sm font-semibold text-foreground">{title}</p> : null}
      {svg ? (
        <div
          className="mermaid-svg flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
          Rendering diagram…
        </div>
      )}
      {legend ? <p className="mt-4 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">{legend}</p> : null}
    </div>
  );
}
