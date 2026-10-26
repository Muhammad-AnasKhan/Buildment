# Canvas spec: product-m4-default-or-choice

- **Course and chapter:** product-sense, 4.3 "Why defaults look generic", beat 2 ("Three choices move a page off its defaults"), right after the predict.
- **Renderer:** custom, on the reusable specimen compare (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`) with four pills. This folder holds only data. Reason: the claim is about how a screen looks, so the learner must switch between versions of one screen.
- **Claim:** A page left on framework defaults looks like any other. Changing a few things on purpose, each with a job, moves it away from the default: a type choice, a colour choice and a content choice. Each version keeps the earlier changes.
- **Model:** four versions of the room list for Ghurfa (fictional). Defaults: a plain title, three accent category pills, two room boxes with accent status pills and accent Book buttons. Type: the title is larger and the only serif line, and the room names and details use two sans sizes. Colour: category pills turn neutral, Free is green, Taken is neutral, and only the Book button of the free room uses the accent (words carry the meaning, so colour is not alone). Content: the title says "Free rooms tonight", rooms show their free hours, and the buttons name the time they book.
- **Inputs:** four pills labelled "Defaults", "Type", "Colour" and "Content". Defaults shows first.
- **What changes:** the screen and the verdict: "Framework defaults, unchanged", "Choice 1: type with a job", "Choice 2: colour with a job", "Choice 3: real content".
- **What the learner should notice:** colour is used less after the colour choice, not more; the generic words and category pills are gone after the content choice; each change can be said in one line with a reason.
- **Accessibility:** a real segmented control with a polite live region that reads the version, the screen's description and the verdict; the SVG has a title with the same text; text at least 11 units.
- **Limits (in the data):** three changes are not a recipe, a different product needs different choices, and a choice still has to pass the Good checks. Units are not pixels. Ghurfa is fictional.
- **Sources:** Tailwind CSS defaults and theme [A49, A50]; Bootstrap Reboot [A52]; use of colour [A3]; the idea that defaults are choices not made [B3].
