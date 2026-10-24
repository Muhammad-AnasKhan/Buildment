# Canvas spec: sysdesign-m16-bulkhead-pools

- **Course and chapter:** system-design, 16.5 beat 4, "Drag the wall between the pools". Playable; new slug.
- **Renderer:** custom beat canvas on `BeatFrame`: 50 worker dots in a 10 by 5 grid with a stepped wall line after the first P, a tappable Picks card, two bars (payments served, home page served), a `TightRailSlider` with `SliderRail` for the wall, `VerdictBanner`. No control outside the picture.
- **Claim:** With one shared pool, a slow dependency used by the home page starves payments that never call it. A wall (a separate pool for payments) keeps payments served, and it costs idle capacity.
- **Input:** payment pool size P on a rail from 0 to 45 workers (0 means one shared pool; marks at 0, 2, 5, 10, 20, 30, 45; arrow keys step 1, Page keys 5; default 0). Tap Picks to switch slow and healthy (default slow).
- **Model** (`model.ts`, `serve`): 50 workers. Payments 20 a second at 0.1 s (needs 2 workers). Home 80 a second at 0.1 s healthy and 3 s slow. Shared pool: every kind served at s = min(1, 50 / (20 x 0.1 + 80 x h)). Walled: payments = min(1, P / 0.1 / 20), home = min(1, (50 minus P) / h / 80).
- **Numbers to check** (tested): healthy: P 0 and 10 give 100%, 100%, total 100; P 45 gives 100%, 62.5%, total 70. Slow: P 0 gives 20.7% both, total 20.7; P 1 gives 50% and 20.4%, total 26.3; P 2 gives 100% and 20.0%, total 36.0; P 5: 18.8%, 35.0; P 10: 16.7%, 33.3; P 20: 12.5%, 30.0; P 30: 8.3%, 26.7; P 45: 2.1%, 21.7. Payments need only 2 workers, so extra workers in the payment pool sit idle.
- **Dots:** green is payments work (at most 2), blue is home work, red pulses when a worker is held by slow Picks, grey is idle.
- **Verdicts:** shared and slow "Only 21% of payments get through" (bad); walled and slow "Payments safe: 100% served" (good); P of 1 "Payment pool too small: 50%" (warn); healthy "Both fine: nothing is slow" (good). One addition to the spec: healthy with a wall so big that the home page loses capacity (P above 42) says "Wall too big: home gets 62%" (warn), because the cost of the wall is the point.
- **Reduced motion:** the wall jumps and dots change colour without pulsing or moving.
- **Accessibility:** the wall is a `role="slider"` with value text "10 workers for payments, payments 100 percent served, home 16.7 percent".
- **Sources:** bulkhead pattern [S93]; Little's law from chapter 2.5. The challenge measures the same effect: 41% of payments with a shared pool and 100% with a wall (part 3).
