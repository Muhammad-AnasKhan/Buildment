import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "../lib/utils";
import { FactorCanvas } from "./renderers/factor/FactorCanvas";
import { SequenceCanvas } from "./renderers/sequence/SequenceCanvas";
import { PortableSliderCanvas, SliderCanvas } from "./renderers/slider/SliderCanvas";
import { StateMachineCanvas } from "./renderers/state-machine/StateMachineCanvas";
import { SceneCanvas } from "./renderers/scene/SceneCanvas";
import { Diagram } from "../diagram/Diagram";
import { NetStepCanvas } from "./net-step/NetStepCanvas";
import { parseNetStep } from "./models/net-step";
import { ReplayCanvas } from "./net-m1-replay-setup-checker/ReplayCanvas";
import { AddressBitsCanvas } from "./net-m2-address-bits/AddressBitsCanvas";
import { PacketCanvas } from "./net-m1-packet-dns/PacketCanvas";
import { Sorter } from "./primitives/sorter";
import { BlockMap } from "./primitives/block-map";
import { ContextPicker } from "./primitives/context-picker";
import { FlipDeck } from "./primitives/flip-deck";
import { CommitStory } from "./primitives/commit-story";
import { PhraseFixer } from "./primitives/phrase-fixer";
import { BudgetStack } from "./primitives/budget-stack";
import { SlotCard } from "./primitives/slot-card";
import {
  MAX_PORTABLE_VERSION,
  addrDataSchema,
  blockMapDataSchema,
  budgetStackDataSchema,
  commitStoryDataSchema,
  contextPickerDataSchema,
  diagramDataSchema,
  factorDataSchema,
  flipDeckDataSchema,
  packetDataSchema,
  parsePortable,
  phraseFixerDataSchema,
  portableSliderDataSchema,
  presentationSchema,
  replayDataSchema,
  sceneDataSchema,
  sequenceDataSchema,
  slotCardDataSchema,
  sorterDataSchema,
  stateMachineDataSchema,
  type PresentationOptions,
} from "./models/portable";
import { CANVAS_SLUGS, canvasRegistry, getCanvasSpec, type CanvasSpec } from "./registry";

export type InteractiveCanvasProps = {
  slug?: unknown;
  renderer?: unknown;
  version?: unknown;
  presentation?: unknown;
  data?: unknown;
};

/**
 * <InteractiveCanvas slug="..." /> or <InteractiveCanvas renderer="..." data={...} />
 * from chapter MDX. Looks the slug up in the registry or renders a portable catalog
 * renderer from plain data. Unknown slugs, newer versions, or invalid data render a
 * quiet note instead of crashing, and the chapter's prose still carries the idea.
 */
export function InteractiveCanvas({ slug, renderer, version, presentation, data }: InteractiveCanvasProps) {
  const pres = presentationSchema.safeParse(presentation);
  const presOptions = pres.success ? pres.data : undefined;

  if (typeof version === "number" && version > MAX_PORTABLE_VERSION) {
    return <CanvasVersionNotice version={version} />;
  }

  if (renderer !== undefined) {
    return (
      <PortablePresentationFrame presentation={presOptions}>
        <PortableCanvas renderer={renderer} data={data} />
      </PortablePresentationFrame>
    );
  }

  const spec = getCanvasSpec(slug);
  if (!spec) return <CanvasUnavailable />;
  return (
    <PortablePresentationFrame presentation={presOptions}>
      <CanvasForSpec spec={spec} />
    </PortablePresentationFrame>
  );
}

/** Optional layout, spacing, and sizing wrapper configured from the presentation extensibility bag. */
export function PortablePresentationFrame({
  presentation,
  children,
}: {
  presentation?: PresentationOptions;
  children: ReactNode;
}) {
  if (!presentation) return <>{children}</>;
  const style: CSSProperties = {};
  if (typeof presentation.minHeight === "number") style.minHeight = `${presentation.minHeight}px`;
  if (typeof presentation.maxWidth === "number") {
    style.maxWidth = `${presentation.maxWidth}px`;
    style.marginInline = "auto";
  }
  if (Array.isArray(presentation.padding) && presentation.padding.length === 2) {
    style.paddingBlock = `${presentation.padding[0]}px`;
    style.paddingInline = `${presentation.padding[1]}px`;
  }
  const spacingClass =
    presentation.spacing === "compact"
      ? "my-4"
      : presentation.spacing === "loose"
        ? "my-12"
        : undefined;
  const themeClass =
    presentation.theme === "terminal"
      ? "rounded-xl bg-zinc-950/5 p-2 dark:bg-zinc-900/40"
      : presentation.theme === "muted"
        ? "rounded-xl bg-muted/30 p-3"
        : undefined;

  if (!spacingClass && !themeClass && Object.keys(style).length === 0) {
    return <>{children}</>;
  }
  return (
    <div className={cn(spacingClass, themeClass)} style={style}>
      {children}
    </div>
  );
}

