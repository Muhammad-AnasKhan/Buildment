"use client";

import { useRef, useState } from "react";
import { BeatFrame } from "../primitives/beat-frame";
import { TrafficPlayground } from "../primitives/traffic-playground";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  ARRIVAL_LADDER,
  ARRIVALS,
  arrivalsFromFraction,
  arrivalsToFraction,
  flowDotsPerSecond,
  formatCount,
  kneePlay,
  loadTimeLabel,
  timeAtBusy,
  twoFigures,
} from "../models/server-load";

/** 2.5: drag requests a second toward the server's 100 and watch the line and the wait bend up at the knee. */
export function KneePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(ref);
  const [arrivals, setArrivals] = useState<number>(ARRIVALS.default);
  const m = kneePlay(arrivals);
  const time = loadTimeLabel(m);
  const busy = `${formatCount(m.busy * 100)}% busy`;
  const inside = m.steady ? `${twoFigures(m.inside)} inside` : "overloaded";
  const summary = m.steady
    ? `${formatCount(m.arrivals)} requests a second reach a server that can finish 100, so it is ${busy}. On average ${twoFigures(m.inside)} requests are inside and each spends ${time}. Little's law: ${m.little}. ${m.verdict}.`
    : `${formatCount(m.arrivals)} requests a second reach a server that can finish 100. There is no steady state: the line keeps growing${m.growthPerSec > 0 ? ` by ${formatCount(m.growthPerSec)} every second` : ""}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag across the picture to change <b>requests a second</b>.</>}>
      <div ref={ref}>
        <TrafficPlayground
          label={title}
          summary={summary}
          seconds={clock.seconds}
          still={clock.reduced}
          source={{ label: "Users", kind: "user", status: `${formatCount(m.arrivals)} a second` }}
          server={{ label: "Server", kind: "server", status: inside, tone: m.tone }}
          flow={{
            arrivalDots: flowDotsPerSecond(m.busy),
            serviceDots: flowDotsPerSecond(Math.min(1, m.busy)),
            inside: m.inside,
            growing: !m.steady,
            tone: m.tone,
          }}
          verdict={{ text: m.verdict, tone: m.tone }}
          curve={{
            f: (b) => timeAtBusy(b),
            xMax: 1,
            yMax: 200,
            x: m.busy,
            label: time,
            tone: m.tone,
            yCaption: "time in the system",
            xCaption: "busy",
            xEnds: ["0%", "100%"],
          }}
          aside={{ kind: "note", title: "Little's law, L = λ × W", formula: "inside = rate × time", value: m.little, tone: m.tone }}
          slider={{
            label: "Requests a second",
            valueText: `${formatCount(m.arrivals)} a second: ${busy}, ${time}. ${m.verdict}`,
            value: m.arrivals,
            ladder: ARRIVAL_LADDER,
            fraction: arrivalsToFraction(m.arrivals),
            fromFraction: arrivalsFromFraction,
            onChange: setArrivals,
            marks: [{ at: arrivalsToFraction(50) }, { at: arrivalsToFraction(90) }, { at: arrivalsToFraction(100), label: "max 100", tone: "bad" }],
            ends: ["10", "120"],
            caption: "requests a second",
          }}
        />
      </div>
    </BeatFrame>
  );
}
