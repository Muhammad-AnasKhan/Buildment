"use client";

// A small terminal over the built network: pick a host or router, type real
// commands, and the same command runner the other net labs use answers. Any
// command hands the new World back so the goals re-check straight away.

import { useRef, useState } from "react";
import { prompt, runCommand } from "./commands";
import type { World } from "./model";
import { cloneWorld } from "./model";

interface LogEntry {
  device: string;
  command: string;
  output: string;
}

interface Props {
  world: World;
  selected: string;
  suggested?: string[];
  onSelect: (id: string) => void;
  onWorld: (next: World) => void;
}

export function BuildTerminal({ world, selected, suggested, onSelect, onWorld }: Props) {
  const shells = Object.values(world.devices).filter((d) => d.kind !== "switch");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [line, setLine] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyAt, setHistoryAt] = useState(-1);
  const scroller = useRef<HTMLDivElement>(null);
  const device = world.devices[selected];
  const mine = log.filter((e) => e.device === selected);

  function run(command: string) {
    const text = command.trim();
    if (!text || !device) return;
    if (text === "clear") {
      setLog((l) => l.filter((e) => e.device !== selected));
      return;
    }
    const next = cloneWorld(world);
    const result = runCommand(next, selected, text);
    onWorld(next);
    setLog((l) => [...l, { device: selected, command: text, output: result.output }]);
    setHistory((h) => [...h, text]);
    setHistoryAt(-1);
    requestAnimationFrame(() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight }));
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      run(line);
      setLine("");
    } else if (e.key === "ArrowUp" && history.length > 0) {
      e.preventDefault();
      const at = historyAt < 0 ? history.length - 1 : Math.max(0, historyAt - 1);
      setHistoryAt(at);
      setLine(history[at]);
    } else if (e.key === "ArrowDown" && historyAt >= 0) {
      e.preventDefault();
      const at = historyAt + 1;
      setHistoryAt(at >= history.length ? -1 : at);
      setLine(at >= history.length ? "" : history[at]);
    }
  }

  if (shells.length === 0 || !device) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-4 font-mono text-[12px] text-zinc-400">
        There is no host or router to open a terminal on. Go back and place one.
      </div>
    );
  }

  return (
    <div className="flex min-h-[20rem] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 px-2 py-1.5" role="tablist" aria-label="Terminals">
        {shells.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === selected}
            onClick={() => onSelect(d.id)}
            className={`min-h-8 rounded-md px-2 py-0.5 font-mono text-xs ${d.id === selected ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:bg-zinc-800"}`}
          >
            {d.id}
          </button>
        ))}
      </div>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-relaxed" aria-live="polite">
        {mine.length === 0 && <p className="text-zinc-500">Type a command, for example ip addr, then press Enter. Type help for the list.</p>}
        {mine.map((e, i) => (
          <div key={i} className="mb-2">
            <div>
              <span className="text-emerald-400">{prompt(device)}</span>
              {e.command}
            </div>
            {e.output && <pre className="whitespace-pre-wrap break-words text-zinc-200">{e.output}</pre>}
          </div>
        ))}
      </div>
      {suggested && suggested.length > 0 && (
        <div className="flex flex-wrap gap-1 border-t border-zinc-800 px-2 py-1.5">
          {suggested.map((s) => (
            <button key={s} type="button" onClick={() => run(s)} className="min-h-8 rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-200 hover:bg-zinc-700">
              {s}
            </button>
          ))}
        </div>
      )}
      <label className="flex items-center gap-1 border-t border-zinc-800 px-3 py-2 font-mono text-[12px]">
        <span className="text-emerald-400">{prompt(device)}</span>
        <input
          value={line}
          onChange={(e) => setLine(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label={`Command for ${selected}`}
          className="min-w-0 flex-1 bg-transparent text-zinc-100 outline-none"
        />
      </label>
    </div>
  );
}
