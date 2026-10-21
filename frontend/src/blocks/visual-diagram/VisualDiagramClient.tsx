"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Expand, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisualDiagramConfig } from "@/shared/blocks/visual-diagram/schema";

export function VisualDiagramClient({ title, imageUrl, alt, caption, kind, legend }: VisualDiagramConfig) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [open]);

  return (
    <>
      <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
        <figcaption className="flex items-center justify-between gap-4 border-b border-border bg-muted/35 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {kind === "whiteboard" ? "Whiteboard" : kind === "system" ? "System diagram" : "Concept diagram"}
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          </div>
          <button
            type="button"
            onClick={() => { setZoom(100); setOpen(true); }}
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Expand className="size-3.5" aria-hidden /> Expand
          </button>
        </figcaption>
        <div className="bg-white" role="img" aria-label={alt}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="block h-auto w-full" loading="lazy" />
        </div>
        {(caption || legend?.length) ? (
          <div className="space-y-3 border-t border-border px-5 py-4 sm:px-6">
            {caption ? <p className="text-sm leading-relaxed text-muted-foreground">{caption}</p> : null}
            {legend?.length ? (
              <ul className="flex flex-wrap gap-2">
                {legend.map((item) => <li key={item} className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">{item}</li>)}
              </ul>
            ) : null}
          </div>
        ) : null}
      </figure>

      {open ? createPortal(
        <dialog
          ref={dialogRef}
          aria-label={title}
          onClose={() => setOpen(false)}
          className="fixed inset-0 m-auto h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/75 open:flex open:flex-col"
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold">{title}</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setZoom((value) => Math.max(50, value - 25))} disabled={zoom === 50} aria-label="Zoom out" className="rounded-md border border-border p-2 hover:bg-muted disabled:opacity-40"><Minus className="size-4" aria-hidden /></button>
              <span className="w-12 text-center font-mono text-xs tabular-nums" aria-live="polite">{zoom === 100 ? "Fit" : `${zoom}%`}</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(200, value + 25))} disabled={zoom === 200} aria-label="Zoom in" className="rounded-md border border-border p-2 hover:bg-muted disabled:opacity-40"><Plus className="size-4" aria-hidden /></button>
              <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close diagram" className="ml-2 rounded-md border border-border p-2 hover:bg-muted"><X className="size-4" aria-hidden /></button>
            </div>
          </div>
          <div className={cn("min-h-0 flex-1 overflow-auto bg-white p-4", zoom === 100 && "flex items-center justify-center")} tabIndex={0}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={alt}
              className="mx-auto block h-auto max-w-none object-contain"
              style={{ width: `min(${9 * zoom}px, ${zoom}%)`, maxHeight: zoom === 100 ? "calc(100dvh - 9rem)" : undefined }}
            />
          </div>
        </dialog>,
        document.body
      ) : null}
    </>
  );
}
