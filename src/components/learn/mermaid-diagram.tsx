"use client";

import { useEffect, useId, useState } from "react";

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, chart: string) => Promise<{ svg: string }>;
};

type MermaidDiagramProps = {
  chart: string;
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
    mermaidPromise ??= Promise.resolve(initMermaid(window.mermaid));
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
        resolve(initMermaid(window.mermaid));
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

function initMermaid(api: MermaidApi) {
  api.initialize({
    startOnLoad: false,
    theme: "base",
    look: "classic",
    securityLevel: "strict",
    fontFamily: "inherit",
    themeVariables: {
      primaryColor: "#eef2ff",
      primaryBorderColor: "#6366f1",
      primaryTextColor: "#1e1b4b",
      secondaryColor: "#ecfdf5",
      secondaryBorderColor: "#10b981",
      secondaryTextColor: "#064e3b",
      tertiaryColor: "#fff7ed",
      tertiaryBorderColor: "#f59e0b",
      lineColor: "#6366f1",
      fontSize: "15px",
    },
  });
  return api;
}

function enqueueRender(id: string, chart: string) {
  const run = renderQueue.then(async () => {
    const api = await loadMermaid();
    return api.render(id, chart);
  });
  renderQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const startRender = () => {
      enqueueRender(`mermaid-${reactId}`, chart)
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
  }, [chart, reactId]);

  if (error) {
    return (
      <pre className="not-prose my-6 overflow-x-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </pre>
    );
  }

  return (
    <div className="not-prose my-8 overflow-x-auto rounded-2xl border border-indigo-500/25 bg-gradient-to-b from-indigo-500/10 to-card p-5 shadow-sm">
      {svg ? (
        <div
          className="mermaid-svg flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <div className="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-indigo-600" />
          Rendering diagram…
        </div>
      )}
    </div>
  );
}
