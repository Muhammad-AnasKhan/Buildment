# Canvas spec: product-m3-error-words

- **Course and chapter:** product-sense, 3.2 "Empty, loading, error: the states nobody draws", beat 4.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the four parts of a good error message are easiest to see as one message that has none of them and one that has all of them. It replaces a four-box diagram that listed the parts.
- **Claim:** A good error message sits near its cause, uses plain words about the specific problem, offers a next step and keeps what the person typed [A23, A7].
- **Model:** Halaqa's Start a group form (fictional) after a send failed on a weak connection. Vague: "Something went wrong" at the top, all four fields (Course, When, Where, Seats) empty again, and no way to try again. Specific: the four fields still hold "Data structures", "Tonight 8 pm", "Library room 2" and "3", and a message by the button says "Your group was not saved. The connection dropped. Everything you typed is kept." with a Try again button.
- **Versions:** "Vague" (bad: "No cause, no step, input lost") and "Specific" (good: "Cause, step, input kept").
- **Inputs:** the two-way switch under the picture.
- **What changes:** the message, the fields and the verdict banner.
- **What the learner should notice:** the second screen is not longer by much, yet it names the cause, gives a step, sits next to the button that failed and keeps the typing. The first screen has none of the four parts and also throws away the work.
- **Accessibility:** the switch is a real two-button group; a polite live region reads the version, its screen description and the verdict; text at least 11 units.
- **Limits (fold):** NN/g's guidance is expert advice with examples. The wording suits this fictional form. Halaqa is fictional.
- **Sources:** NN/g on error messages [A23]; WCAG 3.3.1 Error Identification, level A [A7].
