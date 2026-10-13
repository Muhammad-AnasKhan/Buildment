"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FRESHMARKET_SCREENS = [
  {
    src: "/showcase/multi-vendor-marketplace/freshmarket-catalogue-hd.png",
    label: "Customer experience",
    title: "A marketplace people want to browse",
    description:
      "Build local-store discovery, catalogue search, category filters, rich product cards, and a storefront backed by real inventory.",
  },
  {
    src: "/showcase/multi-vendor-marketplace/freshmarket-vendor-dashboard-hd.png",
    label: "Vendor operations",
    title: "A command center for every seller",
    description:
      "Give vendors a secure view of revenue, active listings, stock alerts, recent orders, and day-to-day catalogue management.",
  },
  {
    src: "/showcase/multi-vendor-marketplace/freshmarket-checkout-hd.png",
    label: "Multi-vendor commerce",
    title: "One cart, many shops, one checkout",
    description:
      "Group items by store, collect delivery and payment details, validate totals on the server, and split the order correctly.",
  },
] as const;

export function CourseProjectShowcase({ courseSlug }: { courseSlug: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (courseSlug !== "multi-vendor-marketplace") return null;

  const active = FRESHMARKET_SCREENS[activeIndex];

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? FRESHMARKET_SCREENS.length - 1 : current - 1
    );
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % FRESHMARKET_SCREENS.length);
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground"
      aria-roledescription="carousel"
      aria-label="FreshMarket project preview"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") showPrevious();
        if (event.key === "ArrowRight") showNext();
      }}
    >
      <div className="flex flex-col gap-5 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            What you&apos;re going to build
          </p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
            Three connected product experiences
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-2 font-mono text-xs tabular-nums text-muted-foreground">
            {String(activeIndex + 1).padStart(2, "0")} / {String(FRESHMARKET_SCREENS.length).padStart(2, "0")}
          </span>
          <Button variant="outline" size="icon" onClick={showPrevious} aria-label="Previous project screen">
            <ArrowLeft />
          </Button>
          <Button variant="outline" size="icon" onClick={showNext} aria-label="Next project screen">
            <ArrowRight />
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-[minmax(0,1.5fr)_minmax(14rem,0.5fr)]">
        <div className="relative aspect-[1586/992] overflow-hidden bg-white sm:aspect-auto sm:min-h-[19rem] lg:min-h-[25rem]">
          <Image
            key={active.src}
            src={active.src}
            alt={active.title}
            fill
            priority={activeIndex === 0}
            sizes="(min-width: 1280px) 760px, (min-width: 640px) 65vw, 100vw"
            className="object-contain"
          />
        </div>

        <div className="flex flex-col justify-between border-t border-border p-5 sm:border-l sm:border-t-0 sm:p-6">
          <div aria-live="polite">
            <p className="text-xs font-semibold text-muted-foreground">{active.label}</p>
            <h3 className="mt-3 text-xl font-semibold leading-tight tracking-[-0.025em]">
              {active.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{active.description}</p>
          </div>

          <div className="mt-6 flex gap-2" role="tablist" aria-label="Choose project screen">
            {FRESHMARKET_SCREENS.map((screen, index) => (
              <button
                key={screen.src}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Show ${screen.label}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-1.5 flex-1 rounded-full bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  index === activeIndex && "bg-foreground"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
