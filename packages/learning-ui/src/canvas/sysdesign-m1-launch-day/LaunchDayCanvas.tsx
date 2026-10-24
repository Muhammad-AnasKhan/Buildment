"use client";

import { useRef, useState } from "react";
import { BeatFrame } from "../primitives/beat-frame";
import { TrafficPlayground } from "../primitives/traffic-playground";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  flowDotsPerSecond,
  formatCount,
  launchDay,
  loadTimeLabel,
  STUDENT_LADDER,
  STUDENTS,
  studentsFromFraction,
  studentsToFraction,
  timeAtBusy,
} from "../models/server-load";

const busyText = (busy: number) => `${formatCount(busy * 100)}% busy`;

/** Beat 1 of 1.1: drag the crowd from 10 to 100,000 students and watch one server go from idle to overloaded. */
export function LaunchDayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(ref);
  const [students, setStudents] = useState<number>(STUDENTS.default);
  const m = launchDay(students);
  const time = loadTimeLabel(m);
  const summary = m.steady
    ? `${formatCount(m.students)} students send ${formatCount(m.arrivals)} requests a second to a server that can finish 100. It is ${busyText(m.busy)}, and each request takes ${time} on average. ${m.verdict}.`
    : `${formatCount(m.students)} students send ${formatCount(m.arrivals)} requests a second to a server that can finish 100. The line has no steady length${m.growthPerSec > 0 ? `: it grows by ${formatCount(m.growthPerSec)} requests every second` : ""}, and pages time out.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag across the picture to change the number of <b>students online</b>.</>}>
      <div ref={ref}>
        <TrafficPlayground
          label={title}
          summary={summary}
          seconds={clock.seconds}
          still={clock.reduced}
          source={{ label: "Students", kind: "user", status: `${formatCount(m.students)} online` }}
          server={{ label: "Server", kind: "server", status: busyText(m.busy), tone: m.tone }}
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
            yCaption: "time per request",
            xCaption: "busy",
            xEnds: ["0%", "100%"],
          }}
          aside={{ kind: "crowd", count: m.crowd }}
          slider={{
            label: "Students online",
            valueText: `${formatCount(m.students)} students: ${busyText(m.busy)}, ${time}. ${m.verdict}`,
            value: m.students,
            ladder: STUDENT_LADDER,
            fraction: studentsToFraction(m.students),
            fromFraction: studentsFromFraction,
            onChange: setStudents,
            marks: [
              { at: studentsToFraction(100) },
              { at: studentsToFraction(1000) },
              { at: studentsToFraction(10_000) },
              { at: studentsToFraction(2000), label: "full", tone: "bad" },
            ],
            ends: ["10", "100,000"],
            caption: "students online",
          }}
        />
      </div>
    </BeatFrame>
  );
}
