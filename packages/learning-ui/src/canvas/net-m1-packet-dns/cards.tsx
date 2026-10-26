"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { TONES, type Tone } from "../primitives/tones";
import type { PacketField } from "../models/net-packet";

// The words under a packet picture: one card, in a polite live region, so a
// screen reader hears the new field, header or step as soon as it changes.

const sentence = (text: string) => (/[.!?)]$/.test(text) ? text : `${text}.`);

/** "module 4", or a plain phrase for the message, which no module owns. */
export const moduleText = (module: number | null) => (module === null ? "the message itself, not a header" : `module ${module}`);

function Line({ lead, children }: { lead: string; children: ReactNode }) {
  return (
    <p>
      <span className="font-semibold">{lead} </span>
      {children}
    </p>
  );
}

const CARD = "mt-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-snug text-foreground";

/** One field in three short lines: what it is, who set it, where the course explains it. */
export function FieldCard({ field, aside }: { field: PacketField; aside?: string }) {
  return (
    <div className={CARD}>
      <p className="font-semibold">
        {field.label}: <span className="tabular-nums">{field.value}</span>
        {aside ? <span className="ml-2 font-medium text-muted-foreground">{aside}</span> : null}
      </p>
      <div className="mt-1 space-y-0.5">
        <Line lead="What it is:">{field.what}</Line>
        <Line lead="Who set it:">{sentence(field.who)}</Line>
        <Line lead="Where the course explains it:">{sentence(moduleText(field.module))}</Line>
      </div>
    </div>
  );
}

/** A card of plain sentences (a header's job, a wrap note, a router step). */
export function NoteCard({ heading, tone, children }: { heading?: string; tone?: Tone; children: ReactNode }) {
  return (
    <div className={cn(CARD, tone && cn("border-l-4", TONES[tone].rule))}>
      {heading ? <p className="font-semibold">{heading}</p> : null}
      <div className={heading ? "mt-1 space-y-0.5" : "space-y-0.5"}>{children}</div>
    </div>
  );
}

export { Line as CardLine };

/** The live region: a hidden sentence for what the picture shows, then the visible card. */
export function LiveCard({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      <p className="sr-only">{summary}</p>
      {children}
    </div>
  );
}
