"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { formatJsonDisplay } from "@/lib/format-json";
import { cn } from "@/lib/utils";

const METHOD_STYLES: Record<string, { badge: string; bar: string }> = {
  GET: {
    badge: "bg-emerald-500 text-white",
    bar: "border-emerald-200/80 bg-emerald-50/40",
  },
  POST: {
    badge: "bg-blue-600 text-white",
    bar: "border-blue-200/80 bg-blue-50/40",
  },
  PATCH: {
    badge: "bg-amber-500 text-white",
    bar: "border-amber-200/80 bg-amber-50/40",
  },
  PUT: {
    badge: "bg-violet-600 text-white",
    bar: "border-violet-200/80 bg-violet-50/40",
  },
  DELETE: {
    badge: "bg-red-600 text-white",
    bar: "border-red-200/80 bg-red-50/40",
  },
};

function methodStyles(method: string) {
  return (
    METHOD_STYLES[method.toUpperCase()] ?? {
      badge: "bg-indigo-600 text-white",
      bar: "border-indigo-200/80 bg-indigo-50/40",
    }
  );
}

function statusTone(status: number) {
  if (status >= 200 && status < 300) return "text-emerald-600 bg-emerald-50 ring-emerald-200/80";
  if (status >= 400 && status < 500) return "text-amber-800 bg-amber-50 ring-amber-200/80";
  if (status >= 500) return "text-red-700 bg-red-50 ring-red-200/80";
  return "text-neutral-700 bg-neutral-100 ring-neutral-200/80";
}

type ApiRequestPanelProps = {
  title?: string;
  children: ReactNode;
};

export function ApiRequestPanel({ title, children }: ApiRequestPanelProps) {
  return (
    <section
      className="not-prose my-10"
      aria-label={title ?? "API requests"}
      data-api-request-panel
    >
      {title ? (
        <header className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
            API lab
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">{title}</h3>
        </header>
      ) : null}
      <div className="flex flex-col gap-8">{children}</div>
    </section>
  );
}

type ApiRequestProps = {
  label?: string;
  method: string;
  url: string;
  bearer?: string;
  body?: string;
  responseStatus: number;
  responseBody?: string;
};

function CodePane({
  value,
  emptyLabel,
  className,
}: {
  value?: string;
  emptyLabel: string;
  className?: string;
}) {
  const text = value?.trim();
  return (
    <div
      className={cn(
        "min-h-[11rem] flex-1 overflow-auto bg-[#0d1117] font-mono text-[12px] leading-[1.65] text-[#e6edf3] sm:min-h-[12rem] sm:text-[13px]",
        className
      )}
    >
      {text ? (
        <pre className="m-0 p-4">
          <code>{formatJsonDisplay(text)}</code>
        </pre>
      ) : (
        <p className="p-4 text-neutral-500">{emptyLabel}</p>
      )}
    </div>
  );
}

type RequestTab = "body" | "headers";

export function ApiRequest({
  label,
  method,
  url,
  bearer,
  body,
  responseStatus,
  responseBody,
}: ApiRequestProps) {
  const normalizedMethod = method.toUpperCase();
  const styles = methodStyles(normalizedMethod);
  const hasBody = Boolean(body?.trim());
  const hasBearer = Boolean(bearer?.trim());
  const [tab, setTab] = useState<RequestTab>(hasBody ? "body" : "headers");

  const headersText = [
    hasBearer ? `Authorization: Bearer ${bearer}` : null,
    hasBody || normalizedMethod !== "GET" ? "Content-Type: application/json" : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <article
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
      aria-label={label ?? `${normalizedMethod} ${url}`}
      data-api-request
    >
      {label ? (
        <div className="border-b border-neutral-100 bg-neutral-50/80 px-4 py-2.5 sm:px-5">
          <p className="text-sm font-medium text-neutral-700">{label}</p>
        </div>
      ) : null}

      {/* Top bar — method + URL (wireframe row 1) */}
      <div
        className={cn(
          "flex items-stretch gap-0 border-b border-neutral-200",
          styles.bar
        )}
      >
        <div className="flex shrink-0 items-center border-r border-neutral-200/80 px-3 sm:px-4">
          <span
            className={cn(
              "inline-flex min-w-[4.25rem] items-center justify-center rounded-md px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide shadow-sm",
              styles.badge
            )}
          >
            {normalizedMethod}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 items-center px-3 py-2.5 sm:px-4">
          <code className="block w-full truncate font-mono text-xs text-neutral-800 sm:text-sm">
            {url}
          </code>
        </div>
      </div>

      {/* Split pane — request (left) | response (right) */}
      <div className="grid min-h-[14rem] grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-neutral-200">
        {/* Request column */}
        <div className="flex min-h-[14rem] flex-col border-b border-neutral-200 lg:border-b-0">
          <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-3 py-2 sm:px-4">
            <TabButton active={tab === "body"} onClick={() => setTab("body")}>
              Body
            </TabButton>
            <TabButton active={tab === "headers"} onClick={() => setTab("headers")}>
              Headers
            </TabButton>
          </div>
          <CodePane
            value={tab === "body" ? body : headersText}
            emptyLabel={
              tab === "body"
                ? "No request body for this call."
                : "No auth headers — public route."
            }
          />
        </div>

        {/* Response column */}
        <div className="flex min-h-[14rem] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-3 py-2 sm:px-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Response
            </span>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ring-1 ring-inset",
                statusTone(responseStatus)
              )}
            >
              {responseStatus}
            </span>
          </div>
          <CodePane
            value={responseBody}
            emptyLabel="Empty response body."
            className="border-l-0 lg:border-l-0"
          />
        </div>
      </div>
    </article>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/80"
          : "text-neutral-500 hover:bg-white/60 hover:text-neutral-800"
      )}
    >
      {children}
    </button>
  );
}
