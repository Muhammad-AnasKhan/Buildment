# Canvas spec: product-m2-large-text

- **Course and chapter:** product-sense, 2.5 "Colour with a job, contrast you can measure", the third beat (an extra canvas).
- **Renderer:** custom, on the reusable specimen compare beat, with a screen on `background: "paper"` and literal text colours (`models/ui-specimen.ts`). This folder holds only data. Reason: the bar a text pair must meet depends on the size of the text, and a learner sees that best with one grey at three sizes. The page is white in both themes so the ratio stays true.
- **Claim:** The same colour pair passes or fails depending on the size of the text. Normal text needs 4.5 to 1. Large text (at least 18 point, about 24 CSS pixels, or 14 point bold, about 18.7 pixels) needs 3 to 1.
- **Model:** a card with the heading "Court hours" (15 bold, #111111) and the sentence "Open Thursday and Friday until 6 pm" in #858585 on white, which is 3.69 to 1 by `contrastRatio()`. Three versions: 14 regular (normal text, needs 4.5, fails), 24 regular (large text, needs 3, passes), 19 bold (large bold text, needs 3, passes). Verdicts: "3.69:1 needs 4.5: fails" (bad), "3.69:1 needs 3: passes" (good), "Large and bold: passes 3" (good).
- **Inputs:** three pills (14 plain, 24 plain, 19 bold).
- **What changes:** the size and weight of the grey sentence, and the verdict. The colour never changes.
- **What the learner should notice:** nothing about the colour changed, yet the answer did; and bold at 16 is not large, because the line for bold text is about 18.7 pixels.
- **Accessibility:** the pills form a labelled group; a polite live region reads each version and verdict; the SVG has a title; text at least 14 units. The ratio and the bar are also in words in the verdict.
- **Limits (fold):** the sizes are drawn units, close to CSS pixels, so the large-text line is approximate; the page is white and the grey is exact; passing a ratio does not make a design good.
- **Sources:** WCAG 1.4.3 Contrast (Minimum), Level AA, large-scale text [A1]; the ratio computed with the WCAG formula [A17, A87].