/** Renders a catalog renderer from plain data. Data that fails the renderer's schema shows the quiet fallback. */
function PortableCanvas({ renderer, data }: { renderer: unknown; data: unknown }) {
  const { title = "", purpose = "", limits = "" } = (data ?? {}) as {
    title?: string;
    purpose?: string;
    limits?: string;
  };
  const reject = (problems: string[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[canvas] ${String(renderer)} data rejected:`, problems);
    }
    return <CanvasUnavailable />;
  };

  switch (renderer) {
    case "net-step": {
      const parsed = parseNetStep(data);
      if (!parsed.ok) return reject(parsed.problems);
      return <NetStepCanvas title={title} purpose={purpose} limits={limits} data={data as never} />;
    }
    case "replay": {
      const parsed = parsePortable(replayDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <ReplayCanvas title={title} purpose={purpose} limits={limits} data={parsed.value as never} />;
    }
    case "sequence": {
      const parsed = parsePortable(sequenceDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <SequenceCanvas spec={{ ...parsed.value, kind: "sequence" } as never} />;
    }
    case "state-machine": {
      const parsed = parsePortable(stateMachineDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <StateMachineCanvas spec={{ ...parsed.value, kind: "state-machine" } as never} />;
    }
    case "factor": {
      const parsed = parsePortable(factorDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <FactorCanvas spec={{ ...parsed.value, kind: "factor" } as never} />;
    }
    case "scene": {
      const parsed = parsePortable(sceneDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <SceneCanvas spec={{ ...parsed.value, kind: "scene" } as never} />;
    }
    case "slider": {
      const parsed = parsePortable(portableSliderDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <PortableSliderCanvas data={parsed.value} />;
    }
    case "diagram": {
      const parsed = parsePortable(diagramDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <Diagram kind={parsed.value.diagram} spec={parsed.value.source} />;
    }
    case "addr": {
      const parsed = parsePortable(addrDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return (
        <AddressBitsCanvas
          title={parsed.value.title}
          purpose={parsed.value.purpose}
          limits={parsed.value.limits}
          mode={parsed.value.mode}
          config={parsed.value.config as never}
        />
      );
    }
    case "packet": {
      const parsed = parsePortable(packetDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return (
        <PacketCanvas
          title={parsed.value.title}
          purpose={parsed.value.purpose}
          limits={parsed.value.limits}
          config={parsed.value.config as never}
        />
      );
    }
    case "sorter": {
      const parsed = parsePortable(sorterDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <Sorter {...(parsed.value as unknown as ComponentProps<typeof Sorter>)} />;
    }
    case "block-map": {
      const parsed = parsePortable(blockMapDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <BlockMap {...(parsed.value as unknown as ComponentProps<typeof BlockMap>)} />;
    }
    case "context-picker": {
      const parsed = parsePortable(contextPickerDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <ContextPicker {...(parsed.value as unknown as ComponentProps<typeof ContextPicker>)} />;
    }
    case "flip-deck": {
      const parsed = parsePortable(flipDeckDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <FlipDeck {...(parsed.value as unknown as ComponentProps<typeof FlipDeck>)} />;
    }
    case "commit-story": {
      const parsed = parsePortable(commitStoryDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <CommitStory {...(parsed.value as unknown as ComponentProps<typeof CommitStory>)} />;
    }
    case "phrase-fixer": {
      const parsed = parsePortable(phraseFixerDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <PhraseFixer {...(parsed.value as unknown as ComponentProps<typeof PhraseFixer>)} />;
    }
    case "budget-stack": {
      const parsed = parsePortable(budgetStackDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <BudgetStack {...(parsed.value as unknown as ComponentProps<typeof BudgetStack>)} />;
    }
    case "slot-card": {
      const parsed = parsePortable(slotCardDataSchema, data);
      if (!parsed.ok) return reject(parsed.problems);
      return <SlotCard {...(parsed.value as unknown as ComponentProps<typeof SlotCard>)} />;
    }
    default:
      return reject([`unknown renderer "${String(renderer)}"`]);
  }
}

export function CanvasForSpec({ spec }: { spec: CanvasSpec }) {
  switch (spec.kind) {
    case "sequence":
      return <SequenceCanvas spec={spec} />;
    case "state-machine":
      return <StateMachineCanvas spec={spec} />;
    case "factor":
      return <FactorCanvas spec={spec} />;
    case "scene":
      return <SceneCanvas spec={spec} />;
    case "diagram":
      return <Diagram kind={spec.diagram} spec={spec.source} />;
    case "slider": {
      // Slider specs hold functions, so the client component looks its spec up by slug.
      const slug = CANVAS_SLUGS.find((candidate) => canvasRegistry[candidate] === spec);
      return slug ? <SliderCanvas slug={slug} /> : null;
    }
    case "custom": {
      const Component = spec.component;
      return <Component title={spec.title} purpose={spec.purpose} limits={spec.limits} />;
    }
  }
}

function CanvasVersionNotice({ version }: { version: number }) {
  return (
    <div
      role="note"
      className="not-prose my-8 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
    >
      {`This interactive canvas uses format version ${version} (this app supports up to v${MAX_PORTABLE_VERSION}). Update the app to view the interactive model, or read the surrounding explanation.`}
    </div>
  );
}

function CanvasUnavailable() {
  return (
    <div
      role="note"
      className="not-prose my-8 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
    >
      This interactive part is not available right now. The text around it explains the same idea.
    </div>
  );
}
