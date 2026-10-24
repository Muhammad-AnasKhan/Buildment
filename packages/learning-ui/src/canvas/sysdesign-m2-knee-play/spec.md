# Canvas spec: sysdesign-m2-knee-play

- **Course and chapter:** system-design, 2.5 ("Queues, utilisation and Little's law"), for the knee beat. New slug; the lead registers it. It can sit beside or replace `sysdesign-m2-utilisation-knee` (the watched scene), whose numbers it matches.
- **Renderer:** custom beat canvas on `BeatFrame`, built on the reusable `primitives/traffic-playground.tsx` (also used by `sysdesign-m1-launch-day`).
- **Claim:** The time a request spends in the system depends on the spare capacity, not on how busy the server is: halve the spare and the wait doubles, so it bends up sharply near 100% (the knee). Little's law, L = lambda x W, holds at every steady point.
- **Input:** arrivals, 10 to 120 requests a second on a linear rail inside the picture, step 1, snapping to 50 and 90. Arrow keys step by 1, Page keys by 10, Home and End go to the ends. Default 50. The rail marks 100 as "max 100".
- **Model** (`models/server-load.ts`, `kneePlay`): mu = 100 a second (10 ms each); rho = lambda / 100; W = 10 ms / (1 - rho) = 1 / (mu - lambda); L = rho / (1 - rho). Past 100% there is no steady state: the line grows by (lambda - 100) every second.
- **Numbers to check against the chapter:** 50 a second: W = 20 ms, L = 1. 80: 50 ms, L = 4. 90: 100 ms, L = 9. 95: 200 ms, L = 19. 99: 1,000 ms, L = 99. Little's law chip: "9 = 90/s × 0.1 s", "99 = 99/s × 1 s".
- **On the suggested verdict "Past 80%, every 5% doubles the wait":** not used, because it is false for M/M/1: 80% to 85% takes the wait from 50 to 67 ms (x1.33). What is true is that halving the spare capacity doubles the wait (90% to 95%: 100 to 200 ms; 80% to 90%: 50 to 100 ms).
- **Picture:** a Users card sends request dots to the Server card at a rate that follows the load; the line in front of the server shows L as dots (up to 12, then an ellipsis); the server's pill shows L ("9 inside") and turns amber from 80% and red from 95%; an inset curve of time in the system against busy has a dot that rides it and pins to the top with an arrow above 200 ms; a note card shows Little's law with the live numbers. Past 100 a second the line grows to full and requests drop out as timeouts.
- **Numbers visible at once:** the arrival rate (Users pill), L (Server pill), W (curve dot); the Little's law chip multiplies the first and the third to give the second.
- **Verdict:** under 50% "Calm: requests rarely wait"; under 80% "Fine: a short line forms"; under 100% "Past the knee: the wait explodes"; at or past 100% "Over 100%: the line never ends".
- **Motion and reduced motion:** as in `sysdesign-m1-launch-day` (shared primitive).
- **Accessibility:** one `role="slider"` with a value text that gives the rate, busy share, time and verdict; SVG title and a description that includes Little's law with the numbers.
- **Sources:** [S6] MIT OCW M/M/1 notes; [S7] Brooker, Latency Sneaks Up On You; [S5] Little, Little's Law as Viewed on Its 50th Anniversary.
