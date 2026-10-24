"use client";

import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CanvasFrame, CanvasNotes } from "../primitives/canvas-frame";
import { initialTimeInputs, timeComparison, type ProviderZone, type TimeInputs, type ViewerZone, type Week } from "./model";

const weeks: Array<{ value: Week; label: string }> = [
  { value: "2024-03-25", label: "Week of 25 March 2024" },
  { value: "2024-04-01", label: "Week of 1 April 2024" },
];

export function SkillSlotTimeCanvas({ title, purpose, limits }: { title: string; purpose: string; limits: string }) {
  const [inputs, setInputs] = useState<TimeInputs>(initialTimeInputs);
  const providerId = useId();
  const viewerId = useId();
  const weekId = useId();
  const result = timeComparison(inputs);
  const previousWeek: Week = inputs.week === "2024-03-25" ? "2024-04-01" : "2024-03-25";
  const otherWeek = timeComparison({ ...inputs, week: previousWeek });
  const sameUtcAcrossWeeks = result.utc.slice(11, 16) === otherWeek.utc.slice(11, 16);

  return (
    <CanvasFrame eyebrow="Explore" title={title} purpose={purpose}>
      <p className="text-sm leading-6 text-foreground/85">
        The provider&apos;s weekly rule stays Monday at 09:00 in their own zone. A dated appointment has one UTC instant.
        Move the week or the viewer to see which value changes.
      </p>

      <div aria-live="polite" className="mt-5 grid gap-3 sm:grid-cols-3">
        <Readout label="Provider rule on this date" value={result.provider} zone={inputs.providerZone} />
        <Readout label="Stored instant" value={result.utc.replace(".000Z", "Z")} zone="UTC" />
        <Readout label="Viewer sees" value={result.viewer} zone={inputs.viewerZone} />
      </div>

      <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4" role="img" aria-label={`Provider Monday at 09:00 in ${inputs.providerZone} resolves to ${result.utc}; the viewer in ${inputs.viewerZone} sees ${result.viewer}.`}>
        <div className="grid items-center gap-2 text-center text-sm font-medium sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <span className="rounded-lg border border-border bg-card px-3 py-3">Provider 09:00<br /><span className="text-xs font-normal text-muted-foreground">local wall clock</span></span>
          <span aria-hidden className="text-muted-foreground">→</span>
          <span className="rounded-lg border border-border bg-card px-3 py-3">{result.utc.slice(11, 16)} UTC<br /><span className="text-xs font-normal text-muted-foreground">one instant</span></span>
          <span aria-hidden className="text-muted-foreground">→</span>
          <span className="rounded-lg border border-border bg-card px-3 py-3">{result.viewer.match(/\d{2}:\d{2}/)?.[0]}<br /><span className="text-xs font-normal text-muted-foreground">viewer wall clock</span></span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label htmlFor={providerId} className="rounded-xl border border-border bg-card p-3 text-sm font-medium">Provider zone
          <select id={providerId} value={inputs.providerZone} onChange={event => setInputs(old => ({ ...old, providerZone: event.target.value as ProviderZone }))} className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="Europe/Berlin">Berlin</option><option value="Asia/Gaza">Gaza</option>
          </select>
        </label>
        <label htmlFor={viewerId} className="rounded-xl border border-border bg-card p-3 text-sm font-medium">Viewer zone
          <select id={viewerId} value={inputs.viewerZone} onChange={event => setInputs(old => ({ ...old, viewerZone: event.target.value as ViewerZone }))} className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="Asia/Qatar">Qatar</option><option value="Europe/Berlin">Berlin</option><option value="Europe/London">London</option>
          </select>
        </label>
        <label htmlFor={weekId} className="rounded-xl border border-border bg-card p-3 text-sm font-medium">Dated week
          <select id={weekId} value={inputs.week} onChange={event => setInputs(old => ({ ...old, week: event.target.value as Week }))} className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {weeks.map(week => <option key={week.value} value={week.value}>{week.label}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <p aria-live="polite" className="max-w-xl text-sm leading-6 text-foreground/85">
          What changed? The provider still starts at 09:00 locally. {sameUtcAcrossWeeks ? "The selected weeks resolve to the same UTC time in this provider zone." : `Across these weeks, the UTC start changes from ${otherWeek.utc.slice(11, 16)} to ${result.utc.slice(11, 16)} because the zone rules changed.`} Changing only the viewer zone changes the display, not the stored instant.
        </p>
        <button type="button" onClick={() => setInputs(initialTimeInputs)} disabled={JSON.stringify(inputs) === JSON.stringify(initialTimeInputs)} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><RotateCcw className="size-3.5" aria-hidden /> Reset</button>
      </div>
      <div className="mt-5"><CanvasNotes tryThis={["Keep Berlin as provider and move the dated week. Predict the UTC time before you change it.", "Keep the week fixed and switch the viewer between Qatar and London. The UTC instant must stay the same.", "Switch the provider to Gaza. Compare its local 09:00 with Berlin across the two weeks."]} limits={limits} /></div>
    </CanvasFrame>
  );
}

function Readout({ label, value, zone }: { label: string; value: string; zone: string }) {
  return <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-base font-semibold tabular-nums text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{zone}</p></div>;
}
