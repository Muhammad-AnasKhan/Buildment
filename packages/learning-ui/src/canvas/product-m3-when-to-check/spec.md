# Canvas spec: product-m3-when-to-check

- **Course and chapter:** product-sense, 3.3 "Forms people finish", beat 3.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the rule is about timing, so the picture must show one field at three moments.
- **Claim:** Check a field when the person leaves it, not on every key. Once an error shows, update it on each key so it clears as soon as the input is valid. Checking on leave does not replace handling errors on submit [A26, A23].
- **Model:** one field, "Group code" (two letters and three digits, for example DS201), above a "Join the group" button, on Halaqa's "Join with a code" screen. This is a separate screen from the Start a group form, which keeps its four fields (Course, When, Where, Seats). Typing: the field holds "DS2", still has focus, and already shows "Enter a group code like DS201." Left field: the same value, no focus, and the error "Group code needs 3 digits, like DS201." Fixed: the field holds "DS201", has focus again, no error, and the hint "Two letters and three digits."
- **Versions:** "Typing" (bad: "Too early: still typing"), "Left field" (good: "Checked once, after leaving"), "Fixed" (good: "Error clears as soon as fixed").
- **Inputs:** three pills under the picture; the first version shown is Typing.
- **What changes:** the field, its border and message, and the verdict banner.
- **What the learner should notice:** "DS2" is not an error while the person is still typing it. It becomes one when they leave the field with it.
- **Accessibility:** the pills are a real button group; a polite live region reads the version, its screen description and the verdict; text at least 11 units.
- **Limits (fold):** the timing comes from one research firm's usability testing with no participant count. Checks on leave do not replace checks on submit. Halaqa is fictional.
- **Sources:** Baymard on inline validation [A26]; NN/g on error messages, including not showing an error too early [A23].
