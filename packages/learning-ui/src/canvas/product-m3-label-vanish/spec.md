# Canvas spec: product-m3-label-vanish

- **Course and chapter:** product-sense, 3.3 "Forms people finish", beat 2.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the problem happens over time (empty, then typed), so the learner needs the same form at three moments.
- **Claim:** A placeholder disappears when the person types, so a field with only a placeholder gives no way to check what it was for. A label that stays above the field keeps working [A25, A74].
- **Model:** the same Halaqa "Start a group" form (three fields: Course, Day and time, Seats) in three versions. Empty: the words are placeholders. Typed: the fields hold "Data structures", "Tonight 8 pm" and "3", and nothing says what the last field is for. With label: the same values, each with its label above.
- **Versions:** "Empty" (warn: "Placeholders look like labels"), "Typed" (bad: "Typed: what was the 3 for?"), "With label" (good: "Labels stay visible").
- **Inputs:** three pills under the picture; the first version shown is Empty.
- **What changes:** the form and the verdict banner.
- **What the learner should notice:** the first and third forms look alike when empty. They only differ once the person has typed and wants to check.
- **Accessibility:** the pills are a real button group; a polite live region reads the version, its screen description and the verdict; text at least 11 units.
- **Limits (fold):** the reasons come from NN/g, GOV.UK and contrast rules; WCAG does not mention placeholders. Halaqa is fictional.
- **Sources:** NN/g on placeholders [A25]; GOV.UK Design System text input [A74]; WCAG 3.3.2 [A8].
