# Your time, their time

Claim: a provider's repeating Monday 09:00 rule stays at 09:00 on the provider's wall clock, while its dated UTC instant may change after a clock change. Changing the viewer zone alters only the displayed label.

Inputs: provider zone (`Europe/Berlin` or `Asia/Gaza`), viewer zone (`Asia/Qatar`, `Europe/Berlin`, or `Europe/London`), and dated week (`2024-03-25` or `2024-04-01`). The local provider rule is fixed at Monday 09:00. Default: Berlin provider, Qatar viewer, 25 March 2024.

Model: use the runtime's `Intl` IANA time-zone rules to resolve the fixed local wall-clock value for the selected date, then format that same UTC instant in the viewer zone. The selected 09:00 examples are unambiguous. Do not use one permanent numeric offset for a zone. The model throws if a selected value cannot resolve exactly.

Output: provider local label, stored UTC ISO instant, viewer local label, and a text explanation of what changed across the selected weeks. The timeline and `aria-live` readouts have text equivalents.

Prediction: before moving the Berlin week, predict whether the stored UTC hour changes. Then keep the week fixed, change the viewer, and explain why UTC does not move. Transfer: the SkillSlot time-module tests must freeze the same two weeks and assert provider rule, UTC instant, and viewer label separately.

Limits: two dates and three viewer zones; no gap or overlap resolution, booking inventory, payment, or deployed server clock. A browser with stale time-zone data could disagree with a server running newer data; the production app must keep time-zone data current and test its target runtime.

Technical reference: [ECMA-402 internationalization specification](https://402.ecma-international.org/) for IANA time-zone based formatting and daylight-saving rules; [MDN `formatToParts`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts) for reading the formatted date components used by the model.
