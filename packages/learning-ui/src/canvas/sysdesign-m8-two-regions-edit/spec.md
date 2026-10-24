# Canvas spec: sysdesign-m8-two-regions-edit

- **Course and chapter:** system-design, 8.6 beat 2 ("Two regions edit one document").
- **Renderer:** custom component on `BeatFrame` and `useBeatClock`, with `RailSlider` from the picture-slider family: the Singapore lane is the rail and the Singapore edit is the handle. A custom two-lane timeline drawing.
- **Claim:** two leaders conflict when each accepts its edit before the other's copy arrives, which is when the edits are closer together than the one-way copy time. Last writer wins settles it by silently dropping one edit.
- **Model (`model.ts`):** the EU edit is at t = 0. A copy takes 80 ms one way, half of the 160 ms EU West to Singapore round trip [S3]. The Singapore edit is at t = b, from -150 to +150 ms in 5 ms steps (default 12). Conflict if and only if |b| < 80 ms. With the rule on, the edit with the larger timestamp is kept (Singapore for b > 0, EU for b < 0, EU at b = 0) and the other is dropped with no message.
  - Worked values: b = 12: conflict, Singapore kept, EU dropped. b = -40: conflict, EU kept. b = 79 would conflict (the rail steps by 5, so 75 is the last conflict). b = 80: no conflict.
- **Inputs:** drag the Singapore edit along its lane (5 ms steps, marks at -80, 0 and +80; arrow keys, Page keys, Home, End); outside the picture one toggle "Rule: none / last writer wins".
- **What moves:** a cursor sweeps the axis and copy dots travel between the lanes; where a copy lands, a ring marks the landing: red "!" when the edits clash, green "ok" when not; with the rule on, the dropped edit fades, goes dashed red and is struck through, and the value text says "kept" or "lost".
- **Verdicts:** "Concurrent: neither saw the other"; "Second edit saw the first: no clash"; "Later edit kept; the other is lost".
- **Deviations from the written spec:** the soft snaps at -80, 0 and +80 are marks on the rail, not a pull, because the 5 ms step already lands on them and a pull would hide the last conflicting values (75, 70). The toggle is a `BeatButton` with `aria-pressed`. The default is 12 ms and is not a multiple of 5, so the first arrow key goes to 15 or 10.
- **Accessibility:** the lane is a real `role="slider"` with `aria-valuetext` giving the time and the verdict; the toggle is a button; red is paired with "!" and with words in the verdict.
- **Sources:** [S3] 160 ms round trip EU West to Singapore; [S43] any Region accepts writes, last writer wins per item; [S52] last writer wins implies data loss with concurrent updates.
