# Canvas spec: product-m5-labels-errors

- **Course and chapter:** product-sense, 5.3 "Words anyone could write", beat 4 ("Labels and errors are copy too").
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`). This folder holds only data. Reason: the learner should read the same form twice and see that only the words changed.
- **Claim:** Every word on a screen is a design choice. A title, a button and an error written by default ("Get started", "Submit", "Invalid input") could sit on a hundred forms. Words that say what happens and what to do could not [B3, A23, A74].
- **Model:** two phone screens for a pre-order form at Ehab's bakery (fictional; hours 6 am to 2 pm as in `product-m5-scene`). Both have the same two labelled fields (Loaves 2, Pickup time 9 pm) and a red error under the pickup time. Default: title "Get started", error "Invalid input", button "Submit". Specific: title "Reserve your loaves", error "Choose a time from 6 am to 2 pm.", button "Reserve my loaves".
- **Inputs:** a two-way switch (Default, Specific).
- **What changes:** the title, the error text and the button label.
- **What the learner should notice:** the structure and the labels do not change; the three pieces of copy do. The default error says neither what is wrong nor what to do.
- **Why not Wasel:** Wasel's order form and status screens are the 5.5 practice case for the Wasel route; this canvas must not solve them.
- **Accessibility:** each version has a screen-reader description and a live-region announcement; labels at most 10 characters; verdicts at most 30 characters; text at least 11 units.
- **Limits (fold):** where an error sits and when it shows belong to module 3. The bakery is invented.
- **Sources:** Anthropic's frontend-design skill on button and error words [B3]; NN/g on error messages [A23]; GOV.UK Design System text input [A74].
