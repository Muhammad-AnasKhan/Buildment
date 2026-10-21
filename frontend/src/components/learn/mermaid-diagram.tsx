"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { patchMermaidSvgForDarkMode } from "@/lib/mermaid-dark-patch";

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

function mermaidThemeVariables(isDark: boolean): Record<string, string | boolean> {
  if (isDark) {
    return {
      darkMode: true,
      background: "transparent",
      primaryColor: "#3a352e",
      primaryBorderColor: "rgba(243, 238, 230, 0.28)",
      primaryTextColor: "#f3eee6",
      secondaryColor: "#2a2620",
      secondaryBorderColor: "rgba(243, 238, 230, 0.22)",
      secondaryTextColor: "#e8e4dc",
      tertiaryColor: "#332e26",
      tertiaryBorderColor: "rgba(243, 238, 230, 0.18)",
      tertiaryTextColor: "#f0e4d0",
      lineColor: "#a3998e",
      textColor: "#f3eee6",
      mainBkg: "#2a2620",
      secondBkg: "#242018",
      border1: "rgba(243, 238, 230, 0.22)",
      border2: "rgba(243, 238, 230, 0.16)",
      fontSize: "15px",
      // erDiagram entity / attribute rows
      entityBkg: "#3a352e",
      entityBorderColor: "rgba(243, 238, 230, 0.28)",
      entityTextColor: "#f3eee6",
      attributeBackgroundColorOdd: "#2a2620",
      attributeBackgroundColorEven: "#322e28",
      attributeBorderColor: "rgba(243, 238, 230, 0.18)",
      attributeTextColor: "#e8e4dc",
      relationColor: "#a3998e",
      relationLabelBackground: "#2a2620",
      relationLabelColor: "#f3eee6",
      // flowchart
      nodeBkg: "#3a352e",
      nodeBorder: "rgba(243, 238, 230, 0.28)",
      nodeTextColor: "#f3eee6",
      clusterBkg: "#242018",
      clusterBorder: "rgba(243, 238, 230, 0.22)",
      defaultLinkColor: "#a3998e",
      edgeLabelBackground: "#2a2620",
      edgeLabelText: "#f3eee6",
      // sequenceDiagram
      actorBkg: "#3a352e",
      actorBorder: "rgba(243, 238, 230, 0.28)",
      actorTextColor: "#f3eee6",
      actorLineColor: "#a3998e",
      signalColor: "#a3998e",
      labelBoxBkgColor: "#2a2620",
      labelTextColor: "#f3eee6",
      loopTextColor: "#f3eee6",
      noteBkgColor: "#332e26",
      noteTextColor: "#f3eee6",
      noteBorderColor: "rgba(243, 238, 230, 0.22)",
      activationBkgColor: "#3a352e",
      activationBorderColor: "rgba(243, 238, 230, 0.28)",
      sequenceNumberColor: "#f3eee6",
    };
  }

  return {
    darkMode: false,
    background: "transparent",
    primaryColor: "#f5f6f7",
    primaryBorderColor: "#6b7280",
    primaryTextColor: "#1f2937",
    secondaryColor: "#f3f7f4",
    secondaryBorderColor: "#6b8a75",
    secondaryTextColor: "#23402d",
    tertiaryColor: "#faf7f1",
    tertiaryBorderColor: "#89785d",
    tertiaryTextColor: "#423727",
    lineColor: "#697386",
    textColor: "#1f2937",
    mainBkg: "#ffffff",
    secondBkg: "#f9fafb",
    border1: "#e5e7eb",
    border2: "#d1d5db",
    fontSize: "15px",
    entityBkg: "#f5f6f7",
    entityBorderColor: "#6b7280",
    entityTextColor: "#1f2937",
    attributeBackgroundColorOdd: "#ffffff",
    attributeBackgroundColorEven: "#f9fafb",
    attributeBorderColor: "#d1d5db",
    attributeTextColor: "#374151",
    relationColor: "#697386",
    relationLabelBackground: "#ffffff",
    relationLabelColor: "#1f2937",
  };
}

function initMermaid(api: MermaidApi, isDark: boolean) {
  api.initialize({
    startOnLoad: false,
    // Mermaid otherwise leaves its error SVG in document.body when parsing fails.
    suppressErrorRendering: true,
    theme: "base",
    look: "classic",
    securityLevel: "strict",
    fontFamily: "inherit",
    themeVariables: mermaidThemeVariables(isDark),
  });
  return api;
}

function normalizeChart(chart: string): string {
  const source = chart.trim();
  // Previously imported ER charts can contain relationship lines without the
  // diagram declaration. Keep those lessons readable until they are re-imported.
  if (/^[A-Za-z_][\w-]*\s+\|\|--o\{\s+[A-Za-z_][\w-]*\s*:/.test(source)) {
    return `erDiagram\n${source}`;
  }
  return chart;
}

function enqueueRender(id: string, chart: string, isDark: boolean) {
  const run = renderQueue.then(async () => {
    const api = await loadMermaid();
    initMermaid(api, isDark);
    try {
      return await api.render(id, normalizeChart(chart));
    } finally {
      // Older Mermaid builds can leave a temporary node behind after failure.
      document.getElementById(`d${id}`)?.remove();
      document.getElementById(`i${id}`)?.remove();
    }
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
            setSvg(isDark ? patchMermaidSvgForDarkMode(svgCode) : svgCode);
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
          className={cn(
            "mermaid-svg flex items-center justify-center",
            isDark && "mermaid-svg-dark"
          )}
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
