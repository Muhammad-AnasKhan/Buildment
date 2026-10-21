"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Expand, ImageIcon, Minus, Plus, X } from "lucide-react";
import type { VisualWalkthroughConfig } from "@/shared/blocks/visual-walkthrough/schema";
import { readerCardLg, readerEyebrow } from "@/components/learn/reader-theme";
import { cn } from "@/lib/utils";

export function VisualWalkthroughClient({ title, steps }: VisualWalkthroughConfig) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const step = steps[active]!;

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, [open]);

  return (
    <>
      <section className={cn("not-prose my-8", readerCardLg)} aria-label={title} data-visual-walkthrough>
        <header className="border-b border-border bg-muted/25 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2"><ImageIcon className="size-4 text-muted-foreground" aria-hidden /><p className={readerEyebrow}>Visual walkthrough</p></div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">Select a step to inspect the illustration and its explanation.</p>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-border bg-muted/15 px-4 py-3 sm:px-5" aria-label={`${title} steps`}>
          {steps.map((item, index) => (
            <button key={item.id} type="button" onClick={() => setActive(index)} aria-current={index === active ? "step" : undefined} className={cn("flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors", index === active ? "border-foreground/25 bg-card text-foreground shadow-sm" : "border-transparent text-muted-foreground hover:border-border hover:bg-card")}>
              <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold", index === active ? "bg-foreground text-background" : "bg-muted text-muted-foreground")}>{index + 1}</span>
              <span className="max-w-40 truncate">{item.title}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 sm:p-5">
          <div className="relative flex min-h-48 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-3 sm:p-5">
            {/* Keep each illustration's actual aspect ratio rather than forcing a video frame. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={step.id} src={step.imageUrl} alt={step.alt} className="block h-auto max-h-[38rem] max-w-full object-contain" loading="lazy" />
            <button type="button" onClick={() => { setZoom(100); setOpen(true); }} className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted" aria-label={`Expand ${step.title} image`}><Expand className="size-3.5" aria-hidden /> Expand</button>
          </div>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className={readerEyebrow}>Step {active + 1} of {steps.length}</p>
              <h4 className="mt-1 text-base font-semibold text-foreground">{step.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => setActive((index) => Math.max(0, index - 1))} disabled={active === 0} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"><ChevronLeft className="size-3.5" aria-hidden /> Previous</button>
              <button type="button" onClick={() => setActive((index) => Math.min(steps.length - 1, index + 1))} disabled={active === steps.length - 1} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40">Next <ChevronRight className="size-3.5" aria-hidden /></button>
            </div>
          </div>
        </div>
      </section>

      {open ? createPortal(
        <dialog ref={dialogRef} aria-label={`${title}: ${step.title}`} onClose={() => setOpen(false)} className="fixed inset-0 m-auto h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/75 open:flex open:flex-col">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div><p className={readerEyebrow}>Step {active + 1} of {steps.length}</p><h2 className="text-base font-semibold">{step.title}</h2></div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setZoom((value) => Math.max(50, value - 25))} disabled={zoom === 50} aria-label="Zoom out" className="rounded-md border border-border p-2 hover:bg-muted disabled:opacity-40"><Minus className="size-4" aria-hidden /></button>
              <span className="w-12 text-center font-mono text-xs tabular-nums" aria-live="polite">{zoom === 100 ? "Fit" : `${zoom}%`}</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(200, value + 25))} disabled={zoom === 200} aria-label="Zoom in" className="rounded-md border border-border p-2 hover:bg-muted disabled:opacity-40"><Plus className="size-4" aria-hidden /></button>
              <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close walkthrough image" className="ml-2 rounded-md border border-border p-2 hover:bg-muted"><X className="size-4" aria-hidden /></button>
            </div>
          </div>
          <div className={cn("min-h-0 flex-1 overflow-auto bg-white p-4", zoom === 100 && "flex items-center justify-center")} tabIndex={0}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={step.imageUrl} alt={step.alt} className="mx-auto block h-auto max-w-none object-contain" style={{ width: `min(${9 * zoom}px, ${zoom}%)`, maxHeight: zoom === 100 ? "calc(100dvh - 9rem)" : undefined }} />
          </div>
        </dialog>, document.body
      ) : null}
    </>
  );
}
