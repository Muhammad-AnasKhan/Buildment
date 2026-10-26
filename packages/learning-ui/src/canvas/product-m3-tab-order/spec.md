# Canvas spec: product-m3-tab-order

- **Course and chapter:** product-sense, 3.4 "Everyone can use it: access and small screens", beat 2.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data, using `pill` blocks for the numbers and the field `focus` ring. Reason: keyboard order is invisible on a normal screen. Drawing the numbers lets a learner check it by reading, on a phone with no keyboard. It replaces a four-box diagram of the Tab key.
- **Claim:** Keyboard focus must reach every control, in an order that follows the page, and the person must see where it is [A11, A5, A17].
- **Model:** Halaqa's Start a group form with the course's four fields (Course, When, Where, Seats) and the "Start the group" button. A number pill beside each control is its Tab position. In order: 1, 2, 3, 4 and 5 down the page, with the focus ring on Course. Jumps: Course 1, When 2, Where 4, Seats 3, button 5, with the ring on Seats, so focus reaches Seats before Where (a typical cause is a visual order set in CSS that differs from the page code). Skipped: Course 1 to Seats 4 and the button marked "none" in a red pill, because Tab never reaches it (a typical cause is a clickable box that is not a button).
- **Versions:** "In order" (good: "Tab order matches the page"), "Jumps" (bad: "Seats comes before Where"), "Skipped" (bad: "Tab never reaches the button").
- **Inputs:** three pills under the picture; the first version shown is In order.
- **What changes:** the numbers, the focus ring and the verdict banner.
- **What the learner should notice:** the check is reading numbers down the page. A jump or a missing number is visible without a keyboard.
- **Accessibility:** the pills are a real button group; a polite live region reads the version, its screen description (which lists every Tab number) and the verdict; the "none" pill is red and also says "none", so colour is not the only cue; text at least 11 units.
- **Limits (fold):** a real browser decides the order from the page code, and a person cannot see the numbers. They are drawn so the order can be checked by reading. Halaqa is fictional.
- **Sources:** WCAG 2.1.1 Keyboard, level A [A11]; 2.4.7 Focus Visible, level AA [A5]; new success criteria in WCAG 2.2 [A17].
