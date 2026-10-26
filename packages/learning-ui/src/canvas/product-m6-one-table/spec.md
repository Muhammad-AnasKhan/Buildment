# Canvas spec: product-m6-one-table

- **Course and chapter:** product-sense, 6.3 "AI as a critic: several opinions, then you decide", beat 1.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, two versions shown as a switch). This folder holds only data. Reason: the learner should see the same nine answers as three lists and as one merged table, so the table's job is visible.
- **Claim:** Give three tools the same screenshot and the same rubric, save each answer alone, then merge every point into one table with the tools that said it and the check it needs. Agreement between tools is a reason to check a point first, not a result. The method is the course's inference [B19, B53 to B56].
- **Model:** points from three invented AI critiques of Maryam's create-group screen (fictional). Three separate lists of three points each (Tool one, Tool two, Tool three). The merged table has six rows, each with the tool tags (T1, T2, T3) and a check line: button too small (T1, T2, T3: measure its height); hint too light (T1, T2: measure the contrast); rename the button (T3: does it say what happens?); too many fields (T1: ask, watch a student); seats unclear (T2: ask, watch a student); purple header (T3: drop, no problem named).
- **Versions:** 3 lists, 1 table. Verdicts: "Three lists, repeated points" (warn), "One table, one check each" (good).
- **Inputs:** tap the switch (or Tab and Enter).
- **What changes:** nine lines become six rows; repeats merge; every row gains a check.
- **What the learner should notice:** the button appears in all three lists, so it looks the most important, yet the table gives it the same kind of check as any other point. The purple header is a single mention with nothing to check.
- **Accessibility:** each version has a one-sentence alt; a polite live region reads the version, the alt and the verdict; the switch buttons are real buttons. Tool tags are words (T1, T2, T3), not colour.
- **Limits (fold):** the points are invented, not tool output. Halaqa is fictional.
- **Sources:** NN/g on AI critique [B19]; LLM-judge studies [B53 to B56]; the merged table is the course's inference.
