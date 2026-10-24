# Canvas spec: sysdesign-m11-overlap-or-not

- **Course and chapter:** system-design, 11.2, beat 3 "Overlap means either answer is fine".
- **Renderer:** custom beat canvas on `BeatFrame`; `PictureSlider` for the drag, the shared history picture (`primitives/history-view.tsx`) inside. Rules in `models/overlap-or-not.ts` and `models/history.ts`.
- **Claim:** A read that overlaps a write may return the old or the new value. A read entirely before the write sees only the old value, and one entirely after sees only the new one.
- **Model:** lanes Ada and Ben, axis 0 to 100. Ada writes x = 1 from 30 to 60. Ben's read has length 20 and starts at s from 0 to 80 in steps of 5 (default 40). Before: s + 20 < 30 (s = 0 or 5), may return 0. Overlap: 10 <= s <= 60 (touching counts), may return 0 or 1. After: s > 60 (65 to 80), may return 1.
- **Input:** drag anywhere on the picture and the read follows (slider role; arrow keys step by 5, Home and End go to the ends). One control outside the picture: Reset. Hint: "Drag Ben's read left and right."
- **What moves:** the read bar, a bracket under each bar for the window in which it takes effect (30 to 60 and s to s + 20), and the "may return" chip.
- **Verdicts:** "Read finished first: only 0", "Overlap: 0 or 1 are both fine", "Write finished first: only 1".
- **Accessibility:** one `role="slider"` with the read's start and end, the verdict and the allowed values in its value text; the SVG has a title and a description.
- **Sources:** [S47].
