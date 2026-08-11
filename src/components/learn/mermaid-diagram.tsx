"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

type MermaidDiagramProps = {
  chart: string;
};

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  look: "handDrawn",
  securityLevel: "loose",
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

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
        const { svg: svgCode } = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(svgCode);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <pre className="not-prose my-6 overflow-x-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="not-prose my-8 overflow-x-auto rounded-2xl border border-indigo-100/80 bg-gradient-to-b from-indigo-50/40 to-white p-5 shadow-sm"
    >
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
