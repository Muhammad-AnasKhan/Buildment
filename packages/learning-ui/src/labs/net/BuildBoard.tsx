"use client";

// Build mode for the network lab. The learner places hosts, switches and
// routers on a canvas, cables them, sets addresses and routes, then runs the
// network: it becomes a World, a terminal opens on every host and router, and
// the lab's goals are scored with the same engine the other net labs use.

import { useMemo, useRef, useState } from "react";
import type { NetLabSpec } from "../types";
import type { GoalResult } from "./build-goals";
import { evaluateGoals } from "./build-goals";
import {
  addCable,
  addDevice,
  deviceById,
  describeEnd,
  emptyBuild,
  moveDevice,
  partById,
  removeCable,
  removeDevice,
  seedToState,
  toTopology,
} from "./build-model";
import type { BuildState } from "./build-model";
import type { Selection } from "./BuildCanvas";
import { BuildCanvas } from "./BuildCanvas";
import { BuildGoals } from "./BuildGoals";
import { BuildPalette } from "./BuildPalette";
import { BuildSettings } from "./BuildSettings";
import { BuildSolutionPanel } from "./BuildSolution";
import { BuildTerminal } from "./BuildTerminal";
import type { World } from "./model";
import { buildWorld } from "./model";

const button = "min-h-9 rounded-lg border border-border px-3 py-1 text-sm font-medium hover:bg-muted";

