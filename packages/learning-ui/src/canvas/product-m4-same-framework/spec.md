# Canvas spec: product-m4-same-framework

- **Course and chapter:** product-sense, 4.3 "Why defaults look generic", beat 1 ("Same framework, same start, same look").
- **Renderer:** custom, on the reusable specimen compare (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`) with two versions. This folder holds only data. Reason: the claim is that two pages look alike, which a learner sees by switching between them, not by reading a diagram of how.
- **Claim:** Two products built on the same framework with no changes look like one product, because the type scale, spacing, colours and generic words are the same. The framework did nothing wrong; unchanged defaults look like everyone else's.
- **Model:** two screens of the same shape. Rand's page lists library group rooms (title "Welcome to Library Booking", pills Quiet, Group, Online, boxes "Room 1" and "Room 2"). Omar's page lists lab printers (title "Welcome to Lab Printing", pills Black, Colour, Large, boxes "Printer 1" and "Printer 2"). Both use the same sizes, accent pills, accent Book buttons and spacing.
- **Inputs:** a two-way switch between the pages.
- **What changes:** the words on the page; everything else stays.
- **What the learner should notice:** only the nouns change. The type, spacing, colours and pill and button style are identical, so nothing on the page says what this product is for.
- **Accessibility:** the switch is a real radio group with a label; a polite live region reads the version and the verdict; each SVG has a title with the screen's description; text at least 11 units.
- **Limits (in the data):** two pages are an example, not a measurement; that unchanged defaults look alike is this course's own observation; the units are not pixels; Rand and Omar are fictional.
- **Sources:** Tailwind CSS and Bootstrap documents on their default themes [A49, A52]; a 2021 study of web layouts growing more alike, as a later paper describes it [B10].
