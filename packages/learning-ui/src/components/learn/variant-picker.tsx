"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Dot } from "../brand/dot";
import { channelIcon } from "./course-track-panels";
import { cn } from "../../lib/utils";

/** What the picker needs of a variant. Plain data, so a server page can pass it to this client component. */
export type VariantChoice = {
  slug: string;
  productName: string;
  /** The role, e.g. "Support agent". */
  label: string;
  summary: string;
  hardestConstraint: string;
  channels: Array<{ label: string; optional?: boolean }>;
  accentLight: string;
  onAccentLight: string;
  accentDark: string;
  onAccentDark: string;
  /** Its own lessons are not ready. Shown when it was the learner's earlier pick, but it cannot be chosen. */
  unavailable: boolean;
};

/** The small square mark. The variant's own colour appears here and nowhere else on the page. */
function VariantMark({ choice }: { choice: VariantChoice }) {
  return (
    <span
      aria-hidden
      style={
        {
          "--v": choice.accentLight,
          "--vo": choice.onAccentLight,
          "--vd": choice.accentDark,
          "--vod": choice.onAccentDark,
        } as React.CSSProperties
      }
      className="grid size-11 shrink-0 place-items-center rounded-md bg-(--v) font-heading text-lg font-bold text-(--vo) dark:bg-(--vd) dark:text-(--vod)"
    >
      {choice.productName.charAt(0)}
    </span>
  );
}

/**
 * One radio group of products and one action. The cards are real radios, so arrow keys and screen
 * readers work. The bar at the bottom names the pick and stays in view on a phone.
 */
export function VariantPicker({
  courseSlug,
  choices,
  initialSlug,
  onChoose,
}: {
  courseSlug: string;
  choices: VariantChoice[];
  initialSlug: string | null;
  onChoose: (data: FormData) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string | null>(initialSlug);
  const picked = choices.find((choice) => choice.slug === selected) ?? null;

  return (
    <form action={onChoose}>
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <fieldset className="min-w-0">
        <legend className="sr-only">Product to build</legend>
        <ul className="grid items-start gap-3 sm:grid-cols-2">
          {choices.map((choice) => {
            const on = choice.slug === selected;
            return (
              <li
                key={choice.slug}
                className={cn(
                  "relative flex flex-col rounded-lg bg-card transition-colors",
                  on ? "border-2 border-primary" : "border border-border hover:border-primary",
                  choice.unavailable && "opacity-70 hover:border-border"
                )}
              >
                <label className={cn("flex min-h-14 flex-1 gap-3.5 p-4", !choice.unavailable && "cursor-pointer", !on && "p-[calc(1rem+1px)]")}>
                  <input
                    type="radio"
                    name="variantSlug"
                    value={choice.slug}
                    checked={on}
                    disabled={choice.unavailable}
                    onChange={() => setSelected(choice.slug)}
                    className="peer sr-only"
                  />
                  <VariantMark choice={choice} />
                  <span className="min-w-0 flex-1 peer-focus-visible:underline">
                    <span className="block font-heading text-[17px] font-bold leading-snug tracking-[-0.02em]">{choice.productName}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {choice.unavailable ? `${choice.label}. No lessons yet.` : choice.label}
                    </span>
                    <span className={cn("mt-2 text-base leading-6", on ? "block" : "line-clamp-2")}>{choice.summary}</span>
                    {choice.channels.length > 0 ? (
                      <span className={cn("mt-2.5 items-center gap-2 text-muted-foreground sm:flex", on ? "flex" : "hidden")}>
                        <span className="sr-only">Channels: {choice.channels.map((channel) => channel.label).join(", ")}</span>
                        {choice.channels.map((channel) => {
                          const Icon = channelIcon(channel.label);
                          return (
                            <span
                              key={channel.label}
                              aria-hidden
                              title={channel.optional ? `${channel.label}, optional` : channel.label}
                              className={cn("grid size-7 place-items-center rounded-sm border", channel.optional ? "border-dashed border-border" : "border-border bg-secondary text-foreground")}
                            >
                              <Icon className="size-4" />
                            </span>
                          );
                        })}
                      </span>
                    ) : null}
                  </span>
                  {on ? (
                    <span aria-hidden className="absolute right-3 top-3 grid size-6 place-items-center rounded-sm bg-primary text-primary-foreground">
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                  ) : null}
                </label>
                <details className="border-t border-border">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center px-4 text-[15px] font-bold text-primary underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
                    See the hard problem
                  </summary>
                  <div className="space-y-3 bg-secondary px-4 py-3">
                    <p className="text-base leading-6">{choice.hardestConstraint}</p>
                    {choice.channels.length > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        People reach it by {choice.channels.map((channel) => (channel.optional ? `${channel.label} (optional)` : channel.label)).join(", ")}.
                      </p>
                    ) : null}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Dot mood={picked ? "cheer" : "think"} size={52} />
          <p className={cn("min-w-0 flex-1 text-base font-bold leading-snug", picked && "hidden sm:block")} aria-live="polite">
            {picked ? picked.productName : "Pick one to continue."}
          </p>
          <Button type="submit" disabled={!picked} loadingLabel="Saving" className="min-w-0 flex-1 sm:flex-none">
            {picked ? `Build with ${picked.productName}` : "Build"}
          </Button>
        </div>
      </div>
    </form>
  );
}
