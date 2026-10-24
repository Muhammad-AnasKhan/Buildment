# Canvas spec: sysdesign-m27-backlog-play

- **Course and chapter:** system-design, module 27, chapter 27.3 beat 5, "Drag the uploads, watch the backlog".
- **Renderer:** custom beat canvas on `BeatFrame`, composed in the shape of `sysdesign-m15-backlog-play`: `SvgNode` cards, two `SnapStopsRail` rails inside the picture, a backlog chart drawn in SVG, dots from `flowDots` of the knee model (`models/server-load.ts`). Pure model in `models/lamha-backlog.ts`, course numbers in `models/lamha-numbers.ts`.
- **Claim:** The transcode line grows by uploads minus capacity during the busy hour, and shrinks afterwards only by the spare capacity, so the wait at the end of the busy hour is the backlog divided by the capacity.

## Model

A video is one job of 15 worker-minutes = 900 worker-seconds, so W machines finish W / 900 videos a second. The day has three hours in one-minute steps: hour 1 at the chosen rate, hours 2 and 3 at the average of 5.8 a second.

- Each minute: backlog = max(0, backlog + (arrivals - capacity) x 60).
- Wait at the end of hour 1 = backlog at minute 60 / capacity, in minutes.
- Empty at = the first minute after 60 at which the backlog, rounded to the nearest 0.5 video, is 0.
- The wait is judged in whole minutes, as it is written: a wait of 10.2 minutes reads "10 min" and counts as inside the 10 minute target.

## Inputs

- Uploads a second in the busy hour, on a snap rail: 5.8 (average), 11.6, 17.4 (peak, 3 times), 26, 35 (default 17.4).
- Transcode machines, on a snap rail: 4,000, 8,000, 12,000, 16,000, 20,000 (default 12,000).
- Arrow keys step one snap; Home and End jump to the ends. No control outside the picture.

## Picture

Top: Uploads, Queue and Workers cards joined by lanes; dots run into the queue at a speed set by the arrival rate and leave at a speed set by how busy the machines are (knee model). Ten small squares under the queue fill as the wait grows to an hour. A playhead sweeps the three hours and the cards show the state at the playhead (a still picture rests at the end of the busy hour). Middle: a line chart of videos waiting over 180 minutes, the busy hour shaded, a dashed line at the 10 minute wait target (backlog = 10 x 60 x capacity), a marker at minute 60 labelled with the backlog and the wait, and a marker where the line returns to zero or the text "not empty within 3 hours". The chart top rescales (10k to 200k) so a small backlog is still visible. Bottom: the two rails.

## Numbers (tested)

| Uploads a second | Machines | Capacity a second | Backlog at end of hour 1 | Wait | Empty at |
|---|---|---|---|---|---|
| 5.8 | 4,000 | 4.44 | 4,880 | 18 min | not within 3 hours |
| 5.8 | 8,000 | 8.89 | 0 | 0 | no backlog |
| 11.6 | 8,000 | 8.89 | 9,760 | 18 min | minute 113 |
| 17.4 | 12,000 | 13.33 | 14,640 | 18 min | minute 93 |
| 17.4 | 16,000 | 17.78 | 0 | 0 | no backlog |
| 26 | 12,000 | 13.33 | 45,600 | 57 min | minute 161 |
| 26 | 20,000 | 22.22 | 13,600 | 10 min | minute 74 |
| 35 | 20,000 | 22.22 | 46,000 | 34 min | minute 107 |

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| backlog still above 0 at minute 180 (checked first) | Line never empties: add machines (bad) |
| backlog at the end of hour 1 is 0 | No backlog: watchable at once (good) |
| wait of 10 minutes or less | Wait of 8 min: inside the target (good) |
| wait over 10 and under 60 minutes | Wait of 18 min: over the target (warn) |
| wait of 60 minutes or more | Wait of 97 min: far over the target (bad) |

All verdicts are 38 characters or fewer for every combination of the rails (tested). The "far over" verdict needs a wait of an hour and a line that empties within 3 hours; inside the rails this cannot happen, so it stays in the model for a builder who widens them.

## Accessibility

- Both rails are `role="slider"` with value text such as "17.4 uploads a second, 12,000 machines, 14,640 videos waiting after one hour, a wait of 18 minutes, empty at minute 93".
- Reduced motion: the chart is drawn complete, the playhead rests at the end of the busy hour, and no dots move.
- Colour sits next to words (verdict, marker labels).

## Sources

Arithmetic on course assumptions; the model is the backlog model of chapter 15.2, with Little's law [S5]. Queues deliver at least once [S83].
