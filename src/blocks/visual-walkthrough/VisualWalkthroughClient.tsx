"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VisualWalkthroughConfig } from "./schema";

export function VisualWalkthroughClient({ title, steps }: VisualWalkthroughConfig) {
  const [active, setActive] = useState(0);
  const step = steps[active]!;
  const previous = () => setActive((index) => Math.max(0, index - 1));
  const next = () => setActive((index) => Math.min(steps.length - 1, index + 1));

  return (
    <section className="not-prose my-8 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm" aria-label={title}>
      <header className="border-b border-border bg-muted/35 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"><ImageIcon className="size-4" /> Visual walkthrough</div>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      </header>
      <div className="grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <ol className="border-b border-border bg-muted/20 p-2 lg:border-b-0 lg:border-r lg:p-3">
          {steps.map((item, index) => {
            const selected = index === active;
            return <li key={item.id}><button type="button" onClick={() => setActive(index)} aria-current={selected ? "step" : undefined} className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${selected ? "bg-card shadow-sm ring-1 ring-border" : "hover:bg-muted"}`}><span className="flex gap-3"><span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${selected ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>{index + 1}</span><span><span className="block text-sm font-medium text-foreground">{item.title}</span><span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">{item.description}</span></span></span></button></li>;
          })}
        </ol>
        <div className="min-w-0 p-4 sm:p-6">
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
            <img src={step.imageUrl} alt={step.alt} className="block max-h-[34rem] w-full object-contain" loading="lazy" />
          </div>
          <div className="mt-4 flex items-start justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Step {active + 1} of {steps.length}</p><h4 className="mt-1 text-base font-semibold text-foreground">{step.title}</h4><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p></div><a href={step.imageUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Open ${step.title} image`}><Expand className="size-4" /></a></div>
          <div className="mt-5 flex justify-between border-t border-border pt-4"><Button type="button" variant="outline" size="sm" onClick={previous} disabled={active === 0}><ChevronLeft className="size-4" /> Previous</Button><Button type="button" variant="outline" size="sm" onClick={next} disabled={active === steps.length - 1}>Next <ChevronRight className="size-4" /></Button></div>
        </div>
      </div>
    </section>
  );
}
