# Canvas spec: product-m3-error-templates

- **Course and chapter:** product-sense, 3.3 "Forms people finish", beat 4.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the templates are easiest to learn as three real fields with the message under each, so the learner sees the words next to their cause. It replaces a three-box diagram of templates.
- **Claim:** Error words follow a small pattern. Each message names the field and says what to do, and sits right under its field [A74, A23, A7].
- **Model:** three versions of one field of Halaqa's Start a group form, each with a message from a GOV.UK template. Missing: Course is empty, "Enter a course." Wrong: Seats holds 0, "Seats must be 1 or more." Too long: Course holds "Data structures and algorithms" (30 characters: Data 4, space 1, structures 10, space 1, and 3, space 1, algorithms 10), "Course must be 20 characters or less."
- **Versions:** "Missing" (good: "Enter [what it is]"), "Wrong" (good: "[What it is] must be [rule]"), "Too long" (good: "Must be [n] characters or less").
- **Inputs:** three pills under the picture; the first version shown is Missing.
- **What changes:** the field value, its message and the verdict banner.
- **What the learner should notice:** all three messages name the field, say the fix and sit under the field. "Invalid input" in 3.3's first picture does none of this.
- **Accessibility:** the pills are a real button group; a polite live region reads the version, its screen description and the verdict; text at least 11 units.
- **Limits (fold):** the templates come from one design system. They are a start, not the only way to write an error. Halaqa is fictional.
- **Sources:** GOV.UK Design System, text input (checked 2026-10-25) [A74]; NN/g on error messages [A23]; WCAG 3.3.1, level A [A7].