export function BuildBoard({ spec }: { spec: NetLabSpec }) {
  const parts = useMemo(() => spec.palette ?? [], [spec.palette]);
  const goals = useMemo(() => spec.goals ?? [], [spec.goals]);
  const names = useMemo(() => Object.fromEntries(parts.map((p) => [p.id, p.label])), [parts]);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState<BuildState>(emptyBuild);
  const [selected, setSelected] = useState<Selection>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [phase, setPhase] = useState<"edit" | "run">("edit");
  const [world, setWorld] = useState<World | null>(null);
  const [runId, setRunId] = useState(0);
  const [shell, setShell] = useState("");
  const [note, setNote] = useState("");

  const results: GoalResult[] | null = useMemo(() => (world ? evaluateGoals(world, goals, names) : null), [world, goals, names]);
  const allPass = !!results && results.length > 0 && results.every((r) => r.pass);
  const running = phase === "run";

  // ---- editing ---------------------------------------------------------------

  function clearPicks() {
    setArmed(null);
    setPending(null);
  }

  function placePart(partId: string, x: number, y: number) {
    const part = partById(parts, partId);
    if (!part) return;
    const added = addDevice(state, part, x, y);
    if (!added) {
      setNote(`There is no ${part.label} left to place.`);
      return;
    }
    setState(added.state);
    setSelected({ type: "device", id: added.device.id });
    clearPicks();
    setNote(`${added.device.label} placed on the canvas and selected. Its settings are below.`);
  }

  function arm(id: string | null) {
    setPending(null);
    setArmed(id);
    const part = id ? partById(parts, id) : undefined;
    setNote(part ? `${part.label} picked up. Tap the canvas, or focus it and press Enter, to place it.` : "Nothing picked up.");
  }

  function connect(from: string, to: string) {
    const made = addCable(state, from, to);
    setPending(null);
    if ("error" in made) {
      setNote(made.error);
      return;
    }
    setState(made.state);
    setNote(`Cabled ${describeEnd(made.state, made.cable.a)} to ${describeEnd(made.state, made.cable.b)}.`);
  }

  function startCable(id: string) {
    if (pending === id) {
      setPending(null);
      setNote("Cable cancelled.");
      return;
    }
    setArmed(null);
    setPending(id);
    setNote(`Cabling from ${deviceById(state, id)?.label}. Select the other device to finish, or press Escape to cancel.`);
  }

  function activate(id: string) {
    const device = deviceById(state, id);
    if (!device) return;
    if (running) {
      if (device.kind === "switch") setNote(`${device.label} is a switch and has no terminal.`);
      else {
        setShell(id);
        setNote(`Terminal on ${device.label}.`);
      }
      return;
    }
    if (pending && pending !== id) {
      connect(pending, id);
      return;
    }
    if (pending === id) {
      setPending(null);
      return;
    }
    setSelected({ type: "device", id });
    setNote(`${device.label} selected. Its settings are below.`);
  }

  function dropDevice(id: string) {
    const device = deviceById(state, id);
    setState(removeDevice(state, id));
    if (selected?.type === "device" && selected.id === id) setSelected(null);
    if (pending === id) setPending(null);
    setNote(`${device?.label ?? "Device"} and its cables removed.`);
  }

  function dropCable(a: string) {
    const cable = state.cables.find((c) => c.a === a);
    setState(removeCable(state, a));
    if (selected?.type === "cable" && selected.id === a) setSelected(null);
    setNote(cable ? `Cable between ${describeEnd(state, cable.a)} and ${describeEnd(state, cable.b)} removed.` : "Cable removed.");
  }

  function cancel() {
    clearPicks();
    setSelected(null);
  }

  // ---- running ---------------------------------------------------------------

  function run() {
    const next = buildWorld(toTopology(state, parts));
    const shells = Object.values(next.devices).filter((d) => d.kind !== "switch");
    const first = shells.find((d) => d.id === spec.startDevice) ?? shells[0];
    const scored = evaluateGoals(next, goals, names);
    clearPicks();
    setSelected(null);
    setWorld(next);
    setShell(first?.id ?? "");
    setRunId((n) => n + 1);
    setPhase("run");
    setNote(`Network running. ${scored.filter((r) => r.pass).length} of ${goals.length} goals pass.`);
  }

  function edit() {
    setPhase("edit");
    setWorld(null);
    setNote("Back to editing. Your canvas is as you left it.");
  }

  function reset() {
    setState(emptyBuild());
    setSelected(null);
    clearPicks();
    setPhase("edit");
    setWorld(null);
    setNote("Canvas cleared.");
  }

  function loadSolution() {
    const seed = spec.solution?.build?.seed;
    if (!seed) return;
    setState(seedToState(seed, parts));
    setSelected(null);
    clearPicks();
    setPhase("edit");
    setWorld(null);
    setNote("The solution is on the canvas. Press Run to check it.");
  }

  const armedPart = armed ? partById(parts, armed) : undefined;
  const pendingDevice = pending ? deviceById(state, pending) : undefined;

  return (
    <div className="@container w-full space-y-3 rounded-2xl border border-border bg-background p-3">
      {spec.tasks && spec.tasks.length > 0 && (
        <ol className="list-decimal space-y-1 rounded-xl bg-muted/50 px-8 py-2 text-sm">
          {spec.tasks.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      )}
      {running && allPass && (
        <div className="rounded-xl border border-emerald-500 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          Every goal passes. The network you built works.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!running && (
          <BuildPalette parts={parts} state={state} armed={armed} canvasRef={canvasRef} onArm={arm} onDrop={placePart} onNote={setNote} />
        )}
        <div className="ml-auto flex gap-2">
          {running ? (
            <button type="button" onClick={edit} className={button}>
              Back to editing
            </button>
          ) : (
            <button type="button" onClick={run} className="min-h-9 rounded-lg bg-violet-600 px-4 py-1 text-sm font-medium text-white">
              Run the network
            </button>
          )}
          <button type="button" onClick={reset} className={button}>
            Reset
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-xs text-muted-foreground">
        {note ||
          (armedPart
            ? `${armedPart.label} picked up. Tap the canvas to place it.`
            : pendingDevice
              ? `Cabling from ${pendingDevice.label}. Select the other device to finish.`
              : running
                ? "Select a device to open its terminal."
                : "Drag a part onto the canvas, or select a part and then the canvas.")}
      </p>

      <BuildCanvas
        state={state}
        selected={selected}
        pending={pending}
        armed={armed}
        armedLabel={armedPart?.label}
        readOnly={running}
        focusId={running ? shell : undefined}
        canvasRef={canvasRef}
        onPlace={(x, y) => armed && placePart(armed, x, y)}
        onMove={(id, x, y) => setState((s) => moveDevice(s, id, x, y))}
        onActivate={activate}
        onSelectCable={(id) => {
          setSelected({ type: "cable", id });
          setNote("Cable selected. Remove it from the settings below.");
        }}
        onConnect={connect}
        onStartCable={startCable}
        onRemoveDevice={dropDevice}
        onRemoveCable={dropCable}
        onCancel={cancel}
        onNote={setNote}
      />

      {!running && state.cables.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Cables">
          {state.cables.map((c) => (
            <li key={c.a} className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1 font-mono text-xs">
              {describeEnd(state, c.a)} to {describeEnd(state, c.b)}
              <button
                type="button"
                onClick={() => dropCable(c.a)}
                aria-label={`Remove the cable from ${describeEnd(state, c.a)} to ${describeEnd(state, c.b)}`}
                className="min-h-7 rounded-md px-1.5 text-muted-foreground hover:bg-muted"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {running && world ? (
          <>
            <BuildGoals goals={goals} results={results} />
            <BuildTerminal key={runId} world={world} selected={shell} suggested={spec.suggested} onSelect={setShell} onWorld={setWorld} />
          </>
        ) : (
          <>
            <section className="rounded-xl border border-border bg-card p-3" aria-label="Settings">
              <BuildSettings
                state={state}
                selected={selected}
                onChange={setState}
                onRemoveDevice={dropDevice}
                onRemoveCable={dropCable}
              />
            </section>
            <BuildGoals goals={goals} results={null} />
          </>
        )}
      </div>

      {spec.solution?.build && <BuildSolutionPanel solution={spec.solution} onLoad={loadSolution} />}
    </div>
  );
}
